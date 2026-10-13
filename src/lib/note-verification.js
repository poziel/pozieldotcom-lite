const storageKey = 'poziel_note_verification'
export function getVerification() {
  try {
    const session = JSON.parse(localStorage.getItem(storageKey))
    return typeof session?.token === 'string' && session.token.length < 2048 && Number.isFinite(session.expires) && session.expires > Date.now() ? session : null
  } catch { return null }
}
export function storeVerification(session) {
  try {
    if (session) localStorage.setItem(storageKey, JSON.stringify(session))
    else localStorage.removeItem(storageKey)
  } catch { /* Verification still works when storage is unavailable. */ }
}
