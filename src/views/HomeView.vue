<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import Button from 'primevue/button'
import SocialIcon from '../components/SocialIcon.vue'
import MadeWithLoveCredit from '../components/MadeWithLoveCredit.vue'
import ProjectList from '../components/ProjectList.vue'
import { site, projects } from '../config/site.js'
import { socials } from '../config/socials.js'

const brandMarkUrl = `${import.meta.env.BASE_URL}brand/poziel-mark.svg`
const visibleSocials = socials.filter((social) => social.url && social.visible !== false)
const roles = site.roles.split('.').map((role) => role.trim()).filter(Boolean)
const profileColumn = ref(null)
const profileFitsViewport = ref(false)
let profileResizeObserver

function updateProfilePosition() {
  const column = profileColumn.value
  if (!column) return
  const top = parseFloat(getComputedStyle(column).top) || 0
  // Short windows must still allow every profile link to scroll into view.
  profileFitsViewport.value = column.getBoundingClientRect().height + top <= window.innerHeight
}

onMounted(() => {
  updateProfilePosition()
  profileResizeObserver = new ResizeObserver(updateProfilePosition)
  profileResizeObserver.observe(profileColumn.value)
  window.addEventListener('resize', updateProfilePosition)
})

onUnmounted(() => {
  profileResizeObserver?.disconnect()
  window.removeEventListener('resize', updateProfilePosition)
})

function skipToContent() {
  document.getElementById('main')?.focus()
}
</script>

<template>
  <a class="skip-link" href="#main" @click.prevent="skipToContent">Skip to content</a>
  <div class="page-shell mx-auto">
    <main id="main" tabindex="-1" class="portfolio-grid grid items-start min-w-0">
      <section class="intro" aria-labelledby="intro-title">
        <h1 id="intro-title" class="headline"><span v-for="(role, index) in roles" :key="role" :class="{ 'role-muted': index === 1, 'role-accent': index === 2 }">{{ role }}<span class="period">.</span></span></h1>
        <p class="intro-bio">{{ site.bio }}</p>
        <div class="intro-page-links">
          <RouterLink to="/about">A little about me <span aria-hidden="true">↗</span></RouterLink>
          <RouterLink to="/uses">What I use <span aria-hidden="true">↗</span></RouterLink>
        </div>
      </section>

      <aside ref="profileColumn" class="profile-column" :class="{ 'is-sticky': profileFitsViewport }" aria-label="About Alexandre and social profiles">
        <div class="profile-card">
          <img :src="site.portrait" :alt="`Portrait of ${site.name}`" width="1254" height="1254" fetchpriority="high" class="portrait aspect-square w-full object-cover" />
          <div class="profile-details">
            <div class="profile-brand">
              <img :src="brandMarkUrl" alt="" width="48" height="48" class="profile-logo" />
              <p class="profile-name">{{ site.alias }}<span aria-hidden="true">.</span></p>
            </div>
            <p class="real-name">{{ site.name }}</p>
            <ul class="profile-location" aria-label="Profile details">
              <li>Full-stack developer</li>
              <li>Currently at <a :href="site.employer.url" target="_blank" rel="noopener noreferrer">{{ site.employer.name }}<span class="sr-only"> (opens in a new tab)</span></a></li>
              <li><a :href="site.locationUrl" target="_blank" rel="noopener noreferrer">{{ site.location }}<span class="sr-only"> (Google Maps, opens in a new tab)</span></a></li>
            </ul>
          </div>
          <RouterLink class="leave-note-link" to="/notes">Leave me a note <span aria-hidden="true">↗</span></RouterLink>
        </div>
        <section class="socials-section" aria-labelledby="socials-title">
          <h2 id="socials-title" class="small-label">FIND ME ELSEWHERE</h2>
          <ul class="social-list grid grid-cols-3">
            <li v-for="social in visibleSocials" :key="social.name">
              <Button as="a" :href="social.url" target="_blank" rel="noopener noreferrer" class="social-link flex flex-col items-center justify-center gap-2">
                <SocialIcon :name="social.icon" />
                <span>{{ social.name }}</span>
                <span class="sr-only"> (opens in a new tab)</span>
              </Button>
            </li>
          </ul>
        </section>
      </aside>

      <section class="projects-section" aria-labelledby="projects-title">
        <div class="section-title-row flex items-baseline justify-between gap-4">
          <h2 id="projects-title">Projects</h2>
        </div>
        <ProjectList :projects="projects" />
      </section>
      <footer>
        <MadeWithLoveCredit class="site-credit" maker-href="" />
      </footer>
    </main>
  </div>
</template>
