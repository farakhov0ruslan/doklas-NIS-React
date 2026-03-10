import { ref, computed } from 'vue'
import type { Place } from '@/types'

export const MAX_PRICE_LIMIT = 5000

export function useFilters() {
  const minRating = ref(0)
  const maxPrice = ref<number | null>(null)

  const activeCount = computed(() => {
    let n = 0
    if (minRating.value > 0) n++
    if (maxPrice.value !== null) n++
    return n
  })

  function apply(places: Place[]): Place[] {
    return places.filter(p => {
      if (p.rating < minRating.value) return false
      if (maxPrice.value !== null && p.price > maxPrice.value) return false
      return true
    })
  }

  function reset() {
    minRating.value = 0
    maxPrice.value = null
  }

  return { minRating, maxPrice, activeCount, apply, reset }
}
