import test from 'node:test'
import assert from 'node:assert/strict'
import { sortNotes } from '../src/lib/note-order.js'

test('drawer sorts owned notes first, then newest dates within each group', () => {
  const notes = [
    { id: 'other-new', canEdit: false, created_at: '2026-10-13T15:00:00Z' },
    { id: 'mine-old', canEdit: true, created_at: '2026-10-10T15:00:00Z' },
    { id: 'other-old', canEdit: false, created_at: '2026-10-09T15:00:00Z' },
    { id: 'mine-new', canEdit: true, created_at: '2026-10-12T15:00:00Z' },
  ]
  assert.deepEqual(sortNotes(notes).map(note => note.id), ['mine-new', 'mine-old', 'other-new', 'other-old'])
  assert.equal(notes[0].id, 'other-new')
})
