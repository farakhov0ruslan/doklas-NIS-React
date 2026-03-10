import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePlannerStore } from '@/stores/plannerStore'
import { usePlacesStore } from '@/stores/placesStore'
import { useUserStore } from '@/stores/userStore'
import type { DayPlan, Place, UserPreferences } from '@/types'

const makeDayPlan = (dayNumber: number, placeIds: string[]): DayPlan => ({
  dayNumber,
  places: placeIds.map(id => ({ placeId: id, startTime: '09:00', endTime: '10:00' })),
  totalDuration: placeIds.length * 60,
})

const makePlace = (id: string, duration = 60): Place => ({
  id,
  name: id,
  category: 'museums',
  shortDescription: '',
  description: '',
  duration,
  price: 0,
  image: '',
  rating: 4,
  location: '',
  address: '',
  openHours: '',
  tags: [],
})

const prefs: UserPreferences = {
  interests: ['museums'],
  budget: 'medium',
  travelStyle: ['cultural'],
  tripDays: 2,
  pace: 'moderate',
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('plannerStore - initial state', () => {
  it('starts with no days and isGenerated false', () => {
    const store = usePlannerStore()
    expect(store.days).toHaveLength(0)
    expect(store.isGenerated).toBe(false)
  })
})

describe('plannerStore - generate', () => {
  it('calls POST /api/route/generate and stores result', async () => {
    const mockDays = [makeDayPlan(1, ['p1', 'p2']), makeDayPlan(2, ['p3'])]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ days: mockDays }),
    }))

    const store = usePlannerStore()
    await store.generate(['p1', 'p2', 'p3'], 2)

    expect(store.isGenerated).toBe(true)
    expect(store.days).toHaveLength(2)
    expect(store.totalPlaces).toBe(3)
  })

  it('sets error on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))

    const store = usePlannerStore()
    await store.generate(['p1'], 1)

    expect(store.error).toBeTruthy()
    expect(store.isGenerated).toBe(false)
  })
})

describe('plannerStore - local operations', () => {
  beforeEach(() => {
    const placesStore = usePlacesStore()
    placesStore.all = ['p1', 'p2', 'p3', 'p4'].map(id => makePlace(id))
  })

  it('removePlaceFromDay removes the place', () => {
    const store = usePlannerStore()
    store.days = [makeDayPlan(1, ['p1', 'p2'])]
    store.isGenerated = true

    store.removePlaceFromDay(1, 'p1')
    expect(store.days[0]!.places.map(p => p.placeId)).toEqual(['p2'])
  })

  it('movePlace transfers between days', () => {
    const store = usePlannerStore()
    store.days = [makeDayPlan(1, ['p1', 'p2']), makeDayPlan(2, ['p3'])]
    store.isGenerated = true

    store.movePlace(1, 2, 'p1')
    expect(store.days[0]!.places.map(p => p.placeId)).toEqual(['p2'])
    expect(store.days[1]!.places.map(p => p.placeId)).toContain('p1')
  })

  it('reorderInDay swaps places within a day', () => {
    const store = usePlannerStore()
    store.days = [makeDayPlan(1, ['p1', 'p2', 'p3'])]
    store.isGenerated = true

    store.reorderInDay(1, 0, 2)
    expect(store.days[0]!.places[0]!.placeId).toBe('p2')
    expect(store.days[0]!.places[2]!.placeId).toBe('p1')
  })
})

describe('plannerStore - resetPlan', () => {
  it('clears days and isGenerated', () => {
    const store = usePlannerStore()
    store.days = [makeDayPlan(1, ['p1'])]
    store.isGenerated = true

    store.resetPlan()
    expect(store.days).toHaveLength(0)
    expect(store.isGenerated).toBe(false)
    expect(localStorage.getItem('atlas:plan')).toBeNull()
  })
})

describe('plannerStore - recalculate', () => {
  it('calls POST /api/route/recalculate with current days', async () => {
    const userStore = useUserStore()
    userStore.setPreferences(prefs)

    const newDays = [makeDayPlan(1, ['p1'])]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ days: newDays }),
    }))

    const store = usePlannerStore()
    store.days = [makeDayPlan(1, ['p1', 'p2'])]
    store.isGenerated = true

    await store.recalculate('lighter')
    expect(store.days).toEqual(newDays)
  })
})
