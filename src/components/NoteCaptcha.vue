<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { siteKey } from '../lib/notes.js'
const emit = defineEmits(['token'])
const container = ref(null)
const error = ref('')
let widget
let disposed = false
let timer
function render() {
  if (disposed || widget !== undefined) return
  if (!window.turnstile) {
    error.value = 'Verification could not load. Check your connection and retry.'
    return
  }
  error.value = ''
  widget = window.turnstile.render(container.value, {
    sitekey: siteKey, action: 'leave-note', theme: 'dark', size: 'flexible',
    callback: (token) => { if (!disposed) emit('token', token) },
    'expired-callback': () => emit('token', ''),
    'error-callback': () => { emit('token', ''); error.value = 'Verification failed. Please retry.' },
  })
}
function reset() {
  emit('token', '')
  error.value = ''
  if (widget !== undefined) window.turnstile?.reset(widget)
  else load()
}
function load() {
  clearTimeout(timer)
  if (window.turnstile) return render()
  document.getElementById('turnstile-script')?.remove()
  const script = document.createElement('script')
  script.id = 'turnstile-script'
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
  script.async = true
  script.onload = () => { clearTimeout(timer); render() }
  script.onerror = () => { if (!disposed) error.value = 'Verification could not load. Please retry.' }
  document.head.append(script)
  timer = setTimeout(() => { if (!disposed && widget === undefined) error.value = 'Verification is taking too long. Please retry.' }, 15000)
}
onMounted(load)
onBeforeUnmount(() => { disposed = true; clearTimeout(timer); if (widget !== undefined) window.turnstile?.remove(widget) })
defineExpose({ reset })
</script>
<template>
  <div ref="container" class="captcha-container"></div>
  <p v-if="error" role="alert">{{ error }} <button type="button" class="text-button" @click="reset">Retry verification</button></p>
</template>

