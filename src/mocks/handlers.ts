import { http, HttpResponse, delay } from 'msw'
import type { Category, UserPreferences, RecalculateAction, DayPlan } from '@/types'
import { allPlaces } from './data/places'
import { getRecommendations } from './data/recommendations'
import { generateRoute, recalculateRoute } from '@/utils/routeAlgorithm'

export const handlers = [
  http.get('/api/places', async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const category = url.searchParams.get('category') as Category | null
    const places = category ? allPlaces.filter(p => p.category === category) : allPlaces
    return HttpResponse.json({ places })
  }),

  http.get('/api/places/:id', async ({ params }) => {
    await delay(200)
    const place = allPlaces.find(p => p.id === params['id'])
    if (!place) {
      return HttpResponse.json({ message: 'Place not found' }, { status: 404 })
    }
    return HttpResponse.json({ place })
  }),

  http.post('/api/recommendations', async ({ request }) => {
    await delay(500)
    const body = await request.json() as { preferences: UserPreferences }
    const places = getRecommendations(body.preferences, allPlaces)
    return HttpResponse.json({ places })
  }),

  http.post('/api/route/generate', async ({ request }) => {
    await delay(800)
    const body = await request.json() as { placeIds: string[]; tripDays: number }
    const places = body.placeIds
      .map(id => allPlaces.find(p => p.id === id))
      .filter((p): p is (typeof allPlaces)[number] => p !== undefined)
    const days = generateRoute(places, body.tripDays)
    return HttpResponse.json({ days })
  }),

  http.post('/api/route/recalculate', async ({ request }) => {
    await delay(600)
    const body = await request.json() as {
      days: DayPlan[]
      action: RecalculateAction
      preferences: UserPreferences
    }
    const days = recalculateRoute(body.days, body.action, allPlaces, body.preferences)
    return HttpResponse.json({ days })
  }),
]
