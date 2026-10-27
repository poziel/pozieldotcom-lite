import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadGithubStars, starCacheLifetime } from '../src/lib/github-stars.js'

const now = 10_000_000
test('repository push dates are cached and retained during outages', async () => {
  const storage = cache()
  const pushedAt = '2026-10-27T12:00:00Z'
  const first = await loadGithubStars('poziel/frame', {
    storage, now,
    fetcher: async () => ({ ok: true, json: async () => ({ stargazers_count: 2, pushed_at: pushedAt }) }),
  })
  assert.equal(first.pushedAt, pushedAt)
  const cached = await loadGithubStars('poziel/frame', { storage, now: now + 1, fetcher: () => { throw new Error('offline') } })
  assert.equal(cached.pushedAt, pushedAt)
  const stale = await loadGithubStars('poziel/frame', { storage, now: now + starCacheLifetime, fetcher: () => { throw new Error('offline') } })
  assert.equal(stale.pushedAt, pushedAt)
  assert.equal(stale.stale, true)
})
const response = (count) => ({ ok: true, json: async () => ({ stargazers_count: count }) })
function cache(initial = null) {
  let value = initial
  return { getItem: () => value, setItem: (_, next) => { value = next } }
}

test('zero stars is a valid result and fresh cache avoids another request', async () => {
  const storage = cache()
  let requests = 0
  const fetcher = async (url, options) => {
    requests++
    assert.equal(url, 'https://api.github.com/repos/poziel/refinimo')
    assert.equal(options.headers.Authorization, undefined)
    return response(0)
  }
  const first = await loadGithubStars('poziel/refinimo', { fetcher, storage, now })
  const second = await loadGithubStars('poziel/refinimo', { fetcher, storage, now: now + 1 })
  assert.deepEqual(first, { count: 0, updatedAt: now, stale: false })
  assert.deepEqual(second, first)
  assert.equal(requests, 1)
})

test('expired counts are refreshed and replaced', async () => {
  const storage = cache(JSON.stringify({ count: 1, updatedAt: now - starCacheLifetime }))
  const result = await loadGithubStars('poziel/refinimo', { storage, now, fetcher: async () => response(2) })
  assert.equal(result.count, 2)
  assert.equal(result.stale, false)
  assert.equal(JSON.parse(storage.getItem()).updatedAt, now)
})

test('404, rate limits, offline errors, and invalid data never become zero', async () => {
  for (const fetcher of [
    async () => ({ ok: false, status: 404 }),
    async () => ({ ok: false, status: 403 }),
    async () => { throw new Error('offline') },
    async () => response(-1),
    async () => response('12'),
    async () => ({ ok: true, json: async () => { throw new Error('invalid JSON') } }),
  ]) {
    assert.equal((await loadGithubStars('poziel/localdev', { now, fetcher })).count, null)
    const storage = cache(JSON.stringify({ count: 7, updatedAt: now - starCacheLifetime }))
    const fallback = await loadGithubStars('poziel/localdev', { storage, now, fetcher })
    assert.equal(fallback.count, 7)
    assert.equal(fallback.stale, true)
  }
})

test('unavailable results briefly cache failures and retry after a minute', async () => {
  const storage = cache()
  let requests = 0
  const fetcher = async () => { requests++; return { ok: false } }
  await loadGithubStars('poziel/localdev', { fetcher, storage, now })
  await loadGithubStars('poziel/localdev', { fetcher, storage, now: now + 59_000 })
  assert.equal(requests, 1)
  await loadGithubStars('poziel/localdev', { fetcher, storage, now: now + 60_000 })
  assert.equal(requests, 2)
})

test('blocked or corrupt storage does not prevent a successful request', async () => {
  for (const storage of [
    { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') } },
    cache('not json'),
    cache(JSON.stringify({ count: -2, updatedAt: now })),
  ]) {
    assert.equal((await loadGithubStars('poziel/refinimo', { storage, now, fetcher: async () => response(3) })).count, 3)
  }
})

test('a stalled request times out without breaking the project list', async () => {
  const fetcher = (_, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
  })
  assert.equal((await loadGithubStars('poziel/refinimo', { fetcher, now, timeoutMs: 5 })).count, null)
})
