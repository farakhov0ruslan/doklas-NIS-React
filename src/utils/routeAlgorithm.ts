import type { Place, DayPlan, PlaceInDay, UserPreferences, RecalculateAction } from '@/types'
import { MAX_DAY_MINUTES, TRAVEL_TIME_MINUTES, DAY_START_HOUR } from './constants'
import { addMinutes } from './timeHelpers'

export function buildTimeline(places: Place[]): PlaceInDay[] {
  const startOfDay = `${String(DAY_START_HOUR).padStart(2, '0')}:00`
  const result: PlaceInDay[] = []
  let cursor = startOfDay

  for (const place of places) {
    const start = cursor
    const end = addMinutes(start, place.duration)
    result.push({ placeId: place.id, startTime: start, endTime: end })
    // +30 min gap between places for travel
    cursor = addMinutes(end, TRAVEL_TIME_MINUTES)
  }

  return result
}

export function generateRoute(places: Place[], tripDays: number): DayPlan[] {
  const sorted = [...places].sort((a, b) => b.duration - a.duration)

  const days: { places: Place[]; totalDuration: number }[] = Array.from(
    { length: tripDays },
    () => ({ places: [], totalDuration: 0 })
  )

  for (const place of sorted) {
    // find the day with most free time that can still fit this place
    const available = days
      .map((d, i) => ({ i, free: MAX_DAY_MINUTES - d.totalDuration }))
      .filter(d => d.free >= place.duration)
      .sort((a, b) => b.free - a.free)

    const targetIndex = available.length > 0
      ? available[0]!.i
      : days.reduce((minI, d, i) => d.totalDuration < (days[minI]?.totalDuration ?? Infinity) ? i : minI, 0)

    const target = days[targetIndex]!
    target.places.push(place)
    target.totalDuration += place.duration + TRAVEL_TIME_MINUTES
  }

  return days.map((d, i) => ({
    dayNumber: i + 1,
    places: buildTimeline(d.places),
    totalDuration: d.places.reduce((sum, p) => sum + p.duration, 0),
  }))
}

export function recalculateRoute(
  days: DayPlan[],
  action: RecalculateAction,
  allPlaces: Place[],
  preferences: UserPreferences
): DayPlan[] {
  const byId = new Map(allPlaces.map(p => [p.id, p]))

  if (action === 'lighter') {
    return days.map(day => {
      if (day.places.length <= 1) return day

      // remove the place with the longest duration from each day
      const withDurations = day.places.map(p => ({
        p,
        duration: byId.get(p.placeId)?.duration ?? 0,
      }))
      const longestIndex = withDurations.reduce(
        (maxI, item, i) => item.duration > (withDurations[maxI]?.duration ?? 0) ? i : maxI,
        0
      )
      const filtered = day.places.filter((_, i) => i !== longestIndex)
      const placeObjects = filtered
        .map(p => byId.get(p.placeId))
        .filter((p): p is Place => p !== undefined)

      return {
        dayNumber: day.dayNumber,
        places: buildTimeline(placeObjects),
        totalDuration: placeObjects.reduce((sum, p) => sum + p.duration, 0),
      }
    })
  }

  if (action === 'optimize') {
    return days.map(day => {
      const placeObjects = day.places
        .map(p => byId.get(p.placeId))
        .filter((p): p is Place => p !== undefined)
      const sorted = [...placeObjects].sort((a, b) => a.duration - b.duration)

      return {
        dayNumber: day.dayNumber,
        places: buildTimeline(sorted),
        totalDuration: day.totalDuration,
      }
    })
  }

  if (action === 'more') {
    const usedIds = new Set(days.flatMap(d => d.places.map(p => p.placeId)))

    const candidates = allPlaces
      .filter(p => !usedIds.has(p.id) && preferences.interests.includes(p.category))
      .sort((a, b) => b.rating - a.rating)

    let candidateIndex = 0
    return days.map(day => {
      if (candidateIndex >= candidates.length) return day

      const candidate = candidates[candidateIndex++]
      if (!candidate) return day

      const placeObjects = [
        ...day.places.map(p => byId.get(p.placeId)).filter((p): p is Place => p !== undefined),
        candidate,
      ]

      return {
        dayNumber: day.dayNumber,
        places: buildTimeline(placeObjects),
        totalDuration: placeObjects.reduce((sum, p) => sum + p.duration, 0),
      }
    })
  }

  return days
}
