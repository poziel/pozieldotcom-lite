<script setup>
import ProjectList from '../components/ProjectList.vue'
import { projects } from '../config/site.js'
</script>

<template>
<section class="projects-section" aria-labelledby="projects-title">
        <div class="section-title-row">
          <h2 id="projects-title" class="section-heading">Projects</h2>
        </div>
        <ProjectList :projects="projects" />
      </section>
</template>
