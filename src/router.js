import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

// Preserve old bookmarks while presenting canonical, query-free page URLs.
const legacyPath = window.location.hash.startsWith('#/notes') ? '/notes' : window.location.hash === '#/' ? '/' : window.location.pathname.replace(/\/+$/, '') || '/'
if (['/', '/notes'].includes(legacyPath)) window.history.replaceState(null, '', legacyPath)

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/notes', name: 'notes', component: () => import('./views/NotesView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
