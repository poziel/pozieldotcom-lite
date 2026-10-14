<script setup>
import MadeWithLoveCredit from '../components/MadeWithLoveCredit.vue'
import { site } from '../config/site.js'
defineProps({ page: { type: String, required: true } })
</script>

<template>
  <a class="skip-link" href="#page-content">Skip to content</a>
  <div class="subpage-shell">
    <header class="subpage-header">
      <RouterLink to="/" class="subpage-brand">{{ site.alias }}<span>.</span></RouterLink>
      <RouterLink class="back-home" to="/">← Back to home</RouterLink>
    </header>
    <main id="page-content" tabindex="-1">
      <template v-if="page === 'about'">
        <p class="small-label">A LITTLE ABOUT ME</p>
        <h1 class="subpage-title">BEHIND<br><span>THE SCREEN.</span></h1>
        <div class="about-layout">
          <img :src="site.portrait" :alt="`Portrait of ${site.name}`" width="1254" height="1254" class="about-portrait" />
          <div class="subpage-copy">
            <h2>Hi, I’m Alexandre.</h2>
            <p>{{ site.bio }}</p>
            <dl class="about-facts">
              <div><dt>BASED IN</dt><dd>{{ site.location }}</dd></div>
              <div><dt>DAY TO DAY</dt><dd>Full-stack developer at <a :href="site.employer.url" target="_blank" rel="noopener noreferrer">{{ site.employer.name }} ↗</a></dd></div>
              <div><dt>ELSEWHERE</dt><dd>Developer. Creator. Gamer.</dd></div>
            </dl>
            <RouterLink class="subpage-link" to="/notes">Leave me a note <span aria-hidden="true">↗</span></RouterLink>
          </div>
        </div>
      </template>
      <template v-else>
        <p class="small-label">THE TOOLS BEHIND THE WORK</p>
        <h1 class="subpage-title">MY DAILY<br><span>SETUP.</span></h1>
        <p class="subpage-lead">A place for the software, hardware, and little things I use to build and create.</p>
        <p class="uses-preview">Page preview — my actual setup is still to come.</p>
        <div class="uses-list">
          <section v-for="(item, index) in [{ title: 'Development', text: 'Editors, terminal, and tools for everyday coding.' }, { title: 'Desk & hardware', text: 'The computer, peripherals, and workspace behind the projects.' }, { title: 'Creating & playing', text: 'Tools for making things and unwinding between builds.' }]" :key="item.title">
            <span class="uses-number">0{{ index + 1 }}</span>
            <div><h2>{{ item.title }}</h2><p>{{ item.text }}</p></div>
            <span class="small-label">COMING SOON</span>
          </section>
        </div>
      </template>
    </main>
    <footer><MadeWithLoveCredit class="site-credit" maker-href="" /></footer>
  </div>
</template>
