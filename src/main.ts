import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'
import router from './router'
import './styles/main.css'
import 'vue-sonner/style.css'

import { createUnhead } from '@unhead/vue'

const app = createApp(App)
const head = createUnhead()

app.use(createPinia())
app.use(router)
app.use(MotionPlugin)
app.use(head as any)

app.mount('#app')

