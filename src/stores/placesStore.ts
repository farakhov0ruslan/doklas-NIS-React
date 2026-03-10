import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Place, Category, UserPreferences } from '@/types'

export const usePlacesStore = defineStore('places', () => {
  const all = ref<Place[]>([])
  const recommended = ref<Place[]>([])
  const currentPlace = ref<Place | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const byCategory = computed(() => (category: Category) => {
    const source = recommended.value.length > 0 ? recommended.value : all.value
    return source.filter(p => p.category === category)
  })

  const getById = computed(() => (id: string) => {
    return (
      all.value.find(p => p.id === id) ??
      recommended.value.find(p => p.id === id)
    )
  })

  async function fetchAll(category?: Category) {
    loading.value = true
    error.value = null
    try {
      const url = category ? `/api/places?category=${category}` : '/api/places'
      const res = await fetch(url)
      const data = await res.json() as { places: Place[] }
      all.value = data.places
    } catch {
      error.value = 'Не удалось загрузить места'
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`/api/places/${id}`)
      if (!res.ok) throw new Error('not found')
      const data = await res.json() as { place: Place }
      currentPlace.value = data.place
    } catch {
      error.value = 'Место не найдено'
    } finally {
      loading.value = false
    }
  }

  async function fetchRecommendations(prefs: UserPreferences) {
    loading.value = true
    error.value = null
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: prefs }),
      })
      const data = await res.json() as { places: Place[] }
      recommended.value = data.places
    } catch {
      error.value = 'Не удалось получить рекомендации'
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    all,
    recommended,
    currentPlace,
    loading,
    error,
    byCategory,
    getById,
    fetchAll,
    fetchById,
    fetchRecommendations,
    clearError,
  }
})
