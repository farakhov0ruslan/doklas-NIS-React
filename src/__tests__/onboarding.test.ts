import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setActivePinia, createPinia, getActivePinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { usePlacesStore } from '@/stores/placesStore'
import OnboardingView from '@/views/OnboardingView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/onboarding', component: { template: '<div />' } },
    { path: '/places', component: { template: '<div />' } },
  ],
})

function mountOnboarding() {
  return mount(OnboardingView, {
    global: { plugins: [getActivePinia()!, router] },
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('OnboardingView - step navigation', () => {
  it('starts on step 1', () => {
    const wrapper = mountOnboarding()
    expect(wrapper.find('.onboarding__title').text()).toBe('Что вам интересно?')
  })

  it('"Далее" button is disabled when no interests selected', () => {
    const wrapper = mountOnboarding()
    const btn = wrapper.find('.onboarding__btn-next')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('advances to step 2 when interests selected and next clicked', async () => {
    const wrapper = mountOnboarding()
    const chips = wrapper.findComponent({ name: 'InterestChips' })
    await chips.vm.$emit('update:modelValue', ['museums'])
    await wrapper.find('.onboarding__btn-next').trigger('click')
    await nextTick()
    expect(wrapper.find('.onboarding__title').text()).toBe('Как вы видите свою поездку?')
  })

  it('"Назад" button is hidden on step 1', () => {
    const wrapper = mountOnboarding()
    expect(wrapper.find('.onboarding__btn-back').exists()).toBe(false)
  })

  it('"Назад" button appears on step 2', async () => {
    const wrapper = mountOnboarding()
    const chips = wrapper.findComponent({ name: 'InterestChips' })
    await chips.vm.$emit('update:modelValue', ['museums'])
    await wrapper.find('.onboarding__btn-next').trigger('click')
    await nextTick()
    expect(wrapper.find('.onboarding__btn-back').exists()).toBe(true)
  })

  it('back button returns to previous step', async () => {
    const wrapper = mountOnboarding()
    const chips = wrapper.findComponent({ name: 'InterestChips' })
    await chips.vm.$emit('update:modelValue', ['museums'])
    await wrapper.find('.onboarding__btn-next').trigger('click')
    await nextTick()
    await wrapper.find('.onboarding__btn-back').trigger('click')
    await nextTick()
    expect(wrapper.find('.onboarding__title').text()).toBe('Что вам интересно?')
  })
})

describe('OnboardingView - finish', () => {
  it('calls userStore.completeOnboarding on finish', async () => {
    const userStore = useUserStore()
    const placesStore = usePlacesStore()
    vi.spyOn(placesStore, 'fetchRecommendations').mockResolvedValue()

    const wrapper = mountOnboarding()

    const vm = wrapper.vm as unknown as {
      step: { value: number }
      interests: { value: string[] }
      travelStyle: { value: string[] }
      budget: { value: string }
      pace: { value: string }
      finish: () => Promise<void>
    }

    wrapper.findComponent({ name: 'InterestChips' }).vm.$emit('update:modelValue', ['museums'])
    await nextTick()
    await wrapper.find('.onboarding__btn-next').trigger('click')
    await nextTick()

    wrapper.findComponent({ name: 'StyleImagePicker' }).vm.$emit('update:modelValue', ['cultural'])
    await nextTick()
    await wrapper.find('.onboarding__btn-next').trigger('click')
    await nextTick()

    wrapper.findComponent({ name: 'BudgetSelector' }).vm.$emit('update:modelValue', 'medium')
    await nextTick()
    await wrapper.find('.onboarding__btn-next').trigger('click')
    await nextTick()

    wrapper.findComponent({ name: 'PaceSelector' }).vm.$emit('update:modelValue', 'moderate')
    await nextTick()
    await wrapper.find('.onboarding__btn-next').trigger('click')
    await nextTick()

    await wrapper.find('.onboarding__btn-finish').trigger('click')
    await nextTick()

    expect(userStore.isOnboardingDone).toBe(true)
    expect(userStore.preferences?.interests).toContain('museums')
  })
})

describe('OnboardingView - canNext logic', () => {
  it('step 1: canNext requires at least one interest', async () => {
    const wrapper = mountOnboarding()
    expect(wrapper.find('.onboarding__btn-next').attributes('disabled')).toBeDefined()
    wrapper.findComponent({ name: 'InterestChips' }).vm.$emit('update:modelValue', ['food'])
    await nextTick()
    expect(wrapper.find('.onboarding__btn-next').attributes('disabled')).toBeUndefined()
  })
})

describe('useNetworkStatus composable', () => {
  it('starts as online when navigator.onLine is true', async () => {
    const { useNetworkStatus } = await import('@/composables/useNetworkStatus')
    const wrapper = mount({
      template: '<div>{{ isOnline }}</div>',
      setup() {
        return useNetworkStatus()
      },
    })
    expect(wrapper.text()).toBe('true')
  })
})

describe('NotFoundView', () => {
  it('renders 404 code', async () => {
    const NotFoundView = (await import('@/views/NotFoundView.vue')).default
    const wrapper = mount(NotFoundView, {
      global: { plugins: [getActivePinia()!, router] },
    })
    expect(wrapper.find('.notfound__code').text()).toBe('404')
  })
})
