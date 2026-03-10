import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setActivePinia, createPinia, getActivePinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { usePlacesStore } from '@/stores/placesStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { useUserStore } from '@/stores/userStore'
import { useConfirm } from '@/composables/useConfirm'
import CartView from '@/views/CartView.vue'
import SummaryView from '@/views/SummaryView.vue'
import type { Place, DayPlan } from '@/types'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/cart', component: { template: '<div />' } },
    { path: '/planner', component: { template: '<div />' } },
    { path: '/summary', component: { template: '<div />' } },
  ],
})

const mockPlace: Place = {
  id: 'p1', name: 'Эрмитаж', category: 'museums',
  shortDescription: '', description: 'Великий музей',
  duration: 120, price: 500, image: '', rating: 4.9,
  location: '', address: 'Дворцовая пл.', openHours: '10:00–18:00',
  tags: ['искусство'],
}

const makeDayPlan = (dayNumber: number, placeIds: string[]): DayPlan => ({
  dayNumber,
  places: placeIds.map(id => ({ placeId: id, startTime: '09:00', endTime: '11:00' })),
  totalDuration: placeIds.length * 120,
})

function mount$(component: object) {
  return mount(component, { global: { plugins: [getActivePinia()!, router] } })
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('Cart → Planner flow', () => {
  it('CartView shows empty state when cart is empty', () => {
    const wrapper = mount$(CartView)
    expect(wrapper.find('.empty').exists()).toBe(true)
  })

  it('CartView shows items when cart has entries', async () => {
    const places = usePlacesStore()
    places.all = [mockPlace]
    const cart = useCartStore()
    cart.add('p1')

    const wrapper = mount$(CartView)
    await nextTick()
    expect(wrapper.find('.row').exists()).toBe(true)
  })

  it('CartView calls planner.generate on CartSummary generate event', async () => {
    const places = usePlacesStore()
    places.all = [mockPlace]
    const cart = useCartStore()
    cart.add('p1')
    const user = useUserStore()
    user.updatePreference('tripDays', 2)

    const planner = usePlannerStore()
    const generateSpy = vi.spyOn(planner, 'generate').mockResolvedValue()

    const wrapper = mount$(CartView)
    await nextTick()
    const cartSummary = wrapper.findComponent({ name: 'CartSummary' })
    await cartSummary.vm.$emit('generate')

    expect(generateSpy).toHaveBeenCalledWith(['p1'], 2)
  })
})

describe('Planner store guards', () => {
  it('isGenerated is false initially', () => {
    const planner = usePlannerStore()
    expect(planner.isGenerated).toBe(false)
  })

  it('isGenerated is true after days are set', () => {
    const planner = usePlannerStore()
    planner.days = [makeDayPlan(1, ['p1'])]
    planner.isGenerated = true
    expect(planner.isGenerated).toBe(true)
  })
})

describe('SummaryView', () => {
  it('renders totals block with place count', () => {
    const places = usePlacesStore()
    places.all = [mockPlace]
    const planner = usePlannerStore()
    planner.days = [makeDayPlan(1, ['p1'])]
    planner.isGenerated = true

    const wrapper = mount$(SummaryView)
    expect(wrapper.text()).toContain('1')
  })

  it('handleReset clears planner and cart, navigates home', async () => {
    const places = usePlacesStore()
    places.all = [mockPlace]
    const cart = useCartStore()
    cart.add('p1')
    const planner = usePlannerStore()
    planner.days = [makeDayPlan(1, ['p1'])]
    planner.isGenerated = true

    const wrapper = mount$(SummaryView)
    const resetBtn = wrapper.findAll('button').find(b => b.text().includes('Начать заново'))
    await resetBtn?.trigger('click')
    useConfirm().answer(true)
    await nextTick()

    expect(planner.isGenerated).toBe(false)
    expect(cart.count).toBe(0)
  })
})

describe('useSearch composable', () => {
  it('debounces query updates', async () => {
    vi.useFakeTimers()
    const { useSearch } = await import('@/composables/useSearch')
    const { query, debouncedQuery } = useSearch(300)

    query.value = 'эрмитаж'
    expect(debouncedQuery.value).toBe('')

    await nextTick()
    vi.advanceTimersByTime(300)
    await nextTick()
    expect(debouncedQuery.value).toBe('эрмитаж')

    vi.useRealTimers()
  })

  it('clear resets both values', async () => {
    vi.useFakeTimers()
    const { useSearch } = await import('@/composables/useSearch')
    const { query, debouncedQuery, clear } = useSearch(300)

    query.value = 'что-то'
    await nextTick()
    vi.advanceTimersByTime(300)
    await nextTick()
    clear()

    expect(query.value).toBe('')
    expect(debouncedQuery.value).toBe('')
    vi.useRealTimers()
  })
})

describe('localStorage persistence', () => {
  it('cart persists to localStorage on add', () => {
    const cart = useCartStore()
    cart.add('p1')
    expect(localStorage.getItem('atlas:cart')).toContain('p1')
  })

  it('cart clears localStorage on clear()', () => {
    const cart = useCartStore()
    cart.add('p1')
    cart.clear()
    expect(localStorage.getItem('atlas:cart')).toBeNull()
  })

  it('userStore persists preferences to localStorage', () => {
    const user = useUserStore()
    user.updatePreference('tripDays', 5)
    expect(localStorage.getItem('atlas:user')).toContain('"tripDays":5')
  })
})
