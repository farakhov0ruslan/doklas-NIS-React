import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { UserPreferences, Category } from '@/types'

export const useUserStore = defineStore('user', () => {
  const preferences = ref<UserPreferences | null>(null)
  const hasCompletedOnboarding = ref(false)
  const onboardingSkipped = ref(false)
  const currentStep = ref(1)

  const saved = localStorage.getItem('atlas:user')
  if (saved) {
    try {
      const data = JSON.parse(saved) as {
        preferences: UserPreferences
        hasCompletedOnboarding: boolean
        onboardingSkipped: boolean
      }
      preferences.value = data.preferences ?? null
      hasCompletedOnboarding.value = data.hasCompletedOnboarding ?? false
      onboardingSkipped.value = data.onboardingSkipped ?? false
    } catch {
      localStorage.removeItem('atlas:user')
    }
  }

  /** Онбординг полностью пройден (есть предпочтения) */
  const isOnboardingDone = computed(() => hasCompletedOnboarding.value)
  /** Модал не должен показываться автоматически (пройден ИЛИ пропущен) */
  const isOnboardingDismissed = computed(() => hasCompletedOnboarding.value || onboardingSkipped.value)
  const preferredCategories = computed<Category[]>(() => preferences.value?.interests ?? [])

  function setPreferences(prefs: UserPreferences) {
    preferences.value = prefs
    persist()
  }

  function updatePreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    if (!preferences.value) {
      preferences.value = {
        interests: [],
        budget: 'medium',
        travelStyle: [],
        tripDays: 3,
        pace: 'moderate',
      }
    }
    preferences.value[key] = value
    persist()
  }

  function completeOnboarding() {
    hasCompletedOnboarding.value = true
    currentStep.value = 1
    persist()
  }

  function skipOnboarding() {
    onboardingSkipped.value = true
    persist()
  }

  function resetOnboarding() {
    hasCompletedOnboarding.value = false
    onboardingSkipped.value = false
    currentStep.value = 1
    persist()
  }

  function clearAll() {
    preferences.value = null
    hasCompletedOnboarding.value = false
    currentStep.value = 1
    localStorage.removeItem('atlas:user')
  }

  function persist() {
    localStorage.setItem('atlas:user', JSON.stringify({
      preferences: preferences.value,
      hasCompletedOnboarding: hasCompletedOnboarding.value,
      onboardingSkipped: onboardingSkipped.value,
    }))
  }

  return {
    preferences,
    hasCompletedOnboarding,
    onboardingSkipped,
    currentStep,
    isOnboardingDone,
    isOnboardingDismissed,
    preferredCategories,
    setPreferences,
    updatePreference,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    clearAll,
  }
})
