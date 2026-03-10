import { ref } from 'vue'
import type { Place } from '@/types'

export type SortKey = 'rating' | 'price' | 'duration' | 'name'
export type SortDir = 'asc' | 'desc'

export function useSort() {
  const sortKey = ref<SortKey>('rating')
  const sortDir = ref<SortDir>('desc')

  function setSort(key: SortKey) {
    if (sortKey.value === key) {
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortDir.value = key === 'price' || key === 'duration' ? 'asc' : 'desc'
    }
  }

  function sorted(places: Place[]): Place[] {
    return [...places].sort((a, b) => {
      let cmp = 0
      switch (sortKey.value) {
        case 'rating':   cmp = a.rating - b.rating; break
        case 'price':    cmp = a.price - b.price; break
        case 'duration': cmp = a.duration - b.duration; break
        case 'name':     cmp = a.name.localeCompare(b.name, 'ru'); break
      }
      return sortDir.value === 'asc' ? cmp : -cmp
    })
  }

  return { sortKey, sortDir, setSort, sorted }
}
