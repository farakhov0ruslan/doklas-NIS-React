import { DAY_START_HOUR } from './constants'

export function minutesToTimeString(totalMinutes: number, baseHour = DAY_START_HOUR): string {
  const hours = Math.floor(totalMinutes / 60) + baseHour
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function addMinutes(time: string, minutes: number): string {
  const parts = time.split(':').map(Number)
  const h = parts[0] ?? 0
  const m = parts[1] ?? 0
  const total = h * 60 + m + minutes
  const newH = Math.floor(total / 60)
  const newM = total % 60
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} мин`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} ч` : `${h} ч ${m} мин`
}

export function formatPrice(price: number): string {
  return price === 0 ? 'Бесплатно' : `${price.toLocaleString('ru-RU')} ₽`
}
