import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useFavoritesStore = defineStore('favorites', () => {
  const ids = ref<string[]>([])

  const saved = localStorage.getItem('atlas:favorites')
  if (saved) {
    try { ids.value = JSON.parse(saved) as string[] }
    catch { localStorage.removeItem('atlas:favorites') }
  }

  const isFavorite = computed(() => (id: string) => ids.value.includes(id))
  const count = computed(() => ids.value.length)

  function toggle(id: string) {
    if (ids.value.includes(id)) {
      ids.value = ids.value.filter(i => i !== id)
    } else {
      ids.value.push(id)
    }
    persist()
  }

  function persist() {
    localStorage.setItem('atlas:favorites', JSON.stringify(ids.value))
  }

  return { ids, isFavorite, count, toggle }
})
