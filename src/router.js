import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

// Hash history lets pages survive direct visits on static hosting.
export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/about', name: 'about', component: () => import('./views/ProfilePage.vue'), props: { page: 'about' } },
    { path: '/uses', name: 'uses', component: () => import('./views/ProfilePage.vue'), props: { page: 'uses' } },
    { path: '/notes', name: 'notes', component: () => import('./views/NotesView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
