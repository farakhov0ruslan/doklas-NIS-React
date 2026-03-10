import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { vIntersection } from '@/directives/vIntersection'
import '@/assets/styles/global.css'

async function init() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.directive('intersection', vIntersection)
  app.mount('#app')
}

init()
