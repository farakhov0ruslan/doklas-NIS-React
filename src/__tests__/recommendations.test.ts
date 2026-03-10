import { describe, it, expect } from 'vitest'
import { getRecommendations } from '@/mocks/data/recommendations'
import { allPlaces } from '@/mocks/data/places'
import type { UserPreferences } from '@/types'

const basePrefs: UserPreferences = {
  interests: ['museums', 'food'],
  budget: 'medium',
  travelStyle: ['cultural'],
  tripDays: 3,
  pace: 'moderate',
}

describe('getRecommendations', () => {
  it('returns only places matching selected interests', () => {
    const result = getRecommendations(basePrefs, allPlaces)
    result.forEach(p => {
      expect(['museums', 'food']).toContain(p.category)
    })
  })

  it('excludes places above budget price limit', () => {
    const prefs: UserPreferences = { ...basePrefs, budget: 'low' }
    const result = getRecommendations(prefs, allPlaces)
    result.forEach(p => {
      expect(p.price === 0 || p.price <= 500).toBe(true)
    })
  })

  it('returns places sorted by effective rating descending (with style bonus)', () => {
    const STYLE_BONUS_CATS: Record<string, string[]> = {
      cultural: ['museums', 'excursions'],
    }
    const bonusCats = basePrefs.travelStyle.flatMap(s => STYLE_BONUS_CATS[s] ?? [])
    const effectiveRating = (p: { rating: number; category: string }) =>
      p.rating + (bonusCats.includes(p.category) ? 0.5 : 0)

    const result = getRecommendations(basePrefs, allPlaces)
    for (let i = 1; i < result.length; i++) {
      expect(effectiveRating(result[i - 1]!)).toBeGreaterThanOrEqual(effectiveRating(result[i]!))
    }
  })

  it('returns empty array when no interests match', () => {
    const prefs: UserPreferences = { ...basePrefs, interests: [] }
    const result = getRecommendations(prefs, allPlaces)
    expect(result).toHaveLength(0)
  })
})
