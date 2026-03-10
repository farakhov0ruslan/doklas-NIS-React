import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from '@/mocks/handlers'
import { allPlaces } from '@/mocks/data/places'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('GET /api/places', () => {
  it('returns all places', async () => {
    const res = await fetch('/api/places')
    const data = await res.json() as { places: typeof allPlaces }
    expect(data.places).toHaveLength(allPlaces.length)
  })

  it('filters by category', async () => {
    const res = await fetch('/api/places?category=museums')
    const data = await res.json() as { places: typeof allPlaces }
    data.places.forEach(p => expect(p.category).toBe('museums'))
  })
})

describe('GET /api/places/:id', () => {
  it('returns a place by id', async () => {
    const res = await fetch('/api/places/place-001')
    const data = await res.json() as { place: (typeof allPlaces)[number] }
    expect(data.place.id).toBe('place-001')
  })

  it('returns 404 for unknown id', async () => {
    const res = await fetch('/api/places/not-exist')
    expect(res.status).toBe(404)
  })
})

describe('POST /api/recommendations', () => {
  it('returns filtered places for given preferences', async () => {
    const res = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preferences: {
          interests: ['food'],
          budget: 'high',
          travelStyle: ['gastro'],
          tripDays: 2,
          pace: 'moderate',
        },
      }),
    })
    const data = await res.json() as { places: typeof allPlaces }
    data.places.forEach(p => expect(p.category).toBe('food'))
  })
})

describe('POST /api/route/generate', () => {
  it('returns a day plan for given place ids', async () => {
    const placeIds = ['place-001', 'place-002', 'place-003']
    const res = await fetch('/api/route/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeIds, tripDays: 2 }),
    })
    const data = await res.json() as { days: { dayNumber: number; places: unknown[] }[] }
    expect(data.days).toHaveLength(2)
    const totalPlaces = data.days.reduce((s, d) => s + d.places.length, 0)
    expect(totalPlaces).toBe(3)
  })
})

describe('POST /api/route/recalculate', () => {
  it('returns updated days for lighter action', async () => {
    const days = [
      {
        dayNumber: 1,
        places: [
          { placeId: 'place-001', startTime: '09:00', endTime: '12:00' },
          { placeId: 'place-006', startTime: '12:30', endTime: '13:30' },
        ],
        totalDuration: 240,
      },
    ]
    const res = await fetch('/api/route/recalculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        days,
        action: 'lighter',
        preferences: {
          interests: ['museums'],
          budget: 'medium',
          travelStyle: ['cultural'],
          tripDays: 1,
          pace: 'relaxed',
        },
      }),
    })
    const data = await res.json() as { days: typeof days }
    expect(data.days[0]?.places.length).toBeLessThan(2)
  })
})
