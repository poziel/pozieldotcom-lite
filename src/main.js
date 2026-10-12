import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import App from './App.vue'
import router from './router.js'
import './style.css'

createApp(App).use(PrimeVue, { unstyled: true }).use(router).mount('#app')
