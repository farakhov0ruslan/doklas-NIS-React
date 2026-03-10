import { describe, it, expect } from 'vitest'
import { minutesToTimeString, addMinutes, formatDuration, formatPrice } from '@/utils/timeHelpers'

describe('minutesToTimeString', () => {
  it('converts 0 minutes to 09:00', () => {
    expect(minutesToTimeString(0)).toBe('09:00')
  })

  it('converts 90 minutes to 10:30', () => {
    expect(minutesToTimeString(90)).toBe('10:30')
  })

  it('respects custom base hour', () => {
    expect(minutesToTimeString(60, 10)).toBe('11:00')
  })
})

describe('addMinutes', () => {
  it('adds 90 minutes to 09:00', () => {
    expect(addMinutes('09:00', 90)).toBe('10:30')
  })

  it('crosses hour boundary correctly', () => {
    expect(addMinutes('10:45', 30)).toBe('11:15')
  })

  it('handles adding 0 minutes', () => {
    expect(addMinutes('14:00', 0)).toBe('14:00')
  })
})

describe('formatDuration', () => {
  it('formats minutes only when under 60', () => {
    expect(formatDuration(45)).toBe('45 мин')
  })

  it('formats exact hours', () => {
    expect(formatDuration(120)).toBe('2 ч')
  })

  it('formats hours and minutes', () => {
    expect(formatDuration(90)).toBe('1 ч 30 мин')
  })
})

describe('formatPrice', () => {
  it('returns "Бесплатно" for 0', () => {
    expect(formatPrice(0)).toBe('Бесплатно')
  })

  it('formats price with ₽', () => {
    expect(formatPrice(700)).toContain('₽')
    expect(formatPrice(700)).toContain('700')
  })
})
