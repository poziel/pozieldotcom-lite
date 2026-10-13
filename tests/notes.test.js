import test from 'node:test'
import assert from 'node:assert/strict'
import { createHandler, validNote, hashCreator } from '../supabase/functions/notes/handler.js'

const config = { url: 'https://example.supabase.co', serviceKey: 'server-only', turnstileSecret: 'secret', origins: 'https://poziel.com', hostnames: 'poziel.com' }
const ownerToken = 'a'.repeat(64)
const ownerHash = await hashCreator(ownerToken)
const note = { message: 'Hello!', author: '', color: 'butter', x: 12, y: 748, token: 'token' }
const request = (body = note, origin = 'https://poziel.com') => new Request('https://example.supabase.co/functions/v1/notes', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'X-Note-Creator': ownerToken }, body: JSON.stringify(body) })
const verified = { success: true, hostname: 'poziel.com', action: 'leave-note' }

test('local preview uses a separate real secret and binds verification to its hostname', async () => {
  const localConfig = { ...config, origins: `${config.origins},http://127.0.0.1:5180`, devTurnstileSecret: 'local-secret' }
  let calls = 0
  const handler = createHandler(localConfig, async (url, init) => {
    if (++calls === 1) {
      assert.equal(JSON.parse(init.body).secret, 'local-secret')
      return Response.json({ ...verified, hostname: '127.0.0.1' })
    }
    return Response.json({ ...note, id: 'saved', creator_hash: ownerHash })
  })
  assert.equal((await handler(request(note, 'http://127.0.0.1:5180'))).status, 201)
  const wrongHost = createHandler(localConfig, async () => Response.json(verified))
  assert.equal((await wrongHost(request(note, 'http://127.0.0.1:5180'))).status, 403)
  const missing = createHandler({ ...localConfig, devTurnstileSecret: undefined })
  assert.equal((await missing(request(note, 'http://127.0.0.1:5180'))).status, 503)
})

test('Turnstile HTTP 400 invalid-token responses are verification failures, not outages', async () => {
  const handler = createHandler(config, async () => Response.json({ success: false, 'error-codes': ['invalid-input-response'] }, { status: 400 }))
  assert.equal((await handler(request())).status, 403)
})

test('rejects invalid text, colors, coordinates, and missing tokens', () => {
  assert.ok(validNote(note))
  for (const changes of [{ message: ' ' }, { message: 'x'.repeat(281) }, { author: 'x'.repeat(41) }, { color: 'red' }, { x: -1000001 }, { x: 1000001 }, { y: 1000001 }, { y: -1000001 }, { x: 1.5 }, { token: '' }, { token: 'x'.repeat(2049) }]) assert.ok(!validNote({ ...note, ...changes }), JSON.stringify(changes))
})
test('fails closed for missing configuration, forbidden origin, or missing CAPTCHA', async () => {
  let calls = 0
  const fetcher = () => { calls++; throw new Error('Unexpected request') }
  assert.equal((await createHandler({}, fetcher)(request())).status, 503)
  assert.equal((await createHandler(config, fetcher)(request(note, 'https://evil.example'))).status, 403)
  assert.equal((await createHandler(config, fetcher)(request({ ...note, token: '' }))).status, 403)
  assert.equal(calls, 0)
})
test('invalid, expired/replayed, wrong-host and wrong-action CAPTCHA never reach storage', async () => {
  for (const verification of [{ success: false, 'error-codes': ['timeout-or-duplicate'] }, { ...verified, hostname: 'evil.example' }, { ...verified, action: 'another-form' }]) {
    let calls = 0
    const handler = createHandler(config, async () => { calls++; return Response.json(verification) })
    assert.equal((await handler(request())).status, 403)
    assert.equal(calls, 1)
  }
})
test('valid CAPTCHA is verified before inserting sanitized note, with no token persisted', async () => {
  const calls = []
  const stored = { ...note, id: 'note-id', creator_hash: ownerHash }
  delete stored.token
  const handler = createHandler(config, async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) })
    return Response.json(calls.length === 1 ? verified : stored)
  })
  const response = await handler(request({ ...note, message: ' Hello! ', author: ' Alex ' }))
  assert.equal(response.status, 201)
  const publicResult = await response.json()
  assert.equal(publicResult.canEdit, true)
  assert.equal(publicResult.message, stored.message)
  assert.ok(!('creator_hash' in publicResult))
  assert.equal(calls[0].url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify')
  assert.deepEqual(calls[1].body, { note_message: 'Hello!', note_author: 'Alex', note_color: 'butter', note_x: 12, note_y: 748, note_angle: 0, owner_hash: ownerHash })
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://poziel.com')
})
test('enforces actual body size and malformed JSON', async () => {
  const handler = createHandler(config, () => { throw new Error('Unexpected request') })
  assert.equal((await handler(request({ message: 'x'.repeat(9000) }))).status, 413)
  assert.equal((await handler(new Request('https://example.com', { method: 'POST', headers: { Origin: config.origins, 'Content-Type': 'application/json', 'X-Note-Creator': ownerToken }, body: '{' }))).status, 400)
})
test('returns safe errors for service outages, hourly limits and full board', async () => {
  assert.equal((await createHandler(config, async () => { throw new Error('secret database details') })(request())).status, 503)
  for (const [message, status] of [['RATE_LIMITED', 429], ['BOARD_FULL', 409], ['secret SQL error', 503]]) {
    let calls = 0
    const handler = createHandler(config, async () => ++calls === 1 ? Response.json(verified) : Response.json({ message }, { status: 400 }))
    const response = await handler(request())
    assert.equal(response.status, status)
    assert.ok(!(await response.text()).includes('SQL'))
  }
})
test('GET returns shared notes and preflight succeeds only for permitted origins', async () => {
  const handler = createHandler(config, async () => Response.json([{ id: 'shared', angle: 0, canEdit: false }]))
  const response = await handler(new Request('https://example.com', { headers: { Origin: config.origins } }))
  assert.deepEqual(await response.json(), [{ id: 'shared', angle: 0, canEdit: false }])
  assert.equal((await handler(new Request('https://example.com', { method: 'OPTIONS', headers: { Origin: config.origins } }))).status, 204)
})



test('GET computes ownership per browser and never exposes creator hashes', async () => {
  const handler = createHandler(config, async () => Response.json([
    { id: 'mine', creator_hash: ownerHash }, { id: 'theirs', creator_hash: await hashCreator('b'.repeat(64)) }, { id: 'legacy', creator_hash: null },
  ]))
  const response = await handler(new Request('https://example.com', { headers: { Origin: config.origins, 'X-Note-Creator': ownerToken } }))
  assert.deepEqual(await response.json(), [{ id: 'mine', angle: 0, canEdit: true }, { id: 'theirs', angle: 0, canEdit: false }, { id: 'legacy', angle: 0, canEdit: false }])
})
test('forged canEdit and creator_hash cannot authorize an edit; server derives owner hash from credential', async () => {
  const id = '11111111-1111-4111-8111-111111111111'
  let calls = 0
  const handler = createHandler(config, async (url, init) => {
    if (++calls === 1) return Response.json(verified)
    assert.ok(url.endsWith('/rpc/edit_visitor_note'))
    assert.equal(JSON.parse(init.body).owner_hash, await hashCreator('b'.repeat(64)))
    assert.equal(JSON.parse(init.body).note_id, id)
    return Response.json({ message: 'NOT_OWNER' }, { status: 400 })
  })
  const response = await handler(new Request('https://example.com', { method: 'PATCH', headers: { Origin: config.origins, 'Content-Type': 'application/json', 'X-Note-Creator': 'b'.repeat(64) }, body: JSON.stringify({ ...note, id, canEdit: true, creator_hash: ownerHash }) }))
  assert.equal(response.status, 403)
})
test('owner edits succeed and missing cookie edits fail before storage', async () => {
  const id = '11111111-1111-4111-8111-111111111111'
  const makeRequest = token => new Request('https://example.com', { method: 'PATCH', headers: { Origin: config.origins, 'Content-Type': 'application/json', ...(token ? { 'X-Note-Creator': token } : {}) }, body: JSON.stringify({ ...note, id }) })
  let calls = 0
  const handler = createHandler(config, async () => ++calls === 1 ? Response.json(verified) : Response.json({ ...note, id, creator_hash: ownerHash }))
  assert.equal((await handler(makeRequest(''))).status, 403)
  assert.equal(calls, 0)
  const response = await handler(makeRequest(ownerToken))
  assert.equal(response.status, 200)
  const result = await response.json()
  assert.equal(result.canEdit, true)
  assert.equal(result.id, id)
  assert.ok(!('creator_hash' in result))
  assert.ok(!('token' in result))
})


test('verified browser skips CAPTCHA for 30 minutes without extending the session', async () => {
  let captchaCalls = 0
  const handler = createHandler(config, async url => {
    if (url.includes('siteverify')) { captchaCalls++; return Response.json(verified) }
    return Response.json({ id: 'new', ...note, creator_hash: ownerHash, angle: 23.5 })
  })
  const first = await handler(request({ ...note, angle: 23.5 }))
  assert.equal(first.status, 201)
  const session = first.headers.get('X-Note-Verification')
  const expires = Number(first.headers.get('X-Note-Verified-Until'))
  assert.ok(session)
  assert.ok(Math.abs(expires - Date.now() - 1800000) < 2000)
  const second = await handler(new Request('https://example.com', { method: 'POST', headers: { Origin: config.origins, 'Content-Type': 'application/json', 'X-Note-Creator': ownerToken, 'X-Note-Verification': session }, body: JSON.stringify({ ...note, token: '', angle: 23.5 }) }))
  assert.equal(second.status, 201)
  assert.equal(captchaCalls, 1)
  assert.equal(second.headers.get('X-Note-Verified-Until'), String(expires))
  assert.equal((await second.json()).angle, 23.5)
})
test('forged and expired verification sessions require CAPTCHA again', async () => {
  const { issueVerification } = await import('../supabase/functions/notes/verification-session.js')
  const expired = await issueVerification(config.serviceKey, ownerHash, config.origins, Date.now() - 1800001)
  for (const credential of [expired.token, 'forged.verified', (await issueVerification('wrong-secret', ownerHash, config.origins)).token]) {
    const handler = createHandler(config, async () => { throw new Error('No backend request expected') })
    const response = await handler(new Request('https://example.com', { method: 'POST', headers: { Origin: config.origins, 'Content-Type': 'application/json', 'X-Note-Creator': ownerToken, 'X-Note-Verification': credential }, body: JSON.stringify({ ...note, token: '' }) }))
    assert.equal(response.status, 403)
    assert.equal((await response.json()).code, 'VERIFICATION_REQUIRED')
  }
})
test('rotation accepts bounded numeric angles only', () => {
  for (const angle of [-180, -25.5, 0, 27.9, 180]) assert.ok(validNote({ ...note, angle }))
  for (const angle of [-181, 181, NaN, Infinity, '10', null]) assert.ok(!validNote({ ...note, angle }))
})

test('deletion derives ownership server-side and does not trust flags or body hashes', async () => {
  const id = '11111111-1111-4111-8111-111111111111'
  const makeRequest = token => new Request('https://example.com', { method: 'DELETE', headers: { Origin: config.origins, 'Content-Type': 'application/json', ...(token ? { 'X-Note-Creator': token } : {}) }, body: JSON.stringify({ id, canEdit: true, creator_hash: ownerHash }) })
  let calls = 0
  const handler = createHandler(config, async (url, init) => {
    calls++
    assert.ok(url.endsWith('/rpc/delete_visitor_note'))
    const args = JSON.parse(init.body)
    assert.equal(args.note_id, id)
    assert.deepEqual(Object.keys(args).sort(), ['note_id', 'owner_hash'])
    return args.owner_hash === ownerHash ? Response.json(id) : Response.json({ message: 'NOT_OWNER' }, { status: 400 })
  })
  assert.equal((await handler(makeRequest(''))).status, 403)
  assert.equal(calls, 0)
  assert.equal((await handler(makeRequest('b'.repeat(64)))).status, 403)
  const success = await handler(makeRequest(ownerToken))
  assert.equal(success.status, 200)
  assert.deepEqual(await success.json(), { id })
  assert.equal(calls, 2)
})
test('deletion rejects invalid IDs and safely reports backend failures', async () => {
  const makeRequest = id => new Request('https://example.com', { method: 'DELETE', headers: { Origin: config.origins, 'Content-Type': 'application/json', 'X-Note-Creator': ownerToken }, body: JSON.stringify({ id }) })
  const handler = createHandler(config, async () => { throw new Error('Private database error') })
  assert.equal((await handler(makeRequest('not-a-note'))).status, 400)
  const response = await handler(makeRequest('11111111-1111-4111-8111-111111111111'))
  assert.equal(response.status, 503)
  assert.ok(!(await response.text()).includes('Private'))
})
