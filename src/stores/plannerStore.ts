import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { DayPlan, Place, RecalculateAction } from '@/types'
import { usePlacesStore } from './placesStore'
import { useUserStore } from './userStore'
import { buildTimeline } from '@/utils/routeAlgorithm'

export const usePlannerStore = defineStore('planner', () => {
  const days = ref<DayPlan[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isGenerated = ref(false)

  const saved = localStorage.getItem('atlas:plan')
  if (saved) {
    try {
      const data = JSON.parse(saved) as { days: DayPlan[] }
      days.value = data.days
      isGenerated.value = days.value.length > 0
    } catch {
      localStorage.removeItem('atlas:plan')
    }
  }

  const totalPlaces = computed(() =>
    days.value.reduce((sum, d) => sum + d.places.length, 0)
  )

  const dayByNumber = computed(() => (n: number) =>
    days.value.find(d => d.dayNumber === n)
  )

  const allPlaceIds = computed(() =>
    days.value.flatMap(d => d.places.map(p => p.placeId))
  )

  async function generate(placeIds: string[], tripDays: number) {
    loading.value = true
    error.value = null
    try {
      const res = await fetch('/api/route/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeIds, tripDays }),
      })
      const data = await res.json() as { days: DayPlan[] }
      days.value = data.days
      isGenerated.value = true
      persist()
    } catch {
      error.value = 'Не удалось сгенерировать маршрут'
    } finally {
      loading.value = false
    }
  }

  async function recalculate(action: RecalculateAction) {
    const userStore = useUserStore()
    if (!userStore.preferences) return

    loading.value = true
    error.value = null
    try {
      const res = await fetch('/api/route/recalculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days: days.value,
          action,
          preferences: userStore.preferences,
        }),
      })
      const data = await res.json() as { days: DayPlan[] }
      days.value = data.days
      persist()
    } catch {
      error.value = 'Не удалось пересчитать маршрут'
    } finally {
      loading.value = false
    }
  }

  function movePlace(sourceDayNum: number, targetDayNum: number, placeId: string) {
    const placesStore = usePlacesStore()
    const source = days.value.find(d => d.dayNumber === sourceDayNum)
    const target = days.value.find(d => d.dayNumber === targetDayNum)
    if (!source || !target) return

    const entry = source.places.find(p => p.placeId === placeId)
    if (!entry) return

    source.places = source.places.filter(p => p.placeId !== placeId)
    target.places = [...target.places, entry]

    rebuildDay(source, placesStore.all.concat(placesStore.recommended))
    rebuildDay(target, placesStore.all.concat(placesStore.recommended))
    persist()
  }

  function removePlaceFromDay(dayNum: number, placeId: string) {
    const placesStore = usePlacesStore()
    const day = days.value.find(d => d.dayNumber === dayNum)
    if (!day) return

    day.places = day.places.filter(p => p.placeId !== placeId)
    rebuildDay(day, placesStore.all.concat(placesStore.recommended))
    persist()
  }

  function reorderInDay(dayNum: number, fromIndex: number, toIndex: number) {
    const placesStore = usePlacesStore()
    const day = days.value.find(d => d.dayNumber === dayNum)
    if (!day) return

    const entry = day.places.splice(fromIndex, 1)[0]
    if (!entry) return
    day.places.splice(toIndex, 0, entry)
    rebuildDay(day, placesStore.all.concat(placesStore.recommended))
    persist()
  }

  function resetPlan() {
    days.value = []
    isGenerated.value = false
    error.value = null
    localStorage.removeItem('atlas:plan')
  }

  function rebuildDay(day: DayPlan, allPlaces: Place[]) {
    const placeObjects = day.places
      .map(p => allPlaces.find(pl => pl.id === p.placeId))
      .filter(p => p !== undefined)

    day.places = buildTimeline(placeObjects)
    day.totalDuration = placeObjects.reduce((sum, p) => sum + p.duration, 0)
  }

  function persist() {
    localStorage.setItem('atlas:plan', JSON.stringify({ days: days.value }))
  }

  return {
    days,
    loading,
    error,
    isGenerated,
    totalPlaces,
    dayByNumber,
    allPlaceIds,
    generate,
    recalculate,
    movePlace,
    removePlaceFromDay,
    reorderInDay,
    resetPlan,
  }
})
