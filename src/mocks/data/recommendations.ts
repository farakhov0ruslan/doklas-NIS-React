import type { Place, UserPreferences, Category } from '@/types'
import { BUDGET_PRICE_LIMITS, PACE_PLACES_PER_DAY } from '@/utils/constants'

// Maps travel style to bonus categories that get a rating boost
const STYLE_BONUS: Record<string, Category[]> = {
  cultural:  ['museums', 'excursions'],
  party:     ['music'],
  nature:    ['excursions', 'extreme'],
  gastro:    ['food'],
  adventure: ['extreme', 'excursions'],
  mixed:     [],
}

export function getRecommendations(prefs: UserPreferences, allPlaces: Place[]): Place[] {
  const priceLimit = BUDGET_PRICE_LIMITS[prefs.budget]
  const maxTotal = PACE_PLACES_PER_DAY[prefs.pace] * prefs.tripDays
  const bonusCategories = prefs.travelStyle.flatMap(s => STYLE_BONUS[s] ?? [])

  const filtered = allPlaces
    .filter(p => prefs.interests.includes(p.category))
    .filter(p => p.price === 0 || p.price <= priceLimit)
    .sort((a, b) => {
      // bonus categories from travel style float to the top
      const aBonus = bonusCategories.includes(a.category) ? 0.5 : 0
      const bBonus = bonusCategories.includes(b.category) ? 0.5 : 0
      return (b.rating + bBonus) - (a.rating + aBonus)
    })

  return filtered.slice(0, maxTotal)
}
