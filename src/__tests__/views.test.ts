import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setActivePinia, createPinia, getActivePinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { usePlacesStore } from '@/stores/placesStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { useConfirm } from '@/composables/useConfirm'
import CartView from '@/views/CartView.vue'
import PlannerView from '@/views/PlannerView.vue'
import SummaryView from '@/views/SummaryView.vue'
import type { Place, DayPlan } from '@/types'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/places', component: { template: '<div />' } },
    { path: '/cart', component: { template: '<div />' } },
    { path: '/planner', component: { template: '<div />' } },
    { path: '/summary', component: { template: '<div />' } },
  ],
})

const mockPlace: Place = {
  id: 'p1',
  name: 'Эрмитаж',
  category: 'museums',
  shortDescription: '',
  description: 'Великий музей',
  duration: 120,
  price: 500,
  image: '',
  rating: 4.9,
  location: '',
  address: 'Дворцовая площадь',
  openHours: '10:00–18:00',
  tags: ['искусство'],
}

const makeDayPlan = (dayNumber: number, placeIds: string[]): DayPlan => ({
  dayNumber,
  places: placeIds.map(id => ({ placeId: id, startTime: '09:00', endTime: '10:00' })),
  totalDuration: placeIds.length * 60,
})

function mountWithPlugins(component: object) {
  return mount(component, {
    global: {
      plugins: [getActivePinia()!, router],
    },
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  sessionStorage.clear()
})

describe('CartView', () => {
  it('shows empty state when cart is empty', () => {
    const wrapper = mountWithPlugins(CartView)
    expect(wrapper.text()).toContain('Подборка пуста')
  })

  it('shows cart items when places are in cart', () => {
    usePlacesStore().all = [mockPlace]
    useCartStore().add('p1')

    const wrapper = mountWithPlugins(CartView)
    expect(wrapper.text()).toContain('Эрмитаж')
  })

  it('shows CartSummary with count when cart has items', () => {
    usePlacesStore().all = [mockPlace]
    useCartStore().add('p1')

    const wrapper = mountWithPlugins(CartView)
    expect(wrapper.find('.summary').exists()).toBe(true)
  })

  it('remove item button calls cart.remove', async () => {
    usePlacesStore().all = [mockPlace]
    const cart = useCartStore()
    cart.add('p1')

    const wrapper = mountWithPlugins(CartView)
    await wrapper.find('.row__remove').trigger('click')

    expect(cart.count).toBe(0)
  })

  it('clear button empties cart', async () => {
    usePlacesStore().all = [mockPlace]
    const cart = useCartStore()
    cart.add('p1')

    const wrapper = mountWithPlugins(CartView)
    await wrapper.find('.cart-view__clear').trigger('click')
    useConfirm().answer(true)
    await nextTick()

    expect(cart.count).toBe(0)
  })
})

describe('PlannerView', () => {
  it('shows loading spinner when loading', () => {
    const planner = usePlannerStore()
    planner.isGenerated = true
    planner.loading = true

    const wrapper = mountWithPlugins(PlannerView)
    expect(wrapper.find('.planner__loading').exists()).toBe(true)
  })

  it('renders day blocks for each day', () => {
    usePlacesStore().all = [mockPlace]
    const planner = usePlannerStore()
    planner.days = [makeDayPlan(1, ['p1']), makeDayPlan(2, ['p1'])]
    planner.isGenerated = true

    const wrapper = mountWithPlugins(PlannerView)
    expect(wrapper.findAll('.block')).toHaveLength(2)
  })

  it('shows error message when error is set', () => {
    const planner = usePlannerStore()
    planner.isGenerated = true
    planner.error = 'Не удалось пересчитать маршрут'

    const wrapper = mountWithPlugins(PlannerView)
    expect(wrapper.text()).toContain('Не удалось пересчитать маршрут')
  })

  it('renders day blocks when plan is generated', () => {
    const planner = usePlannerStore()
    planner.isGenerated = true
    planner.days = [makeDayPlan(1, ['p1'])]

    const wrapper = mountWithPlugins(PlannerView)
    expect(wrapper.find('.planner__days').exists()).toBe(true)
  })
})

describe('SummaryView', () => {
  it('renders total stats section', () => {
    usePlacesStore().all = [mockPlace]
    const planner = usePlannerStore()
    planner.days = [makeDayPlan(1, ['p1'])]
    planner.isGenerated = true

    const wrapper = mountWithPlugins(SummaryView)
    expect(wrapper.find('.summary__totals').exists()).toBe(true)
  })

  it('renders a day section for each day', () => {
    usePlacesStore().all = [mockPlace]
    const planner = usePlannerStore()
    planner.days = [makeDayPlan(1, ['p1']), makeDayPlan(2, ['p1'])]
    planner.isGenerated = true

    const wrapper = mountWithPlugins(SummaryView)
    expect(wrapper.findAll('.summary__day')).toHaveLength(2)
  })

  it('shows correct total places count in stats', () => {
    usePlacesStore().all = [mockPlace]
    const planner = usePlannerStore()
    planner.days = [makeDayPlan(1, ['p1', 'p1']), makeDayPlan(2, ['p1'])]
    planner.isGenerated = true

    const wrapper = mountWithPlugins(SummaryView)
    const statNums = wrapper.findAll('.summary__total-num')
    expect(statNums[0]!.text()).toBe('3')
  })
})
