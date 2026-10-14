<script setup>
import { site } from '../config/site.js'
defineProps({ page: { type: String, required: true } })
const experience = [
  { company: 'Progi', role: 'Full-stack Developer', dates: 'December 2025 — Present', detail: 'Working directly at Progi since August 2026, after initially joining through LBM Conseils. Contributing across frontend and backend within the product team.' },
  { company: 'LBM Conseils', role: 'Full-stack Developer', dates: 'December 2025 — August 2026', detail: 'Worked as a consultant assigned to Progi.' },
  { company: 'Arkys', role: 'Developer-Analyst', dates: 'November 2021 — November 2025', detail: 'Full-stack development with Blazor, ASP.NET, SQL Server, and Azure. Reusable UI components, SCSS architecture, and project coordination.' },
  { company: 'ited · formerly MS Geslam', role: 'Web Developer', dates: 'May 2017 — November 2021', detail: 'Custom web applications with PHP, MySQL, JavaScript, and SCSS, from client needs through development and delivery.' },
  { company: 'Logilia', role: 'ASP.NET Programmer · Internship', dates: 'May 2016 — September 2016', detail: 'A work-study internship developing web applications with ASP.NET MVC and Web Forms.' },
]
</script>

<template>
  <section class="profile-content">
    <template v-if="page === 'about'">
      <h1 class="subpage-title">A LITTLE<br><span>MORE ME.</span></h1>
      <div class="profile-prose">
        <p class="page-lead">Developer, creator, and gamer from {{ site.location }}.</p>
        <section>
          <h2>Making useful things</h2>
          <p>I like building apps that make everyday life a little easier. My personal projects give me a place to explore ideas and turn them into something people can use.</p>
        </section>
        <section>
          <h2>Games, friends, and questionable decisions</h2>
          <p>Gaming is a way to spend time with friends, keep the jokes going, and make memories. League of Legends is one of the games I’ve spent over a thousand hours in. Make of that what you will.</p>
        </section>
        <section>
          <h2>One more episode</h2>
          <p>Anime is part of the picture, too. Sword Art Online has a special place as one of the first series I watched, and I appreciate the quieter, reflective side of Frieren.</p>
        </section>
        <section>
          <h2>The details matter</h2>
          <p>I care about how things look and feel, whether it’s a website, an app, or a logo. I like making something useful and giving it a personality of its own.</p>
        </section>
      </div>
    </template>
    <template v-else>
      <h1 class="subpage-title">THE WORK<br><span>BEHIND IT.</span></h1>
      <div class="profile-prose">
        <p class="page-lead">I’m a full-stack developer at <a :href="site.employer.url" target="_blank" rel="noopener noreferrer">{{ site.employer.name }}<span class="sr-only"> (opens in a new tab)</span> ↗</a>.</p>
        <section class="experience-section">
          <h2>Development experience</h2>
          <ol class="experience-list">
            <li v-for="job in experience" :key="job.company">
              <h3>{{ job.company }}</h3>
              <p class="experience-role">{{ job.role }}</p>
              <p class="experience-dates">{{ job.dates }}</p>
              <p>{{ job.detail }}</p>
            </li>
          </ol>
        </section>
      </div>
    </template>
  </section>
</template>
