import { describe, it, expect } from 'vitest'
import { generateRoute, recalculateRoute } from '@/utils/routeAlgorithm'
import type { Place, UserPreferences } from '@/types'

const makePlaces = (overrides: Partial<Place>[]): Place[] =>
  overrides.map((o, i) => ({
    id: `p${i}`,
    name: `Place ${i}`,
    category: 'museums',
    shortDescription: '',
    description: '',
    duration: 60,
    price: 0,
    image: '',
    rating: 4.0,
    location: '',
    address: '',
    openHours: '',
    tags: [],
    ...o,
  }))

const defaultPrefs: UserPreferences = {
  interests: ['museums'],
  budget: 'medium',
  travelStyle: ['cultural'],
  tripDays: 2,
  pace: 'moderate',
}

describe('generateRoute', () => {
  it('distributes places across the correct number of days', () => {
    const places = makePlaces([{}, {}, {}, {}])
    const result = generateRoute(places, 2)
    expect(result).toHaveLength(2)
  })

  it('assigns day numbers starting from 1', () => {
    const places = makePlaces([{}])
    const result = generateRoute(places, 1)
    expect(result[0]!.dayNumber).toBe(1)
  })

  it('calculates totalDuration correctly', () => {
    const places = makePlaces([{ duration: 60 }, { duration: 90 }])
    const result = generateRoute(places, 1)
    expect(result[0]!.totalDuration).toBe(150)
  })

  it('sets sequential start and end times', () => {
    const places = makePlaces([{ duration: 60 }])
    const result = generateRoute(places, 1)
    expect(result[0]!.places[0]!.startTime).toBe('09:00')
    expect(result[0]!.places[0]!.endTime).toBe('10:00')
  })

  it('includes travel gap between places', () => {
    const places = makePlaces([{ duration: 60 }, { duration: 60 }])
    const result = generateRoute(places, 1)
    // first ends 10:00, +30min travel = 10:30 start for second
    expect(result[0]!.places[1]!.startTime).toBe('10:30')
  })
})

describe('recalculateRoute - lighter', () => {
  it('removes the longest place from each day', () => {
    const places = makePlaces([{ duration: 120 }, { duration: 60 }])
    const route = generateRoute(places, 1)
    const result = recalculateRoute(route, 'lighter', places, defaultPrefs)
    const day = result[0]!
    expect(day.places).toHaveLength(1)
    expect(day.places[0]!.placeId).toBe('p1')
  })
})

describe('recalculateRoute - optimize', () => {
  it('sorts places by duration ascending', () => {
    const places = makePlaces([{ id: 'long', duration: 180 }, { id: 'short', duration: 30 }])
    const route = generateRoute(places, 1)
    const result = recalculateRoute(route, 'optimize', places, defaultPrefs)
    expect(result[0]!.places[0]!.placeId).toBe('short')
  })
})

describe('recalculateRoute - more', () => {
  it('adds one new place per day from candidates', () => {
    const places = makePlaces([{ id: 'a', duration: 60 }])
    const extra = makePlaces([{ id: 'b', duration: 60 }, { id: 'c', duration: 60 }])
    const allPlaces = [...places, ...extra]
    const route = generateRoute(places, 1)
    const result = recalculateRoute(route, 'more', allPlaces, defaultPrefs)
    expect(result[0]!.places.length).toBeGreaterThan(route[0]!.places.length)
  })
})
