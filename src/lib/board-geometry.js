export const coordinateLimit = 1000000
export const noteWidth = 288
export const clampCoordinate = value => Math.max(-coordinateLimit, Math.min(coordinateLimit, value))
export function clampPosition(x, y) {
  return { x: Math.round(clampCoordinate(x)), y: Math.round(clampCoordinate(y)) }
}
export function screenToWorld(point, camera, viewport, zoom = 1) {
  return { x: (point.x - viewport.width / 2) / zoom + camera.x, y: (point.y - viewport.height / 2) / zoom + camera.y }
}
export const clampZoom = value => Math.max(.1, Math.min(2, value))
export function gridAppearance(zoom) {
  const step = 24 * 2 ** Math.max(0, Math.ceil(Math.log2(1 / zoom)))
  return { spacing: step * zoom, opacity: .18 / (1 + .65 * Math.abs(Math.log2(zoom))) }
}
export function zoomAround(point, camera, viewport, oldZoom, newZoom) {
  const world = screenToWorld(point, camera, viewport, oldZoom)
  return { x: clampCoordinate(world.x - (point.x - viewport.width / 2) / newZoom), y: clampCoordinate(world.y - (point.y - viewport.height / 2) / newZoom) }
}
export function edgeVelocity(point, size) {
  const margin = Math.min(72, size / 4)
  if (point < margin) return -Math.min(900, (margin - point) / margin * 900)
  if (point > size - margin) return Math.min(900, (point - size + margin) / margin * 900)
  return 0
}
