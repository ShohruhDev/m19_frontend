import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'
import router from './router'
import './styles/main.css'
import 'vue-sonner/style.css'

import { createUnhead, headSymbol } from '@unhead/vue' // Import symbol

const app = createApp(App)
const head = createUnhead()

app.use(createPinia())
app.use(router)
app.use(MotionPlugin)

// Manually provide head to fix injection error
app.provide(headSymbol, head)
// Also try generic 'usehead' string just in case
app.provide('usehead', head)

app.mount('#app')

