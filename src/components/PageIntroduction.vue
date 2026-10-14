<script setup>
import { useRoute } from 'vue-router'
import { site } from '../config/site.js'

const route = useRoute()
const roles = site.roles.split('.').map(role => role.trim()).filter(Boolean)
</script>

<template>
  <header class="page-introduction">
    <template v-if="route.name === 'home'">
      <h1 class="headline"><span v-for="(role, index) in roles" :key="role" :class="{ 'role-muted': index === 1, 'role-accent': index === 2 }">{{ role }}<span class="period">.</span></span></h1>
      <p class="intro-bio">{{ site.bio }}</p>
    </template>
    <template v-else-if="route.name === 'about'">
      <h1 class="subpage-title">A LITTLE<br><span>MORE ME.</span></h1>
      <p class="intro-bio">Developer, creator, and gamer from {{ site.location }}.</p>
    </template>
    <template v-else-if="route.name === 'works'">
      <h1 class="subpage-title">THE WORK<br><span>BEHIND IT.</span></h1>
      <p class="intro-bio">I’m a full-stack developer at <a :href="site.employer.url" target="_blank" rel="noopener noreferrer">{{ site.employer.name }}<span class="sr-only"> (opens in a new tab)</span> ↗</a>.</p>
    </template>
    <template v-else-if="route.name === 'favorites'">
      <h1 class="subpage-title">MY KIND<br><span>OF ESCAPE.</span></h1>
      <p class="favorites-intro">Five anime. Five games. The ones that stay with me.</p>
    </template>
  </header>
</template>
