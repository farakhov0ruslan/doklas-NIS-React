import { describe, it, expect } from 'vitest'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from '@/App.vue'

describe('project setup', () => {
  it('mounts the app without errors', async () => {
    const div = document.createElement('div')
    document.body.appendChild(div)

    const app = createApp(App)
    app.use(createPinia())
    app.use(router)

    expect(() => app.mount(div)).not.toThrow()

    await router.isReady()
    app.unmount()
    document.body.removeChild(div)
  })

  it('pinia creates store without errors', () => {
    expect(createPinia()).toBeDefined()
  })
})
