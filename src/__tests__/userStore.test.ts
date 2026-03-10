import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import type { UserPreferences } from '@/types'

const prefs: UserPreferences = {
  interests: ['museums', 'food'],
  budget: 'medium',
  travelStyle: ['cultural'],
  tripDays: 3,
  pace: 'moderate',
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('userStore', () => {
  it('starts with no preferences', () => {
    const store = useUserStore()
    expect(store.preferences).toBeNull()
    expect(store.isOnboardingDone).toBe(false)
  })

  it('setPreferences stores them and persists to localStorage', () => {
    const store = useUserStore()
    store.setPreferences(prefs)
    expect(store.preferences).toEqual(prefs)
    expect(localStorage.getItem('atlas:user')).toBeTruthy()
  })

  it('preferredCategories reflects interests', () => {
    const store = useUserStore()
    store.setPreferences(prefs)
    expect(store.preferredCategories).toEqual(['museums', 'food'])
  })

  it('completeOnboarding sets flag and resets step', () => {
    const store = useUserStore()
    store.currentStep = 4
    store.completeOnboarding()
    expect(store.isOnboardingDone).toBe(true)
    expect(store.currentStep).toBe(1)
  })

  it('updatePreference initialises preferences if null', () => {
    const store = useUserStore()
    store.updatePreference('tripDays', 5)
    expect(store.preferences?.tripDays).toBe(5)
  })

  it('clearAll removes everything including localStorage', () => {
    const store = useUserStore()
    store.setPreferences(prefs)
    store.completeOnboarding()
    store.clearAll()
    expect(store.preferences).toBeNull()
    expect(store.isOnboardingDone).toBe(false)
    expect(localStorage.getItem('atlas:user')).toBeNull()
  })

  it('resetOnboarding keeps preferences but clears onboarding flag', () => {
    const store = useUserStore()
    store.setPreferences(prefs)
    store.completeOnboarding()
    store.resetOnboarding()
    expect(store.preferences).toEqual(prefs)
    expect(store.isOnboardingDone).toBe(false)
  })
})
