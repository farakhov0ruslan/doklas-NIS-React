import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { CartItem } from '@/types'
import { usePlacesStore } from './placesStore'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const saved = localStorage.getItem('atlas:cart')
  if (saved) {
    try {
      items.value = JSON.parse(saved) as CartItem[]
    } catch {
      localStorage.removeItem('atlas:cart')
    }
  }

  const count = computed(() => items.value.length)

  const isInCart = computed(() => (placeId: string) =>
    items.value.some(i => i.placeId === placeId)
  )

  const places = computed(() => {
    const placesStore = usePlacesStore()
    const pool = [...placesStore.all, ...placesStore.recommended]
    return items.value
      .map(item => pool.find(p => p.id === item.placeId))
      .filter(p => p !== undefined)
  })

  const totalDuration = computed(() =>
    places.value.reduce((sum, p) => sum + p.duration, 0)
  )

  const totalEstimatedCost = computed(() =>
    places.value.reduce((sum, p) => sum + p.price, 0)
  )

  function add(placeId: string) {
    if (items.value.some(i => i.placeId === placeId)) return
    items.value.push({ placeId, addedAt: new Date().toISOString() })
    persist()
  }

  function remove(placeId: string) {
    items.value = items.value.filter(i => i.placeId !== placeId)
    persist()
  }

  function reorder(fromIndex: number, toIndex: number) {
    const item = items.value.splice(fromIndex, 1)[0]
    if (!item) return
    items.value.splice(toIndex, 0, item)
    persist()
  }

  function clear() {
    items.value = []
    localStorage.removeItem('atlas:cart')
  }

  function persist() {
    localStorage.setItem('atlas:cart', JSON.stringify(items.value))
  }

  return {
    items,
    count,
    isInCart,
    places,
    totalDuration,
    totalEstimatedCost,
    add,
    remove,
    reorder,
    clear,
  }
})
