import { ref, watchEffect } from 'vue'

const STORAGE_KEY = 'atlas:theme'

const prefersDark = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  ? window.matchMedia('(prefers-color-scheme: dark)').matches
  : false
const stored = localStorage.getItem(STORAGE_KEY)

const isDark = ref<boolean>(stored !== null ? stored === 'dark' : prefersDark)

watchEffect(() => {
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light')
})

export function useTheme() {
  function toggle() {
    isDark.value = !isDark.value
  }
  return { isDark, toggle }
}
