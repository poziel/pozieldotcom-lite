import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sortProjectsByUpdate } from '../src/lib/project-order.js'

test('latest pushes sort first, with missing and invalid dates last in original order', () => {
  const projects = ['missing', 'older', 'invalid', 'newer', 'equal'].map(repository => ({ repository }))
  const metadata = {
    older: { pushedAt: '2026-10-01T12:00:00Z' },
    newer: { pushedAt: '2026-10-27T12:00:00Z' },
    equal: { pushedAt: '2026-10-27T12:00:00Z' },
    invalid: { pushedAt: 'invalid' },
  }
  assert.deepEqual(sortProjectsByUpdate(projects, metadata).map(p => p.repository), ['newer', 'equal', 'older', 'missing', 'invalid'])
  assert.equal(projects[0].repository, 'missing')
  assert.deepEqual(sortProjectsByUpdate(projects, {}), projects)
})
