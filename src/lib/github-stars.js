const cachePrefix = 'poziel:github-stars:v2:'
export const starCacheLifetime = 60 * 60 * 1000
const unavailableCacheLifetime = 60 * 1000
const empty = () => ({ count: null, updatedAt: null, stale: false })
const validCount = (count) => Number.isSafeInteger(count) && count >= 0

// Public metadata only: never put a GitHub token in the browser bundle.
export async function loadGithubStars(repository, {
  fetcher = globalThis.fetch,
  storage,
  now = Date.now(),
  timeoutMs = 5000,
} = {}) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) return empty()
  const key = `${cachePrefix}${repository}`
  let cached
  try {
    const value = JSON.parse(storage?.getItem(key) ?? 'null')
    if (value && (value.count === null || validCount(value.count))
      && Number.isFinite(value.updatedAt) && value.updatedAt >= 0 && value.updatedAt <= now) {
      cached = value
      const lifetime = value.count === null ? unavailableCacheLifetime : starCacheLifetime
      if (now - value.updatedAt < lifetime) return { ...value, stale: false }
    }
  } catch { /* Storage can be blocked or contain old data. */ }

  const save = (value) => {
    try { storage?.setItem(key, JSON.stringify(value)) } catch { /* Counts still render. */ }
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetcher(`https://api.github.com/repos/${repository}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    })
    if (!response.ok) throw new Error('Repository metadata unavailable')
    const data = await response.json()
    if (!validCount(data.stargazers_count)) throw new Error('Invalid star count')
    const result = { count: data.stargazers_count, updatedAt: now }
    if (typeof data.pushed_at === 'string' && Number.isFinite(Date.parse(data.pushed_at))) {
      result.pushedAt = data.pushed_at
    }
    save(result)
    return { ...result, stale: false }
  } catch {
    // Keep a known count during an outage; missing counts must not look like zero.
    if (cached && validCount(cached.count)) return { ...cached, stale: true }
    const result = { count: null, updatedAt: now }
    save(result)
    return { ...result, stale: false }
  } finally {
    clearTimeout(timeout)
  }
}
