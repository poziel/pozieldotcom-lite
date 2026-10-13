import test from 'node:test'
import assert from 'node:assert/strict'
import { noteAppearance, noteColors } from '../src/lib/note-colors.js'
import { validColor } from '../supabase/functions/notes/handler.js'

test('presets and six-digit custom colors are accepted; CSS expressions are rejected', () => {
  for (const color of [...noteColors, '#000000', '#FFFFFF', '#1a2B3c']) assert.ok(validColor(color), color)
  for (const color of ['red', '#fff', '#12345678', 'url(https://example.com)', 'var(--color)', '#12345g', null, {}, 'butter; color:red']) assert.ok(!validColor(color), String(color))
})
test('custom dark and light papers receive readable text and unknown colors fall back', () => {
  assert.deepEqual(noteAppearance('#000000'), { '--note-color': '#000000', '--note-ink': '#ffffff' })
  assert.deepEqual(noteAppearance('#ffffff'), { '--note-color': '#ffffff', '--note-ink': '#181818' })
  assert.equal(noteAppearance('sky')['--note-color'], '#afd3ee')
  assert.equal(noteAppearance('invalid')['--note-color'], '#f4df86')
})
