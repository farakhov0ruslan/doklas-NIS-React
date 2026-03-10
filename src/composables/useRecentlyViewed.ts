import { ref } from 'vue'

const MAX = 8
const KEY = 'atlas:recent'

const ids = ref<string[]>((() => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[] }
  catch { return [] }
})())

export function useRecentlyViewed() {
  function track(id: string) {
    ids.value = [id, ...ids.value.filter(i => i !== id)].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(ids.value))
  }

  function clear() {
    ids.value = []
    localStorage.removeItem(KEY)
  }

  return { ids, track, clear }
}
