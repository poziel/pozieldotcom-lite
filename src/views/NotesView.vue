<script setup>
import { computed, nextTick, onMounted, onBeforeUnmount, ref } from 'vue'
import NoteCaptcha from '../components/NoteCaptcha.vue'
import NoteActions from '../components/NoteActions.vue'
import { sortNotes } from '../lib/note-order.js'
import { boardConfigured, noteColors, noteRequest, verifiedUntil, clearVerification } from '../lib/notes.js'
import { noteAppearance } from '../lib/note-colors.js'
import { clampPosition, clampCoordinate, screenToWorld, edgeVelocity, noteWidth, clampZoom, zoomAround, gridAppearance } from '../lib/board-geometry.js'
import '../notes.css'

const notes = ref([])
const loading = ref(false)
const loadError = ref('')
const error = ref('')
const status = ref('')
const editing = ref(false)
const editingId = ref(null)
const posting = ref(false)
const verifying = ref(false)
const verificationDialog = ref(null)
const zoom = ref(1)
const angle = ref(0)
const canvasTool = ref(false)
const now = ref(Date.now())
const verificationMinutes = computed(() => Math.min(30, Math.max(0, Math.ceil((verifiedUntil.value - now.value) / 60000))))
let verificationTimer
const message = ref('')
const author = ref('')
const color = ref('butter')
const customColor = ref('#a8c8ff')
function chooseCustomColor(event) { customColor.value = event.target.value; color.value = event.target.value }
const position = ref({ x: -144, y: -180 })
const camera = ref({ x: 0, y: 0 })
const viewport = ref({ width: 0, height: 0 })
const token = ref('')
const captcha = ref(null)
const board = ref(null)
const messageInput = ref(null)
const addButton = ref(null)
const draft = ref(null)
const selected = ref(null)
const lifting = ref(null)
const readingNote = ref(null)
const readerDialog = ref(null)
const deleteDialog = ref(null)
const deleteTarget = ref(null)
const deleting = ref(false)
const deleteError = ref('')
let longPressTimer
let readerAnimation
let readerClosing = false
const noteElement = note => board.value?.querySelector(`[data-note-id="${CSS.escape(note.id)}"]`)
function readerOrigin(note) {
  const source = noteElement(note)
  if (!source) return null
  const sourceBounds = source.getBoundingClientRect()
  const destination = readerDialog.value.getBoundingClientRect()
  return `translate(${sourceBounds.left + sourceBounds.width / 2 - destination.left - destination.width / 2}px, ${sourceBounds.top + sourceBounds.height / 2 - destination.top - destination.height / 2}px) rotate(${note.angle || 0}deg) scale(${source.offsetWidth * zoom.value / destination.width}, ${source.offsetHeight * zoom.value / destination.height})`
}
const dateFormatter = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
function postedDate(value) {
  const date = new Date(value)
  return value && Number.isFinite(date.getTime()) ? dateFormatter.format(date) : ''
}
async function readNote(note, event) {
  if (readingNote.value || readerClosing || canvasTool.value || gesture.value || event?.target.closest('button, input, textarea')) return
  readingNote.value = note
  await nextTick()
  readerDialog.value?.showModal()
  const origin = readerOrigin(note)
  if (origin && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    readerAnimation = readerDialog.value.animate([{ transform: origin }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.2,.75,.25,1)' })
  }
}
async function closeReader(animate = true) {
  if (!readingNote.value || readerClosing) return
  readerClosing = true
  const note = readingNote.value
  readerAnimation?.cancel()
  const origin = readerOrigin(note)
  if (animate && origin && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    readerAnimation = readerDialog.value.animate([{ transform: 'none' }, { transform: origin }], { duration: 180, easing: 'ease-in-out' })
    await readerAnimation.finished.catch(() => {})
  }
  readerDialog.value?.close()
  readingNote.value = null
  readerClosing = false
  await nextTick()
  noteElement(note)?.focus({ preventScroll: true })
}
async function editFromReader() {
  const note = readingNote.value
  await closeReader(false)
  await editNote(note)
}
async function requestDelete(note) {
  if (!note?.canEdit || editing.value || posting.value || deleting.value) return
  deleteTarget.value = note
  deleteError.value = ''
  await nextTick()
  deleteDialog.value?.showModal()
}
function cancelDelete() {
  if (deleting.value) return
  deleteDialog.value?.close()
  deleteTarget.value = null
}
async function confirmDelete() {
  if (!deleteTarget.value || deleting.value) return
  deleting.value = true
  deleteError.value = ''
  const id = deleteTarget.value.id
  try {
    await noteRequest('DELETE', { id })
    notes.value = notes.value.filter(note => note.id !== id)
    if (readingNote.value?.id === id) await closeReader(false)
    if (selected.value === id) selected.value = null
    if (lifting.value === id) lifting.value = null
    deleteDialog.value?.close()
    deleteTarget.value = null
    status.value = 'Your note has been deleted.'
    await nextTick()
    board.value?.focus({ preventScroll: true })
  } catch (cause) { deleteError.value = cause.message }
  finally { deleting.value = false }
}
let readerPointerStartedOutside = false
function outsideReader(event) {
  const bounds = readerDialog.value.getBoundingClientRect()
  return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom
}
function readerBackdropClick(event) {
  if (readerPointerStartedOutside && outsideReader(event)) closeReader()
  readerPointerStartedOutside = false
}
async function selectNote(note) {
  if (canvasTool.value || gesture.value === 'pan' || selected.value === note.id) return
  selected.value = note.id
  lifting.value = null
  await nextTick()
  lifting.value = note.id
}
const gesture = ref('')
const messagesOpen = ref(false)
const messagesButton = ref(null)
const panelCloseButton = ref(null)
const allNotes = computed(() => sortNotes(notes.value))
let pointer
const touches = new Map()
let pinch
let frame
let observer
let lastTime = 0
let suppressBoardClick = false
const canPost = computed(() => boardConfigured && !loadError.value && !loading.value && message.value.trim() && !posting.value)
const gridStyle = computed(() => {
  const grid = gridAppearance(zoom.value)
  return { '--board-zoom': zoom.value, backgroundImage: `radial-gradient(rgba(182, 162, 199, ${grid.opacity}) .8px, transparent .8px)`, backgroundSize: `${grid.spacing}px ${grid.spacing}px`, backgroundPosition: `${viewport.value.width / 2 - camera.value.x * zoom.value}px ${viewport.value.height / 2 - camera.value.y * zoom.value}px` }
})
const paperStyle = note => ({ ...noteAppearance(note.color), left: `${(note.x - camera.value.x) * zoom.value + viewport.value.width / 2}px`, top: `${(note.y - camera.value.y) * zoom.value + viewport.value.height / 2}px`, '--tilt': `${note.angle ?? 0}deg` })
const visibleNotes = computed(() => notes.value.filter(note => Math.abs(note.x - camera.value.x) < viewport.value.width / (2 * zoom.value) + 400 && Math.abs(note.y - camera.value.y) < viewport.value.height / (2 * zoom.value) + 500))
const atOrigin = computed(() => Math.abs(camera.value.x) < .5 && Math.abs(camera.value.y) < .5)
const myNotes = computed(() => [
  ...(editing.value ? [{ ...position.value, angle: angle.value, id: 'draft', height: draft.value?.offsetHeight || 400 }] : []),
  ...notes.value.filter(note => note.canEdit && note.id !== editingId.value).map(note => ({ ...note, height: 300 })),
])
function noteIsInView(note) {
  // Oversized notes count as reached when their center is in the viewport.
  const width = viewport.value.width / zoom.value
  const height = viewport.value.height / zoom.value
  const radians = (note.angle || 0) * Math.PI / 180
  const insetX = Math.min((Math.abs(Math.cos(radians)) * noteWidth + Math.abs(Math.sin(radians)) * note.height) / 2 + 12, width / 2)
  const insetY = Math.min((Math.abs(Math.sin(radians)) * noteWidth + Math.abs(Math.cos(radians)) * note.height) / 2 + 12, height / 2)
  return Math.abs(note.x + noteWidth / 2 - camera.value.x) <= Math.max(1, width / 2 - insetX)
    && Math.abs(note.y + note.height / 2 - camera.value.y) <= Math.max(1, height / 2 - insetY)
}
const missingMyNotes = computed(() => myNotes.value.filter(note => !noteIsInView(note)))
function findMyNotes() {
  const note = missingMyNotes.value[0]
  if (!note) return
  if (note.id === 'draft') findDraft()
  else showNote(note)
}
async function refresh() {
  if (!boardConfigured) return
  loading.value = true
  loadError.value = ''
  try { notes.value = await noteRequest() }
  catch { loadError.value = 'Couldn’t load the board. Please try again.' }
  finally { loading.value = false }
}
async function startNote() {
  editingId.value = null
  angle.value = 0
  editing.value = true
  verifying.value = false
  status.value = ''
  error.value = ''
  position.value = clampPosition(camera.value.x - noteWidth / 2, camera.value.y - Math.min(190, viewport.value.height / (2 * zoom.value) - 20))
  await nextTick()
  messageInput.value?.focus({ preventScroll: true })
}
async function cancel() {
  stopGesture()
  closeVerification()
  editing.value = false
  editingId.value = null
  message.value = ''
  author.value = ''
  verifying.value = false
  token.value = ''
  await nextTick()
  addButton.value?.focus({ preventScroll: true })
}
function setCamera(x, y) { camera.value = { x: clampCoordinate(x), y: clampCoordinate(y) } }
function centerBoard() { setCamera(0, 0) }
async function editNote(note) {
  if (!note.canEdit || editing.value || posting.value) return
  editingId.value = note.id
  message.value = note.message
  author.value = note.author
  color.value = note.color
  angle.value = note.angle || 0
  position.value = { x: note.x, y: note.y }
  token.value = ''
  error.value = ''
  verifying.value = false
  editing.value = true
  messagesOpen.value = false
  await nextTick()
  findDraft()
  messageInput.value?.focus({ preventScroll: true })
}
async function toggleMessages() {
  messagesOpen.value = !messagesOpen.value
  await nextTick()
  if (messagesOpen.value) { panelCloseButton.value?.focus(); await refresh() }
  else messagesButton.value?.focus()
}
async function closeMessages() {
  messagesOpen.value = false
  await nextTick()
  messagesButton.value?.focus()
}
async function showNote(note) {
  selected.value = note.id
  messagesOpen.value = false
  setCamera(note.x + noteWidth / 2, note.y + 150)
  await nextTick()
  board.value.querySelector(`[data-note-id="${CSS.escape(note.id)}"]`)?.focus({ preventScroll: true })
}
function findDraft() {
  setCamera(position.value.x + noteWidth / 2, position.value.y + (draft.value?.offsetHeight || 400) / 2)
}
function localPoint(event) {
  const rect = board.value.getBoundingClientRect()
  return { x: event.clientX - rect.left, y: event.clientY - rect.top }
}
function beginGesture(event, mode) {
  if ((!event.isPrimary && event.pointerType !== 'touch') || (event.pointerType === 'mouse' && event.button !== 0) || (mode === 'note' && posting.value)) return
  if (mode === 'pan' && !canvasTool.value && event.target.closest('button, input, textarea, .draft-note')) return
  clearTimeout(longPressTimer)
  if (event.pointerType === 'touch' && mode === 'pan') {
    touches.set(event.pointerId, localPoint(event))
    board.value.setPointerCapture(event.pointerId)
    if (touches.size >= 2) {
      cancelAnimationFrame(frame)
      lifting.value = null
      suppressBoardClick = true
      gesture.value = 'pinch'
      const [a, b] = [...touches.values()]
      const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      pinch = { distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), zoom: zoom.value, world: screenToWorld(midpoint, camera.value, viewport.value, zoom.value) }
      return
    }
  }
  const pendingPan = mode === 'pan' && !canvasTool.value
  if (!pendingPan) { event.preventDefault(); lifting.value = null }
  const point = localPoint(event)
  const world = screenToWorld(point, camera.value, viewport.value, zoom.value)
  const center = { x: position.value.x + noteWidth / 2, y: position.value.y + (draft.value?.offsetHeight || 400) / 2 }
  pointer = { id: event.pointerId, target: event.currentTarget, point, previous: point, start: point, forced: canvasTool.value, pointerType: event.pointerType, center, startAngle: angle.value, pointerAngle: Math.atan2(world.y - center.y, world.x - center.x), offset: { x: world.x - position.value.x, y: world.y - position.value.y } }
  gesture.value = pendingPan ? 'pending-pan' : mode
  if (!pendingPan) event.currentTarget.setPointerCapture(event.pointerId)
  const noteId = event.target.closest('.posted-note')?.dataset.noteId
  if (pendingPan && event.pointerType !== 'mouse' && noteId) {
    longPressTimer = setTimeout(() => {
      if (!pointer || gesture.value !== 'pending-pan') return
      const note = notes.value.find(note => note.id === noteId)
      suppressBoardClick = true
      stopGesture()
      if (note) { selected.value = note.id; readNote(note) }
    }, 500)
  }
  if (mode === 'note') { lastTime = 0; frame = requestAnimationFrame(autoPan) }
}
function captureCanvasTool(event) {
  suppressBoardClick = canvasTool.value
  if (!canvasTool.value) return
  beginGesture(event, 'pan')
  event.stopPropagation()
}
function captureBoardClick(event) {
  if (!canvasTool.value && !suppressBoardClick) return
  suppressBoardClick = false
  event.preventDefault()
  event.stopPropagation()
}
function shortcutDown(event) {
  if (event.code !== 'Space' || event.isComposing || event.target.closest('input, textarea, select, [contenteditable="true"]') || verificationDialog.value?.open || readerDialog.value?.open || deleteDialog.value?.open) return
  event.preventDefault()
  canvasTool.value = true
  lifting.value = null
}
function shortcutUp(event) {
  if (event.code !== 'Space') return
  canvasTool.value = false
  if (pointer?.forced) stopGesture()
}
function resetTools() { canvasTool.value = false; stopGesture() }
function outsidePointerMove(event) {
  if (pointer && !board.value?.contains(event.target)) movePointer(event)
}
function rotateKey(event) {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || posting.value) return
  event.preventDefault()
  event.stopPropagation()
  angle.value = Math.max(-180, Math.min(180, angle.value + (event.key === 'ArrowRight' ? 1 : -1) * (event.shiftKey ? 15 : 1)))
}
function updateNote() {
  const world = screenToWorld(pointer.point, camera.value, viewport.value, zoom.value)
  position.value = clampPosition(world.x - pointer.offset.x, world.y - pointer.offset.y)
}
function movePointer(event) {
  if (touches.has(event.pointerId)) touches.set(event.pointerId, localPoint(event))
  if (gesture.value === 'pinch' && pinch) {
    const [a, b] = [...touches.values()]
    if (!a || !b) return
    const next = clampZoom(pinch.zoom * Math.hypot(a.x - b.x, a.y - b.y) / pinch.distance)
    zoom.value = next
    setCamera(pinch.world.x - ((a.x + b.x) / 2 - viewport.value.width / 2) / next, pinch.world.y - ((a.y + b.y) / 2 - viewport.value.height / 2) / next)
    return
  }
  if (!pointer || event.pointerId !== pointer.id) return
  pointer.point = localPoint(event)
  if (gesture.value === 'pending-pan') {
    const distance = Math.hypot(pointer.point.x - pointer.start.x, pointer.point.y - pointer.start.y)
    if (distance < (pointer.pointerType === 'mouse' ? 6 : 9)) return
    clearTimeout(longPressTimer)
    lifting.value = null
    gesture.value = 'pan'
    suppressBoardClick = true
    pointer.target.setPointerCapture(pointer.id)
  }
  if (gesture.value === 'pan') setCamera(camera.value.x + (pointer.previous.x - pointer.point.x) / zoom.value, camera.value.y + (pointer.previous.y - pointer.point.y) / zoom.value)
  else if (gesture.value === 'rotate') {
    const world = screenToWorld(pointer.point, camera.value, viewport.value, zoom.value)
    const change = (Math.atan2(world.y - pointer.center.y, world.x - pointer.center.x) - pointer.pointerAngle) * 180 / Math.PI
    angle.value = Math.round((((pointer.startAngle + change + 540) % 360) - 180) * 10) / 10
  } else updateNote()
  pointer.previous = pointer.point
}
function autoPan(time) {
  if (!pointer || gesture.value !== 'note') return
  const elapsed = lastTime ? Math.min((time - lastTime) / 1000, .05) : 0
  lastTime = time
  setCamera(camera.value.x + edgeVelocity(pointer.point.x, viewport.value.width) * elapsed / zoom.value, camera.value.y + edgeVelocity(pointer.point.y, viewport.value.height) * elapsed / zoom.value)
  updateNote()
  frame = requestAnimationFrame(autoPan)
}
function stopGesture(event) {
  if (event?.pointerId !== undefined && gesture.value === 'pinch') {
    if (!touches.has(event.pointerId)) return
    touches.delete(event.pointerId)
    if (board.value?.hasPointerCapture(event.pointerId)) board.value.releasePointerCapture(event.pointerId)
    const remaining = [...touches.entries()][0]
    if (remaining) {
      const [id, point] = remaining
      pointer = { id, target: board.value, point, previous: point, start: point, pointerType: 'touch' }
      pinch = null
      gesture.value = 'pan'
      return
    }
  }
  if (event?.pointerId !== undefined && pointer && event.pointerId !== pointer.id) return
  const previous = pointer
  clearTimeout(longPressTimer)
  pointer = null
  gesture.value = ''
  pinch = null
  const capturedTouches = [...touches.keys()]
  touches.clear()
  cancelAnimationFrame(frame)
  if (previous?.target.hasPointerCapture(previous.id)) previous.target.releasePointerCapture(previous.id)
  for (const id of capturedTouches) if (board.value?.hasPointerCapture(id)) board.value.releasePointerCapture(id)
}
function lostCapture(event) {
  // Ignore implicit capture leaving a child when capture transfers to the board.
  const target = gesture.value === 'pinch' ? board.value : pointer?.target
  if (event.target !== target || target?.hasPointerCapture(event.pointerId)) return
  stopGesture(event)
}
function changeZoom(value, point = { x: viewport.value.width / 2, y: viewport.value.height / 2 }) {
  if (gesture.value) return
  const next = clampZoom(value)
  camera.value = zoomAround(point, camera.value, viewport.value, zoom.value, next)
  zoom.value = next
}
function wheel(event) {
  if (event.ctrlKey) {
    event.preventDefault()
    changeZoom(zoom.value * Math.exp(-event.deltaY * .002), localPoint(event))
    return
  }
  if (event.target.closest('textarea, input, .note-message, .draft-note')) return
  event.preventDefault()
  const factor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.value.height : 1
  setCamera(camera.value.x + (event.shiftKey ? event.deltaY : event.deltaX) * factor / zoom.value, camera.value.y + (event.shiftKey ? 0 : event.deltaY) * factor / zoom.value)
}
function moveKey(event, mode = 'note') {
  const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }
  if (!directions[event.key] || (mode === 'note' && posting.value)) return
  event.preventDefault()
  event.stopPropagation()
  const [x, y] = directions[event.key]
  const step = event.shiftKey ? 100 : mode === 'pan' ? 40 : 10
  if (mode === 'pan') setCamera(camera.value.x + x * step, camera.value.y + y * step)
  else {
    position.value = clampPosition(position.value.x + x * step, position.value.y + y * step)
    const style = { x: (position.value.x - camera.value.x) * zoom.value + viewport.value.width / 2, y: (position.value.y - camera.value.y) * zoom.value + viewport.value.height / 2 }
    if (style.x < 0 || style.x + noteWidth * zoom.value > viewport.value.width || style.y < 0 || style.y + 40 * zoom.value > viewport.value.height) findDraft()
  }
}
async function post() {
  if (!canPost.value || verifying.value) return
  error.value = ''
  token.value = ''
  now.value = Date.now()
  if (verifiedUntil.value > now.value) return saveNote()
  verifying.value = true
  await nextTick()
  if (verifying.value) verificationDialog.value?.showModal()
}
function closeVerification() {
  verifying.value = false
  token.value = ''
  verificationDialog.value?.close()
}
async function verificationCompleted(value) {
  token.value = value
  if (!value || !verifying.value || !canPost.value) return
  return saveNote()
}
async function saveNote() {
  if (!canPost.value) return
  posting.value = true
  error.value = ''
  try {
    const wasEditing = Boolean(editingId.value)
    const note = await noteRequest(wasEditing ? 'PATCH' : 'POST', { ...(wasEditing ? { id: editingId.value } : {}), message: message.value.trim(), author: author.value.trim(), color: color.value, ...position.value, angle: angle.value, token: token.value })
    if (wasEditing) notes.value = notes.value.map(existing => existing.id === note.id ? note : existing)
    else notes.value.push(note)
    message.value = ''
    author.value = ''
    await cancel()
    status.value = wasEditing ? 'Your note has been updated.' : 'Your note is on the board. Thanks for stopping by!'
  } catch (cause) {
    if (cause.code === 'VERIFICATION_REQUIRED') {
      clearVerification()
      closeVerification()
      posting.value = false
      return post()
    }
    error.value = cause.name === 'TimeoutError' ? 'The request timed out. Refresh the board before retrying to check whether your note arrived.' : cause.message
    closeVerification()
    await nextTick()
    draft.value?.querySelector('.pin-button')?.focus({ preventScroll: true })
  } finally { posting.value = false }
}
onMounted(() => {
  observer = new ResizeObserver(([entry]) => { viewport.value = { width: entry.contentRect.width, height: entry.contentRect.height } })
  observer.observe(board.value)
  window.addEventListener('blur', stopGesture)
  window.addEventListener('keydown', shortcutDown)
  window.addEventListener('keyup', shortcutUp)
  window.addEventListener('blur', resetTools)
  window.addEventListener('pointermove', outsidePointerMove)
  window.addEventListener('pointerup', stopGesture)
  window.addEventListener('pointercancel', stopGesture)
  verificationTimer = setInterval(() => { now.value = Date.now() }, 15000)
  refresh()
})
onBeforeUnmount(() => { resetTools(); observer?.disconnect(); clearInterval(verificationTimer); clearTimeout(longPressTimer); window.removeEventListener('blur', stopGesture); window.removeEventListener('blur', resetTools); window.removeEventListener('keydown', shortcutDown); window.removeEventListener('keyup', shortcutUp); window.removeEventListener('pointermove', outsidePointerMove); window.removeEventListener('pointerup', stopGesture); window.removeEventListener('pointercancel', stopGesture) })
</script>

<template>
  <main class="notes-page">
    <header class="board-header">
      <RouterLink class="board-back" to="/" aria-label="Go back to home"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m3 10 9-7 9 7M5 9v11h5v-6h4v6h5V9" /></svg><span>Go back</span></RouterLink>
      <div class="board-heading"><h1>The little note board<span>.</span></h1><p>A hello, a thought, a terrible joke. Make yourself at home.</p></div>
      <div class="board-header-actions"><button ref="messagesButton" class="messages-button" :aria-expanded="messagesOpen" aria-controls="all-messages" @click="toggleMessages"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg><span>All notes</span></button><button ref="addButton" class="board-button" :disabled="editing" @click="startNote"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M14 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9M14 3v7h7M14 3l7 7M7 14h7M7 17h4"/></svg><span>Leave me a note</span></button></div>
    </header>
    <div class="board-stage"><div class="canvas-surface">
    <section ref="board" class="board-viewport" :class="{ 'is-panning': gesture === 'pan', 'canvas-tool-active': canvasTool, 'is-dragging-note': gesture === 'note' }" :style="gridStyle" tabindex="0" aria-label="Note board. Drag the background or use arrow keys to explore in any direction."
      @click.capture="captureBoardClick" @pointerdown.capture="captureCanvasTool" @pointerdown="beginGesture($event, 'pan')" @pointermove="movePointer" @pointerup="stopGesture" @pointercancel="stopGesture" @lostpointercapture="lostCapture" @wheel="wheel" @keydown.self="moveKey($event, 'pan')">
      <div class="world-origin" :style="paperStyle({ x: 0, y: 0 })" aria-hidden="true"></div>
      <div v-if="!notes.length && !editing" class="board-welcome" :style="paperStyle({ x: -150, y: -110 })"><p>Good people.<br>Little paper things.</p><small>The first little hello could be yours.</small></div>
      <article v-for="note in visibleNotes.filter(note => note.id !== editingId)" :key="note.id" :data-note-id="note.id" tabindex="0" class="sticky-note posted-note" :class="[note.color, { 'is-selected': selected === note.id, 'is-lifting': lifting === note.id, 'is-reading': readingNote?.id === note.id }]" :style="paperStyle(note)" :aria-label="`Note from ${note.author || 'a friendly stranger'}: ${note.message}`" @click="selectNote(note)" @contextmenu.prevent @dblclick="readNote(note, $event)" @keydown.enter.prevent="readNote(note)">
        <span class="note-message">{{ note.message }}</span><span class="note-signature">— {{ note.author || 'a friendly stranger' }}</span>
        <time v-if="postedDate(note.created_at)" class="note-posted-date" :datetime="note.created_at">{{ postedDate(note.created_at) }}</time><NoteActions v-if="note.canEdit" :disabled="editing || posting || deleting" @edit="editNote(note)" @delete="requestDelete(note)" />
      </article>
      <form v-if="editing" ref="draft" class="sticky-note draft-note" :style="paperStyle({ ...position, color, angle })" aria-label="Write your sticky note" @submit.prevent="post">
        <div class="note-tools draft-tools" role="group" aria-label="Note editing actions"><button type="submit" :disabled="!canPost || verifying" :aria-label="posting ? 'Saving note' : 'Save note'" :title="posting ? 'Saving note…' : 'Save note'"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 3h11l3 3v11H3V3Z M6 3v5h7V3 M6 17v-6h8v6"/></svg></button><button type="button" :disabled="posting" aria-label="Close note without saving" title="Close without saving" @click="cancel"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg></button></div>
        <button type="button" class="note-drag" aria-label="Move your note. Drag or use arrow keys; Shift moves faster." :disabled="posting" @pointerdown.stop="beginGesture($event, 'note')" @keydown="moveKey">⠿ <span>DRAG TO FIND YOUR SPOT</span></button>
        <div class="paper-colors" role="group" aria-label="Paper color"><label v-for="paper in noteColors" :key="paper" :style="noteAppearance(paper)"><input v-model="color" type="radio" name="paper" :value="paper" :aria-label="paper" :disabled="posting" /><span aria-hidden="true">{{ color === paper ? '✓' : '' }}</span></label><label class="custom-paper-color" :class="{ 'is-selected': color.startsWith('#') }" :style="color.startsWith('#') ? { background: color } : {}" title="Choose any color"><input type="color" :value="color.startsWith('#') ? color : customColor" aria-label="Choose a custom paper color" :disabled="posting" @input="chooseCustomColor" @change="chooseCustomColor" /><span aria-hidden="true">＋</span></label></div>
        <label class="sr-only" for="note-message">Your note</label><textarea id="note-message" ref="messageInput" v-model="message" maxlength="280" required placeholder="Hey Pøziel…" :disabled="posting"></textarea>
        <label class="note-signature-input" for="note-author"><span aria-hidden="true">—</span><input id="note-author" v-model="author" maxlength="40" aria-label="Your signature (optional)" placeholder="Your name (optional)" autocomplete="nickname" :disabled="posting" /></label>
        <div class="note-actions"><span class="note-count">{{ message.length }}/280</span><span v-if="posting" role="status">Saving…</span></div>
        <button type="button" class="note-rotate" aria-label="Rotate your note. Drag to tilt, or use left and right arrow keys." :disabled="posting" @pointerdown.stop="beginGesture($event, 'rotate')" @keydown="rotateKey"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M15 6a6 6 0 1 0 1 7M15 2v4h-4"/></svg></button><p class="public-note">Public little hello. Keep it kind.</p>
        <p v-if="error" role="alert" class="note-error">{{ error }}</p>
      </form>
    </section>
    <div class="canvas-zoom" role="group" aria-label="Canvas zoom"><button aria-label="Zoom out" :disabled="zoom <= .1 || Boolean(gesture)" @click="changeZoom(zoom / 1.2)">−</button><button class="zoom-value" aria-label="Reset zoom to 100 percent" :disabled="zoom === 1" @click="changeZoom(1)">{{ Math.round(zoom * 100) }}%</button><button aria-label="Zoom in" :disabled="zoom >= 2 || Boolean(gesture)" @click="changeZoom(zoom * 1.2)">＋</button></div>
    </div><aside v-if="messagesOpen" id="all-messages" class="messages-panel" aria-labelledby="messages-title" @keydown.esc.stop="closeMessages">
      <div class="messages-panel-heading"><div><h2 id="messages-title">All the little hellos<span>.</span></h2><p>{{ notes.length }} {{ notes.length === 1 ? 'note' : 'notes' }} · yours first, then newest</p></div><button ref="panelCloseButton" class="panel-close" aria-label="Close notes" @click="closeMessages">×</button></div>
      <p class="messages-panel-hint">Your notes come first. Select a note to jump to its location on the board.</p>
      <div class="messages-list">
        <p v-if="loading" class="messages-empty" role="status">Gathering the little hellos…</p>
        <div v-else-if="loadError" class="messages-empty" role="alert"><p>{{ loadError }}</p><button class="text-button" @click="refresh">Try again</button></div>
        <p v-else-if="!notes.length" class="messages-empty">No notes yet.<br><span>The first little hello could be yours.</span></p>
        <ol v-if="notes.length"><li v-for="note in allNotes" :key="note.id" class="drawer-note" :class="{ 'is-owned': note.canEdit }" :style="noteAppearance(note.color)"><button class="message-list-note" :aria-label="`View note from ${note.author || 'a friendly stranger'} on the board`" @click="showNote(note)"><span v-if="note.canEdit" class="your-note-label">YOUR NOTE</span><span class="message-list-text">{{ note.message }}</span><time v-if="postedDate(note.created_at)" class="note-posted-date" :datetime="note.created_at">{{ postedDate(note.created_at) }}</time><span class="message-list-footer"><span>— {{ note.author || 'a friendly stranger' }}</span></span><span class="drawer-nav-indicator" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 15 15 5M6 5h9v9"/></svg></span></button><NoteActions v-if="note.canEdit" :disabled="editing || posting || deleting" @edit="editNote(note)" @delete="requestDelete(note)" /></li></ol>
      </div>
    </aside>
    </div>
    <div class="board-bottom-bar">
      <p class="board-hint"><template v-if="canvasTool">Canvas move tool active</template><template v-else-if="gesture === 'note'">Hold near an edge to keep exploring.</template><template v-else><span>Drag the board to explore</span><i class="footer-separator" aria-hidden="true"></i><span>Drag a note to place it</span><i class="footer-separator" aria-hidden="true"></i><span>Hold Space to pan</span><i class="footer-separator" aria-hidden="true"></i><span>Double-click a note to read</span></template></p>
    </div>
    <div class="board-info"><span>{{ notes.length }} {{ notes.length === 1 ? 'note' : 'notes' }}</span><i class="footer-separator" aria-hidden="true"></i><span v-if="!boardConfigured">Preview · Posting opens soon</span><span v-else-if="loadError" role="alert">{{ loadError }}</span><span v-else role="status">{{ status || 'A few words can make someone’s day.' }}</span><span class="camera-position">{{ Math.round(camera.x) }}, {{ Math.round(camera.y) }}</span><span v-if="verificationMinutes" class="verified-status" :title="`Verification expires in ${verificationMinutes} minutes`">✓ Verified · {{ verificationMinutes }}m</span><div class="footer-actions"><button v-if="myNotes.length" class="text-button" :disabled="!missingMyNotes.length || posting || Boolean(gesture)" @click="findMyNotes">Find My Notes</button><i v-if="myNotes.length" class="footer-separator" aria-hidden="true"></i><button class="text-button" :disabled="atOrigin || Boolean(gesture)" @click="centerBoard">Back to 0, 0</button><i class="footer-separator" aria-hidden="true"></i><button class="text-button" :disabled="loading || posting || !boardConfigured" @click="refresh">{{ loading ? 'Loading…' : 'Refresh' }}</button></div></div>
  </main>
  <Teleport to="body"><dialog ref="verificationDialog" class="verification-dialog" aria-labelledby="verification-title" @cancel.prevent="!posting && closeVerification()"><div class="verification-heading"><h2 id="verification-title">One quick human check</h2><button class="panel-close" aria-label="Close verification" :disabled="posting" @click="closeVerification">×</button></div><p>{{ posting ? 'Verified. Saving your note…' : 'Your note will be saved automatically after verification.' }}</p><NoteCaptcha v-if="verifying && !posting" ref="captcha" @token="verificationCompleted" /><p v-if="posting" class="verification-saving" role="status">Saving…</p></dialog></Teleport>
  <Teleport to="body"><dialog ref="readerDialog" class="note-reader" :style="readingNote ? noteAppearance(readingNote.color) : {}" aria-labelledby="reader-title" @cancel.prevent @pointerdown="readerPointerStartedOutside = outsideReader($event)" @click="readerBackdropClick"><template v-if="readingNote"><button class="reader-close" aria-label="Close note reader" @click="closeReader"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg></button><NoteActions v-if="readingNote.canEdit" :disabled="editing || posting || deleting" @edit="editFromReader" @delete="requestDelete(readingNote)" /><h2 id="reader-title" class="sr-only">Note from {{ readingNote.author || 'a friendly stranger' }}</h2><p class="reader-message">{{ readingNote.message }}</p><p class="reader-signature">— {{ readingNote.author || 'a friendly stranger' }}</p><time v-if="postedDate(readingNote.created_at)" class="reader-date" :datetime="readingNote.created_at">Posted {{ postedDate(readingNote.created_at) }}</time></template></dialog></Teleport>
  <Teleport to="body"><dialog ref="deleteDialog" class="delete-dialog" aria-labelledby="delete-title" @cancel.prevent="cancelDelete"><h2 id="delete-title">Delete this note?</h2><p>This will permanently remove your note from the board.</p><blockquote v-if="deleteTarget">{{ deleteTarget.message }}</blockquote><p v-if="deleteError" class="delete-error" role="alert">{{ deleteError }}</p><div class="delete-dialog-actions"><button type="button" autofocus :disabled="deleting" @click="cancelDelete">Keep note</button><button type="button" class="confirm-delete" :disabled="deleting" @click="confirmDelete">{{ deleting ? 'Deleting…' : 'Delete note' }}</button></div></dialog></Teleport>
</template>
