const cookieName = 'poziel_note_creator'
const tokenPattern = /^[a-f0-9]{64}$/

export function creatorToken(create = false) {
  let token = document.cookie.split('; ').find(value => value.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1)
  if (!tokenPattern.test(token || '')) {
    if (!create) return ''
    token = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('')
  }
  // Refresh the browser's maximum cookie lifetime on visits; never send this token to public APIs.
  document.cookie = `${cookieName}=${token}; Path=/; Max-Age=34560000; SameSite=Strict${location.protocol === 'https:' ? '; Secure' : ''}`
  if (!document.cookie.split('; ').includes(`${cookieName}=${token}`)) {
    if (create) throw new Error('Allow cookies for this site before posting so you can edit your note later.')
    return ''
  }
  return token
}
