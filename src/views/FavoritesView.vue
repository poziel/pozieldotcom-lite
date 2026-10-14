<script setup>
import favorites from '../config/favorites.json'

const lists = [
  { key: 'anime', title: 'Anime', items: favorites.anime.slice(0, 5) },
  { key: 'games', title: 'Video games', items: favorites.games.slice(0, 5) },
]
const imageUrl = value => /^https?:\/\//.test(value) ? value : `${import.meta.env.BASE_URL}${value.replace(/^\//, '')}`
function metadata(item, kind) {
  return [item.type, kind === 'anime' ? item.years : item.releaseYear,
    kind === 'anime' && item.seasons ? `${item.seasons} ${item.seasons === 1 ? 'season' : 'seasons'}` : item.platforms,
  ].filter(Boolean).join(' · ')
}
</script>

<template>
  <section class="favorites-content">
    <section v-for="list in lists" :key="list.key" class="favorites-section" :aria-labelledby="`favorites-${list.key}`">
      <h2 :id="`favorites-${list.key}`">{{ list.title }}</h2>
      <ol class="favorites-list">
        <li v-for="(item, index) in list.items" :key="index" class="favorite-row">
          <div class="favorite-art">
            <img v-if="item.image" :src="imageUrl(item.image)" :style="{ objectFit: item.imageFit === 'contain' ? 'contain' : 'cover' }" alt="" width="180" height="240" loading="lazy" decoding="async" />
            <span v-else class="favorite-placeholder" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
          </div>
          <div class="favorite-copy">
            <h3>{{ item.name || 'To be revealed' }}</h3>
            <p v-if="metadata(item, list.key)" class="favorite-meta">{{ metadata(item, list.key) }}</p>
            <p v-if="item.comment" class="favorite-comment">{{ item.comment }}</p>
            <p v-else-if="!item.name" class="favorite-meta">A spot for an all-time favorite.</p>
          </div>
        </li>
      </ol>
    </section>
  </section>
</template>
