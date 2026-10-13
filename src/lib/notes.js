import { creatorToken } from './note-owner.js'
import { ref } from 'vue'
import { getVerification, storeVerification } from './note-verification.js'

export const verifiedUntil = ref(getVerification()?.expires || 0)
export function clearVerification() { storeVerification(null); verifiedUntil.value = 0 }

export { noteColors } from './note-colors.js'
const endpoint = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY
export const boardConfigured = Boolean(endpoint && key && siteKey)
export async function noteRequest(method = 'GET', payload) {
  const creator = creatorToken(method === 'POST')
  const session = creator ? getVerification() : null
  if (method === 'PATCH' && !creator) throw new Error('The cookie for this note is missing. You can no longer edit it in this browser.')
  const response = await fetch(`${endpoint}/functions/v1/notes`, {
    method,
    headers: { apikey: key, 'Content-Type': 'application/json', ...(creator ? { 'X-Note-Creator': creator } : {}), ...(session ? { 'X-Note-Verification': session.token } : {}) },
    body: payload ? JSON.stringify(payload) : undefined,
    signal: AbortSignal.timeout(20000),
  })
  const result = await response.json()
  const verification = response.headers.get('X-Note-Verification')
  const expires = Number(response.headers.get('X-Note-Verified-Until'))
  if (verification && expires > Date.now()) { storeVerification({ token: verification, expires }); verifiedUntil.value = expires }
  else if (response.ok || result.code === 'VERIFICATION_REQUIRED') clearVerification()
  if (!response.ok) { const error = new Error(result.error || 'The board is unavailable. Please try again.'); error.code = result.code; throw error }
  return result
}
