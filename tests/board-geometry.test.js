import test from 'node:test'
import assert from 'node:assert/strict'
import { clampPosition, screenToWorld, edgeVelocity } from '../src/lib/board-geometry.js'
import { validNote } from '../supabase/functions/notes/handler.js'

test('the viewport center is the world origin, and panning preserves world coordinates', () => {
  const viewport = { width: 1200, height: 800 }
  assert.deepEqual(screenToWorld({ x: 600, y: 400 }, { x: 0, y: 0 }, viewport), { x: 0, y: 0 })
  assert.deepEqual(screenToWorld({ x: 500, y: 350 }, { x: 100, y: 50 }, viewport), { x: 0, y: 0 })
  assert.deepEqual(screenToWorld({ x: 0, y: 0 }, { x: -1000, y: -1000 }, viewport), { x: -1600, y: -1400 })
})
test('all four quadrants are accepted consistently by client and server', () => {
  for (const x of [-1000000, -5000, 0, 5000, 1000000]) {
    for (const y of [-1000000, -5000, 0, 5000, 1000000]) {
      assert.deepEqual(clampPosition(x, y), { x, y })
      assert.ok(validNote({ x, y, message: 'Hello', author: '', token: 'verified', color: 'mint' }))
    }
  }
  assert.deepEqual(clampPosition(-Infinity, Infinity), { x: -1000000, y: 1000000 })
})
test('edge scrolling continues outside the viewport, is bounded, and stops away from edges', () => {
  assert.equal(edgeVelocity(300, 600), 0)
  assert.ok(edgeVelocity(30, 600) < 0)
  assert.ok(edgeVelocity(570, 600) > 0)
  assert.equal(edgeVelocity(-1000, 600), -900)
  assert.equal(edgeVelocity(1600, 600), 900)
})

test('zoom keeps the world point beneath the cursor fixed and respects limits', async () => {
  const { zoomAround, clampZoom } = await import('../src/lib/board-geometry.js')
  const viewport = { width: 1200, height: 800 }
  const camera = { x: -12500, y: 3000 }
  const cursor = { x: 900, y: 125 }
  const before = screenToWorld(cursor, camera, viewport, .5)
  const afterCamera = zoomAround(cursor, camera, viewport, .5, 1.8)
  const after = screenToWorld(cursor, afterCamera, viewport, 1.8)
  assert.ok(Math.abs(before.x - after.x) < .000001)
  assert.ok(Math.abs(before.y - after.y) < .000001)
  assert.equal(clampZoom(.01), .1)
  assert.equal(clampZoom(10), 2)
  assert.deepEqual(zoomAround({ x: 600, y: 400 }, camera, viewport, 1, 2), camera)
})

test('adaptive grid stays sparse at every zoom level and dims away from 100 percent', async () => {
  const { gridAppearance } = await import('../src/lib/board-geometry.js')
  for (let zoom = .1; zoom <= 2; zoom += .01) {
    const grid = gridAppearance(zoom)
    assert.ok(grid.spacing >= 24 - .000001 && grid.spacing <= 48 + .000001)
    assert.ok(grid.opacity > 0 && grid.opacity <= .18)
  }
  assert.ok(gridAppearance(.1).opacity < gridAppearance(1).opacity)
  assert.ok(gridAppearance(2).opacity < gridAppearance(1).opacity)
})
