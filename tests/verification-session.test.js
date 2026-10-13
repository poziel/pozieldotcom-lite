import test from 'node:test'
import assert from 'node:assert/strict'
import { issueVerification, validateVerification } from '../supabase/functions/notes/verification-session.js'

test('signed verification binds to owner, exact origin, signing key, and fixed expiry', async () => {
  const now = 1000000
  const session = await issueVerification('secret', 'owner', 'https://poziel.com', now)
  assert.equal(session.expires, now + 1800000)
  assert.ok(await validateVerification(session.token, 'secret', 'owner', 'https://poziel.com', now + 1799999))
  assert.equal(await validateVerification(session.token, 'secret', 'owner', 'https://poziel.com', session.expires), null)
  assert.equal(await validateVerification(session.token, 'other-secret', 'owner', 'https://poziel.com', now), null)
  assert.equal(await validateVerification(session.token, 'secret', 'another-owner', 'https://poziel.com', now), null)
  assert.equal(await validateVerification(session.token, 'secret', 'owner', 'http://localhost:5180', now), null)
  const [payload, signature] = session.token.split('.')
  const forged = btoa(JSON.stringify({ owner: 'owner', origin: 'https://poziel.com', expires: now + 3600000 })).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
  assert.equal(await validateVerification(`${forged}.${signature}`, 'secret', 'owner', 'https://poziel.com', now), null)
  assert.equal(await validateVerification(`${payload}.invalid`, 'secret', 'owner', 'https://poziel.com', now), null)
})
