import type { Category, Budget, Pace, TravelStyle } from '@/types'

export const CATEGORIES: Record<Category, { label: string; color: string; emoji: string }> = {
  museums:    { label: 'Музеи и достопримечательности', color: '#9B59B6', emoji: '🏛️' },
  food:       { label: 'Вкусно поесть',                 color: '#E67E22', emoji: '🍽️' },
  music:      { label: 'Музыка, бары, эстрим',          color: '#3498DB', emoji: '🎵' },
  excursions: { label: 'Экскурсии',                     color: '#27AE60', emoji: '🗺️' },
  shopping:   { label: 'Шопинг',                        color: '#E91E63', emoji: '🛍️' },
  extreme:    { label: 'Экстрим',                       color: '#F39C12', emoji: '⚡' },
}

export const BUDGET_LABELS: Record<Budget, string> = {
  low:    'Экономно (до 1 000 ₽/день)',
  medium: 'Комфорт (до 3 000 ₽/день)',
  high:   'Без ограничений',
}

export const PACE_LABELS: Record<Pace, string> = {
  relaxed:   'Спокойный — 3–4 места в день',
  moderate:  'Умеренный — 5–6 мест в день',
  intensive: 'Активный — 7+ мест в день',
}

export const TRAVEL_STYLE_LABELS: Record<TravelStyle, string> = {
  cultural:  'Культура и история',
  party:     'Вечеринки и ночная жизнь',
  nature:    'Природа и парки',
  gastro:    'Гастрономический тур',
  adventure: 'Приключения',
  mixed:     'Всего понемногу',
}

export const BUDGET_PRICE_LIMITS: Record<Budget, number> = {
  low:    500,
  medium: 1500,
  high:   Infinity,
}

export const PACE_PLACES_PER_DAY: Record<Pace, number> = {
  relaxed:   4,
  moderate:  6,
  intensive: 10,
}

export const MAX_DAY_MINUTES = 480
export const TRAVEL_TIME_MINUTES = 30
export const DAY_START_HOUR = 9
