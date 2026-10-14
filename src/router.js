import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

// Hash history lets pages survive direct visits on static hosting.
export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/', component: HomeView,
      children: [
        { path: '', name: 'home', component: () => import('./views/HomeContent.vue') },
        { path: 'about', name: 'about', component: () => import('./views/ProfilePage.vue'), props: { page: 'about' } },
        { path: 'works', name: 'works', component: () => import('./views/ProfilePage.vue'), props: { page: 'works' } },
        { path: 'favorites', name: 'favorites', component: () => import('./views/FavoritesView.vue') },
      ],
    },
    { path: '/notes', name: 'notes', component: () => import('./views/NotesView.vue') },
    { path: '/uses', redirect: '/works' },
    { path: '/professional', redirect: '/works' },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => false,
})
