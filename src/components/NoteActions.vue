<script setup>
defineProps({ disabled: Boolean })
defineEmits(['edit', 'delete'])
</script>
<template>
  <div class="note-tools" role="group" aria-label="Your note actions">
    <button type="button" aria-label="Edit my note" title="Edit my note" :disabled="disabled" @click.stop="$emit('edit')" @dblclick.stop><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m12.5 3.5 4 4M3 17l1-5L13.5 2.5a1.4 1.4 0 0 1 2 0l2 2a1.4 1.4 0 0 1 0 2L8 16l-5 1Z"/></svg></button>
    <button type="button" aria-label="Delete my note" title="Delete my note" :disabled="disabled" @click.stop="$emit('delete')" @dblclick.stop><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 5h14M7 5V3h6v2M5 5l1 12h8l1-12M8 8v6M12 8v6"/></svg></button>
  </div>
</template>
