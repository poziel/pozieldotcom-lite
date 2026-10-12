<script setup>
import { computed } from 'vue'
import {
  faGithub, faXTwitter, faLinkedinIn, faStackOverflow, faYoutube,
  faTwitch, faTiktok, faInstagram, faSteamSymbol,
} from '@fortawesome/free-brands-svg-icons'

const props = defineProps({ name: { type: String, required: true } })
const icons = {
  github: faGithub, x: faXTwitter, linkedin: faLinkedinIn,
  stackoverflow: faStackOverflow, youtube: faYoutube, twitch: faTwitch,
  tiktok: faTiktok, instagram: faInstagram, steam: faSteamSymbol,
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
