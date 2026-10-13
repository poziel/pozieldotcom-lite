import { issueVerification, validateVerification } from './verification-session.js'

const colors = new Set(['butter', 'rose', 'lavender', 'mint', 'sky', 'peach'])
export const validColor = value => typeof value === 'string' && (colors.has(value) || /^#[0-9a-f]{6}$/i.test(value))
export async function hashCreator(token) {
  if (!/^[a-f0-9]{64}$/.test(token || '')) return null
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}
function publicNote(note, creatorHash) {
  const { id, message, author, color, x, y, created_at, updated_at, angle } = note
  return { id, message, author, color, x, y, created_at, updated_at, angle: angle ?? 0, canEdit: Boolean(creatorHash && note.creator_hash === creatorHash) }
}
export function validNote(body, requireCaptcha = true) {
  return body && typeof body.message === 'string' && body.message.trim().length > 0 && body.message.length <= 280
    && typeof body.author === 'string' && body.author.length <= 40 && validColor(body.color)
    && Number.isInteger(body.x) && body.x >= -1000000 && body.x <= 1000000
    && Number.isInteger(body.y) && body.y >= -1000000 && body.y <= 1000000
    && (body.angle === undefined || (Number.isFinite(body.angle) && body.angle >= -180 && body.angle <= 180))
    && typeof body.token === 'string' && (!requireCaptcha || body.token.length > 0) && body.token.length <= 2048
}
export function createHandler(config, fetcher = fetch) {
  const origins = (config.origins || '').split(',').map(value => value.trim()).filter(Boolean)
  const hostnames = (config.hostnames || '').split(',').map(value => value.trim()).filter(Boolean)
  return async (request) => {
    const origin = request.headers.get('Origin') || ''
    let originHostname = ''
    try { originHostname = new URL(origin).hostname } catch { /* Rejected by the origin allowlist below. */ }
    const localPreview = ['localhost', '127.0.0.1'].includes(originHostname)
    const verificationSecret = localPreview ? config.devTurnstileSecret : config.turnstileSecret
    const verificationHostnames = localPreview ? [originHostname] : hostnames.filter(host => !['localhost', '127.0.0.1'].includes(host))
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin' }
    if (origins.includes(origin)) Object.assign(headers, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'apikey, content-type, x-note-creator, x-note-verification',
      'Access-Control-Expose-Headers': 'x-note-verification, x-note-verified-until',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    })
    const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers })
    if (!config.url || !config.serviceKey || !config.turnstileSecret || !origins.length || !hostnames.length) return reply({ error: 'The board is not ready yet.' }, 503)
    if (!origins.includes(origin)) return reply({ error: 'Origin not allowed.' }, 403)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
    if (!['GET', 'POST', 'PATCH'].includes(request.method)) return reply({ error: 'Method not allowed.' }, 405)
    const dbHeaders = { apikey: config.serviceKey, Authorization: `Bearer ${config.serviceKey}`, 'Content-Type': 'application/json' }
    try {
      const creatorHash = await hashCreator(request.headers.get('X-Note-Creator'))
      let session = await validateVerification(request.headers.get('X-Note-Verification'), config.serviceKey, creatorHash, origin)
      const attachSession = () => {
        if (session) { headers['X-Note-Verification'] = session.token; headers['X-Note-Verified-Until'] = String(session.expires) }
      }
      attachSession()
      if (request.method === 'GET') {
        const response = await fetcher(`${config.url}/rest/v1/visitor_notes?select=id,message,author,color,x,y,angle,created_at,updated_at,creator_hash&order=created_at.asc&limit=1000`, { headers: dbHeaders, signal: AbortSignal.timeout(10000) })
        if (!response.ok) throw new Error('Database read failed')
        return reply((await response.json()).map(note => publicNote(note, creatorHash)))
      }
      if (!creatorHash) return reply({ error: 'A valid creator cookie is required to save a note.' }, 403)
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply({ error: 'Expected JSON.' }, 415)
      // Bound the actual stream, not just the caller-controlled Content-Length.
      const reader = request.body?.getReader()
      if (!reader) return reply({ error: 'A note is required.' }, 400)
      const chunks = []
      let size = 0
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        size += value.byteLength
        if (size > 8192) { await reader.cancel(); return reply({ error: 'The note is too large.' }, 413) }
        chunks.push(value)
      }
      const bytes = new Uint8Array(size)
      let offset = 0
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
      let body
      try { body = JSON.parse(new TextDecoder().decode(bytes)) }
      catch { return reply({ error: 'Invalid note.' }, 400) }
      if (!session && !body.token) return reply({ error: 'Please verify again to save your note.', code: 'VERIFICATION_REQUIRED' }, 403)
      if (!validNote(body, !session)) return reply({ error: 'Check your note, its position, and the verification.' }, 400)
      if (!verificationSecret) return reply({ error: 'Verification is not configured for this preview.' }, 503)
      const updating = request.method === 'PATCH'
      if (updating && !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(body.id || '')) return reply({ error: 'Invalid note ID.' }, 400)
      if (!session) {
      const check = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: verificationSecret, response: body.token }), signal: AbortSignal.timeout(10000),
      })
      const verification = await check.json()
      const verificationErrors = verification['error-codes'] || []
      if (verificationErrors.some(code => ['missing-input-secret', 'invalid-input-secret', 'internal-error'].includes(code))) {
        console.warn('Turnstile verification unavailable', { status: check.status, codes: verificationErrors })
        throw new Error('Verification unavailable')
      }
      if (!check.ok && !verificationErrors.some(code => ['invalid-input-response', 'missing-input-response', 'timeout-or-duplicate'].includes(code))) {
        console.warn('Turnstile verification unavailable', { status: check.status, codes: verificationErrors })
        throw new Error('Verification unavailable')
      }
      if (!verification.success || verification.action !== 'leave-note' || !verificationHostnames.includes(verification.hostname)) return reply({ error: 'Please complete the verification again.', code: 'VERIFICATION_REQUIRED' }, 403)
      session = await issueVerification(config.serviceKey, creatorHash, origin)
      attachSession()
      }
      const response = await fetcher(`${config.url}/rest/v1/rpc/${updating ? 'edit_visitor_note' : 'pin_visitor_note'}`, {
        method: 'POST', headers: dbHeaders, signal: AbortSignal.timeout(10000),
        body: JSON.stringify({ note_message: body.message.trim(), note_author: body.author.trim(), note_color: body.color, note_x: body.x, note_y: body.y, note_angle: body.angle ?? 0, owner_hash: creatorHash, ...(updating ? { note_id: body.id } : {}) }),
      })
      const result = await response.json()
      if (!response.ok) {
        if (result.message?.includes('NOT_OWNER')) return reply({ error: 'This browser does not have permission to edit that note.' }, 403)
        if (result.message?.includes('RATE_LIMITED')) return reply({ error: 'Lots of hellos right now! Please try again in an hour.' }, 429)
        if (result.message?.includes('BOARD_FULL')) return reply({ error: 'The board is full for now. Please come back later.' }, 409)
        throw new Error('Database write failed')
      }
      return reply(publicNote(result, creatorHash), updating ? 200 : 201)
    } catch {
      return reply({ error: 'The board is unavailable. Please try again shortly.' }, 503)
    }
  }
}
