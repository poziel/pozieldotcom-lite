<script setup>
import { computed } from 'vue'
import {
  faGithub, faXTwitter, faLinkedinIn, faStackOverflow, faYoutube,
  faTwitch, faTiktok, faInstagram, faSteamSymbol, faDribbble, faDev,
} from '@fortawesome/free-brands-svg-icons'

const props = defineProps({ name: { type: String, required: true } })
const icons = {
  github: faGithub, x: faXTwitter, linkedin: faLinkedinIn,
  stackoverflow: faStackOverflow, youtube: faYoutube, twitch: faTwitch,
  tiktok: faTiktok, instagram: faInstagram, steam: faSteamSymbol,
  dribbble: faDribbble, dev: faDev,
  // Suno and daily.dev paths from Simple Icons (CC0).
  // https://github.com/simple-icons/simple-icons/blob/develop/icons/suno.svg
  suno: { icon: [24, 24, [], '', 'M16.5 0C20.642 0 24 5.373 24 12h-9c0 6.627-3.358 12-7.5 12C3.358 24 0 18.627 0 12h9c0-6.627 3.358-12 7.5-12Z'] },
  // https://github.com/simple-icons/simple-icons/blob/develop/icons/dailydotdev.svg
  dailydev: { icon: [24, 24, [], '', 'M18.29 5.706a1.405 1.405 0 0 0-1.987 0L4.716 17.296l1.324-2.65-2.65-2.649 3.312-3.311 2.65 2.65 1.986-1.988-3.642-3.642a1.405 1.405 0 0 0-1.987 0L.411 11.004a1.404 1.404 0 0 0 0 1.987l4.305 4.304.993.993a1.405 1.405 0 0 0 1.987 0L19.285 6.7l-.993-.994Zm-.332 3.647 2.65 2.65-4.306 4.305a1.404 1.404 0 1 0 1.986 1.986l5.299-5.298a1.404 1.404 0 0 0 0-1.987l-4.305-4.304-1.324 2.648Z'] },
  // Kick is not in the installed Font Awesome set. Path from Simple Icons (CC0).
  // https://github.com/simple-icons/simple-icons/blob/develop/icons/kick.svg
  kick: { icon: [24, 24, [], '', 'M1.333 0h8v5.333H12V2.667h2.667V0h8v8H20v2.667h-2.667v2.666H20V16h2.667v8h-8v-2.667H12v-2.666H9.333V24h-8Z'] },
}
const icon = computed(() => icons[props.name]?.icon)
const paths = computed(() => Array.isArray(icon.value?.[4]) ? icon.value[4] : [icon.value?.[4]])
</script>

<template>
  <svg v-if="icon" :viewBox="`0 0 ${icon[0]} ${icon[1]}`" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path v-for="(path, index) in paths" :key="index" :d="path" />
  </svg>
</template>
