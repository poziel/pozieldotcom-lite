const encoder = new TextEncoder()
const encode = bytes => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
const decode = value => Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), char => char.charCodeAt(0))
const lifetime = 30 * 60 * 1000
async function signingKey(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(`poziel-note-verification-v1:${secret}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}
export async function issueVerification(secret, owner, origin, now = Date.now()) {
  const expires = now + lifetime
  const payload = encode(encoder.encode(JSON.stringify({ owner, origin, expires })))
  const signature = await crypto.subtle.sign('HMAC', await signingKey(secret), encoder.encode(payload))
  return { token: `${payload}.${encode(new Uint8Array(signature))}`, expires }
}
export async function validateVerification(token, secret, owner, origin, now = Date.now()) {
  if (!token || token.length > 2048 || !owner) return null
  try {
    const [payload, signature, extra] = token.split('.')
    if (!payload || !signature || extra) return null
    if (!await crypto.subtle.verify('HMAC', await signingKey(secret), decode(signature), encoder.encode(payload))) return null
    const data = JSON.parse(new TextDecoder().decode(decode(payload)))
    return data.owner === owner && data.origin === origin && Number.isFinite(data.expires) && data.expires > now && data.expires <= now + lifetime ? { token, expires: data.expires } : null
  } catch { return null }
}
