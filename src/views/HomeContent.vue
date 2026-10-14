<script setup>
import ProjectList from '../components/ProjectList.vue'
import { site, projects } from '../config/site.js'
const roles = site.roles.split('.').map(role => role.trim()).filter(Boolean)
</script>

<template>
      <section class="intro" aria-labelledby="intro-title">
        <h1 id="intro-title" class="headline"><span v-for="(role, index) in roles" :key="role" :class="{ 'role-muted': index === 1, 'role-accent': index === 2 }">{{ role }}<span class="period">.</span></span></h1>
        <p class="intro-bio">{{ site.bio }}</p>
      </section>

      <section class="projects-section" aria-labelledby="projects-title">
        <div class="section-title-row flex items-baseline justify-between gap-4">
          <h2 id="projects-title">Projects</h2>
        </div>
        <ProjectList :projects="projects" />
      </section>
</template>
