<script setup>
defineProps({
  makerName: {
    type: String,
    default: 'Poziel'
  },
  makerHref: {
    type: String,
    default: 'https://poziel.com/'
  }
})
</script>

<template>
  <p class="made-with-love-credit">
    <span>Made with</span>
    <span class="made-with-love-credit__swap" role="img" aria-label="love" tabindex="0">
      <svg
        class="made-with-love-credit__heart"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -30 645 645"
        aria-hidden="true"
      >
        <path
          fill="red"
          d="M297.297 550.868c-13.774-15.437-48.17-45.529-76.435-66.874-83.744-63.242-95.142-72.395-129.144-103.703-62.684-57.721-89.305-115.71-89.213-194.34.044-38.384 2.66-53.172 13.409-75.797C34.152 71.768 61.015 43.245 95.36 25.799c24.326-12.355 36.323-17.845 76.945-18.07 42.493-.235 51.438 4.72 76.435 18.452 30.424 16.714 61.739 52.436 68.213 77.811l3.998 15.672 9.859-21.584c55.716-121.973 233.599-120.148 295.502 3.031 19.638 39.076 21.794 122.513 4.381 169.513-22.716 61.309-65.38 108.05-164.007 179.676-64.681 46.974-137.885 118.046-142.98 128.028-5.916 11.589-.283 1.817-26.409-27.46"
        />
      </svg>
      <span class="made-with-love-credit__swap-label">love</span>
    </span>
    <span>from</span>
    <span class="made-with-love-credit__swap made-with-love-credit__swap--wide" role="img" aria-label="Quebec" tabindex="0">
      <svg
        class="made-with-love-credit__quebec"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 543.86 362.57"
        aria-hidden="true"
      >
        <path fill="#fff" fill-rule="evenodd" d="M0 .001h543.86v362.57H0z" />
        <g fill="#0d2b88" fill-rule="evenodd">
          <path
            d="M430.56 249.27c2.46 2.75 4.6 5.31 6.32 8.16 4.79 7.93 6.41 16.55 3.73 23.52-5.33 14.74-7.37 18.49-7.37 30.23h3.78c.24-12.92 5.11-21.56 12.35-24.16 3.18-1.23 7.31-.62 11.1 3.28 4.69 4.82 6.05 18.11-7.71 20.67 1.46-2.17 1.34-6.91-1.58-8.59-2.23-1.11-4.74-.67-5.92.28-1.89 1.15-3.71 4.81-3.71 8.52l6.53-.01v7.3l-13.56-.01c.17 3.75 2.22 6.76 6.03 8.44-.49 1.58-2.79 4.8-5.94 4.58-.62 3.41-1.22 5.33-4.05 8.43-2.84-3.1-3.43-5.02-4.05-8.43-3.16.22-5.46-3-5.95-4.58 3.81-1.68 5.86-4.69 6.04-8.44l-13.57.01v-7.3l6.54.01c0-3.71-1.83-7.37-3.72-8.52-1.18-.95-3.69-1.39-5.92-.28-2.91 1.68-3.04 6.42-1.58 8.59-13.76-2.56-12.4-15.85-7.71-20.67 3.79-3.9 7.92-4.51 11.1-3.28 7.24 2.6 12.11 11.24 12.35 24.16h3.78c0-11.74-2.04-15.49-7.36-30.23-2.69-6.97-1.07-15.59 3.72-23.52 1.72-2.85 3.86-5.41 6.33-8.16m-113.31-22.66h226.61v135.96H317.25zM430.56 22.661c2.46 2.75 4.6 5.316 6.32 8.16 4.79 7.935 6.41 16.551 3.73 23.521-5.33 14.747-7.37 18.49-7.37 30.232h3.78c.24-12.917 5.11-21.563 12.35-24.159 3.18-1.229 7.31-.62 11.1 3.278 4.69 4.824 6.05 18.114-7.71 20.67 1.46-2.166 1.34-6.909-1.58-8.583-2.23-1.114-4.74-.678-5.92.28-1.89 1.145-3.71 4.806-3.71 8.514l6.53-.009v7.298l-13.56-.008c.17 3.754 2.22 6.761 6.03 8.435-.49 1.58-2.79 4.81-5.94 4.59-.62 3.41-1.22 5.32-4.05 8.42-2.84-3.1-3.43-5.01-4.05-8.42-3.16.22-5.46-3.01-5.95-4.59 3.81-1.674 5.86-4.681 6.04-8.435l-13.57.008v-7.298l6.54.009c0-3.708-1.83-7.369-3.72-8.514-1.18-.958-3.69-1.394-5.92-.28-2.91 1.674-3.04 6.417-1.58 8.583-13.76-2.556-12.4-15.846-7.71-20.67 3.79-3.897 7.92-4.507 11.1-3.278 7.24 2.595 12.11 11.242 12.35 24.159h3.78c0-11.742-2.04-15.486-7.36-30.232-2.69-6.97-1.07-15.586 3.72-23.521 1.72-2.844 3.86-5.411 6.33-8.16M317.25 0h226.61v135.96H317.25zM113.31 249.27c2.46 2.75 4.6 5.31 6.32 8.16 4.79 7.93 6.41 16.55 3.73 23.52-5.33 14.74-7.37 18.49-7.37 30.23h3.78c.24-12.92 5.11-21.56 12.35-24.16 3.18-1.23 7.31-.62 11.1 3.28 4.69 4.82 6.05 18.11-7.71 20.67 1.46-2.17 1.33-6.91-1.58-8.59-2.23-1.11-4.74-.67-5.92.28-1.89 1.15-3.71 4.81-3.71 8.52l6.53-.01v7.3l-13.56-.01c.17 3.75 2.22 6.76 6.03 8.44-.49 1.58-2.79 4.8-5.94 4.58-.62 3.41-1.22 5.33-4.05 8.43-2.84-3.1-3.43-5.02-4.06-8.43-3.15.22-5.45-3-5.94-4.58 3.81-1.68 5.86-4.69 6.04-8.44l-13.568.01v-7.3l6.538.01c0-3.71-1.82-7.37-3.72-8.52-1.176-.95-3.691-1.39-5.918-.28-2.914 1.68-3.039 6.42-1.582 8.59-13.762-2.56-12.396-15.85-7.709-20.67 3.789-3.9 7.92-4.51 11.105-3.28 7.234 2.6 12.104 11.24 12.344 24.16h3.78c0-11.74-2.04-15.49-7.36-30.23-2.68-6.97-1.07-15.59 3.72-23.52 1.72-2.85 3.86-5.41 6.33-8.16M0 226.61h226.61v135.96H0zM113.31 22.661c2.46 2.75 4.6 5.316 6.32 8.16 4.79 7.935 6.41 16.551 3.73 23.521-5.33 14.747-7.37 18.49-7.37 30.232h3.78c.24-12.917 5.11-21.563 12.35-24.159 3.18-1.229 7.31-.62 11.1 3.278 4.69 4.824 6.05 18.114-7.71 20.67 1.46-2.166 1.33-6.909-1.58-8.583-2.23-1.114-4.74-.678-5.92.28-1.89 1.145-3.71 4.806-3.71 8.514l6.53-.009v7.298l-13.56-.008c.17 3.754 2.22 6.761 6.03 8.435-.49 1.58-2.79 4.81-5.94 4.59-.62 3.41-1.22 5.32-4.05 8.42-2.84-3.1-3.43-5.01-4.06-8.42-3.15.22-5.45-3.01-5.94-4.59 3.81-1.674 5.86-4.681 6.04-8.435l-13.568.008v-7.298l6.538.009c0-3.708-1.82-7.369-3.72-8.514-1.176-.958-3.691-1.394-5.918-.28-2.914 1.674-3.039 6.417-1.582 8.583-13.762-2.556-12.396-15.846-7.709-20.67 3.789-3.897 7.92-4.507 11.105-3.278 7.234 2.595 12.104 11.242 12.344 24.159h3.78c0-11.742-2.04-15.486-7.36-30.232-2.68-6.97-1.07-15.586 3.72-23.521 1.72-2.844 3.86-5.411 6.33-8.16M0 0h226.61v135.96H0z"
          />
        </g>
      </svg>
      <span class="made-with-love-credit__swap-label">Quebec</span>
    </span>
    <span>by</span>
    <a
      v-if="makerHref"
      class="made-with-love-credit__maker"
      :href="makerHref"
      target="_blank"
      rel="noopener noreferrer"
    >
      {{ makerName }}
    </a>
    <span v-else class="made-with-love-credit__maker">{{ makerName }}</span>
  </p>
</template>

<style scoped>
.made-with-love-credit {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  color: var(--made-with-love-color, currentColor);
  font-size: var(--made-with-love-font-size, 0.95rem);
  line-height: 1.45;
}

.made-with-love-credit__swap {
  position: relative;
  display: inline-flex;
  width: var(--made-with-love-swap-icon-width, 1rem);
  align-items: center;
  justify-content: center;
  color: var(--made-with-love-emphasis-color, var(--made-with-love-color, currentColor));
  cursor: default;
  transition: width 180ms ease;
  user-select: none;
  vertical-align: middle;
}

.made-with-love-credit__swap--wide {
  --made-with-love-swap-icon-width: 1.35rem;
  --made-with-love-swap-label-width: 4rem;
}

.made-with-love-credit__swap:focus-within {
  width: var(--made-with-love-swap-label-width, 2.35rem);
}

.made-with-love-credit__heart {
  width: 1rem;
  height: 1rem;
}

.made-with-love-credit__quebec {
  width: 1.35rem;
  height: 1rem;
  border-radius: 0.12rem;
}

.made-with-love-credit__heart,
.made-with-love-credit__quebec,
.made-with-love-credit__swap-label {
  transition:
    opacity 160ms ease,
    transform 180ms ease;
}

.made-with-love-credit__swap-label {
  position: absolute;
  left: 50%;
}

.made-with-love-credit__swap-label {
  color: var(--made-with-love-emphasis-color, var(--made-with-love-color, currentColor));
  font-weight: 700;
  font-style: normal;
  opacity: 0;
  transform: translate(-50%, 0.1rem) scale(0.92);
  text-decoration: underline;
  text-decoration-thickness: 0.08em;
  text-underline-offset: 0.16em;
  white-space: nowrap;
}

.made-with-love-credit__swap:focus-within svg {
  opacity: 0;
  transform: translateY(-0.1rem) scale(0.78);
}

.made-with-love-credit__swap:focus-within .made-with-love-credit__swap-label {
  opacity: 1;
  transform: translate(-50%, 0) scale(1);
}

.made-with-love-credit__maker {
  color: var(--made-with-love-emphasis-color, var(--made-with-love-color, currentColor));
  font-weight: 700;
  text-decoration: none;
}

a.made-with-love-credit__maker:focus-visible {
  color: var(
    --made-with-love-hover-color,
    var(--made-with-love-emphasis-color, var(--made-with-love-color, currentColor))
  );
  text-decoration: underline;
  text-underline-offset: 0.16em;
}

.made-with-love-credit__swap:focus-visible {
  outline: 2px solid var(--made-with-love-hover-color, currentColor);
  outline-offset: 4px;
  border-radius: 2px;
}

@media (hover: hover) {
  .made-with-love-credit__swap:hover {
    width: var(--made-with-love-swap-label-width, 2.35rem);
  }

  .made-with-love-credit__swap:hover svg {
    opacity: 0;
    transform: translateY(-0.1rem) scale(0.78);
  }

  .made-with-love-credit__swap:hover .made-with-love-credit__swap-label {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }

  a.made-with-love-credit__maker:hover {
    color: var(--made-with-love-hover-color, var(--made-with-love-emphasis-color, currentColor));
    text-decoration: underline;
    text-underline-offset: 0.16em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .made-with-love-credit__swap,
  .made-with-love-credit__swap svg,
  .made-with-love-credit__swap-label {
    transition: none;
  }

  .made-with-love-credit__swap svg {
    transform: none;
  }

  .made-with-love-credit__swap .made-with-love-credit__swap-label {
    transform: translate(-50%, 0);
  }
}
</style>
