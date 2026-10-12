<script setup>
import { onMounted, ref } from 'vue'
import SocialIcon from './SocialIcon.vue'
import { loadGithubStars } from '../lib/github-stars.js'

const props = defineProps({ projects: { type: Array, required: true } })
const stars = ref({})
const countFormat = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

function starLabel(project) {
  const result = stars.value[project.repository]
  if (!result) return 'Loading GitHub stars'
  if (result.count === null) return 'GitHub star count unavailable'
  const label = `${result.count} GitHub ${result.count === 1 ? 'star' : 'stars'}`
  return result.stale ? `${label} (last known count)` : label
}

onMounted(async () => {
  let storage
  try { storage = window.localStorage } catch { /* Optional cache. */ }
  await Promise.all([...new Set(props.projects.map((project) => project.repository).filter(Boolean))].map(async (repository) => {
    stars.value[repository] = await loadGithubStars(repository, { storage })
  }))
})
</script>

<template>
  <ul class="project-list">
    <li v-for="project in projects" :key="project.name" class="project-row">
      <a :href="project.url" target="_blank" rel="noopener noreferrer" class="project-link grid items-start">
        <img v-if="project.icon" :src="project.icon" alt="" width="44" height="44" loading="lazy" decoding="async" class="project-icon" />
        <span v-else class="project-icon project-icon-fallback" aria-hidden="true">{{ project.mark }}</span>
        <div class="project-copy min-w-0">
          <div class="project-heading flex flex-wrap items-center gap-x-3 gap-y-1">
            <h3>{{ project.name }}</h3>
            <span v-if="project.note" class="project-note">{{ project.note }}</span>
          </div>
          <p>{{ project.description }}</p>
          <span class="project-category">{{ project.category }}</span>
        </div>
        <span class="sr-only"> (opens in a new tab)</span>
      </a>
      <a
        v-if="project.repository"
        :href="`https://github.com/${project.repository}`"
        class="project-repository"
        target="_blank"
        rel="noopener noreferrer"
        :title="starLabel(project)"
        :aria-label="`${project.name} on GitHub. ${starLabel(project)}. Opens in a new tab.`"
      >
        <SocialIcon name="github" />
        <span class="repository-stars" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="m12 3 2.8 5.7 6.3.9-4.55 4.43 1.07 6.27L12 17.34l-5.62 2.96 1.07-6.27L2.9 9.6l6.3-.9Z" /></svg>
          <span>{{ stars[project.repository]?.count != null ? countFormat.format(stars[project.repository].count) : '—' }}</span>
        </span>
      </a>
    </li>
  </ul>
</template>
