import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setActivePinia, createPinia, getActivePinia } from 'pinia'
import { useSort } from '@/composables/useSort'
import { useSearchOverlay } from '@/composables/useSearchOverlay'
import PlaceSortBar from '@/components/places/PlaceSortBar.vue'
import type { Place } from '@/types'

const makePlaces = (): Place[] => [
  { id: 'p1', name: 'Аквариум', category: 'excursions', shortDescription: '', description: '', duration: 60, price: 300, image: '', rating: 4.5, location: '', address: 'Ул. А', openHours: '', tags: ['рыбы'] },
  { id: 'p2', name: 'Вернисаж', category: 'museums',    shortDescription: '', description: '', duration: 120, price: 100, image: '', rating: 4.8, location: '', address: 'Ул. Б', openHours: '', tags: ['арт'] },
  { id: 'p3', name: 'Горка',   category: 'extreme',     shortDescription: '', description: '', duration: 30,  price: 500, image: '', rating: 3.9, location: '', address: 'Ул. В', openHours: '', tags: ['спорт'] },
]

beforeEach(() => {
  setActivePinia(createPinia())
})

// useSort

describe('useSort', () => {
  it('default sort key is "rating" descending', () => {
    const { sortKey, sortDir } = useSort()
    expect(sortKey.value).toBe('rating')
    expect(sortDir.value).toBe('desc')
  })

  it('setSort changes the key and resets direction', () => {
    const { sortKey, sortDir, setSort } = useSort()
    setSort('price')
    expect(sortKey.value).toBe('price')
    expect(sortDir.value).toBe('asc') // price defaults to asc
  })

  it('setSort same key toggles direction', () => {
    const { sortDir, setSort } = useSort()
    setSort('rating')         // same key as default
    expect(sortDir.value).toBe('asc') // toggled from desc→asc
    setSort('rating')
    expect(sortDir.value).toBe('desc')
  })

  it('sorted by rating desc gives highest first', () => {
    const { sortKey, sortDir, sorted } = useSort()
    sortKey.value = 'rating'
    sortDir.value = 'desc'
    const result = sorted(makePlaces())
    expect(result[0]!.rating).toBeGreaterThanOrEqual(result[1]!.rating)
    expect(result[1]!.rating).toBeGreaterThanOrEqual(result[2]!.rating)
  })

  it('sorted by price asc gives cheapest first', () => {
    const { sortKey, sortDir, sorted } = useSort()
    sortKey.value = 'price'
    sortDir.value = 'asc'
    const result = sorted(makePlaces())
    expect(result[0]!.price).toBeLessThanOrEqual(result[1]!.price)
    expect(result[1]!.price).toBeLessThanOrEqual(result[2]!.price)
  })

  it('sorted by name asc gives alphabetical order', () => {
    const { sortKey, sortDir, sorted } = useSort()
    sortKey.value = 'name'
    sortDir.value = 'asc'
    const result = sorted(makePlaces())
    expect(result[0]!.name).toBe('Аквариум')
    expect(result[1]!.name).toBe('Вернисаж')
    expect(result[2]!.name).toBe('Горка')
  })

  it('sorted does not mutate original array', () => {
    const { sorted } = useSort()
    const places = makePlaces()
    const original = [...places]
    sorted(places)
    expect(places.map(p => p.id)).toEqual(original.map(p => p.id))
  })
})

// PlaceSortBar

describe('PlaceSortBar', () => {
  it('renders 4 sort buttons', () => {
    const wrapper = mount(PlaceSortBar, {
      props: { sortKey: 'rating', sortDir: 'desc' },
    })
    expect(wrapper.findAll('.sort-bar__btn')).toHaveLength(4)
  })

  it('active button has --active class', () => {
    const wrapper = mount(PlaceSortBar, {
      props: { sortKey: 'price', sortDir: 'asc' },
    })
    const active = wrapper.findAll('.sort-bar__btn--active')
    expect(active).toHaveLength(1)
    expect(active[0]!.text()).toContain('Цена')
  })

  it('emits sort event with correct key on click', async () => {
    const wrapper = mount(PlaceSortBar, {
      props: { sortKey: 'rating', sortDir: 'desc' },
    })
    const buttons = wrapper.findAll('.sort-bar__btn')
    const priceBtn = buttons.find(b => b.text().includes('Цена'))
    await priceBtn!.trigger('click')
    expect(wrapper.emitted('sort')?.[0]).toEqual(['price'])
  })

  it('shows direction arrow on active button', () => {
    const wrapper = mount(PlaceSortBar, {
      props: { sortKey: 'rating', sortDir: 'desc' },
    })
    expect(wrapper.find('.sort-bar__dir').text()).toBe('↓')
  })
})

// useSearchOverlay

describe('useSearchOverlay', () => {
  it('starts closed', () => {
    const { isOpen, close } = useSearchOverlay()
    close() // ensure clean state
    expect(isOpen.value).toBe(false)
  })

  it('open() sets isOpen to true', () => {
    const { isOpen, open, close } = useSearchOverlay()
    open()
    expect(isOpen.value).toBe(true)
    close()
  })

  it('close() sets isOpen to false', () => {
    const { isOpen, open, close } = useSearchOverlay()
    open()
    close()
    expect(isOpen.value).toBe(false)
  })

  it('toggle() flips state', () => {
    const { isOpen, toggle, close } = useSearchOverlay()
    close()
    toggle()
    expect(isOpen.value).toBe(true)
    toggle()
    expect(isOpen.value).toBe(false)
  })
})

// SearchOverlay component

describe('SearchOverlay', () => {
  beforeEach(() => {
    const { close } = useSearchOverlay()
    close()
  })

  it('renders nothing when closed', async () => {
    const { default: SearchOverlay } = await import('@/components/common/SearchOverlay.vue')
    const wrapper = mount(SearchOverlay, {
      attachTo: document.body,
      global: {
        plugins: [getActivePinia()!],
        stubs: { Teleport: { template: '<div><slot /></div>' } },
        mocks: { $router: { push: vi.fn() } },
      },
    })
    await nextTick()
    expect(document.querySelector('.search-overlay')).toBeNull()
    wrapper.unmount()
    document.body.innerHTML = ''
  })

  it('renders overlay box when open', async () => {
    const { open } = useSearchOverlay()
    open()
    const { default: SearchOverlay } = await import('@/components/common/SearchOverlay.vue')
    mount(SearchOverlay, {
      attachTo: document.body,
      global: {
        plugins: [getActivePinia()!],
        stubs: { Teleport: { template: '<div><slot /></div>' }, Transition: { template: '<slot />' } },
        mocks: { $router: { push: vi.fn() } },
      },
    })
    await nextTick()
    expect(document.querySelector('.search-overlay__box')).not.toBeNull()
    document.body.innerHTML = ''
    const { close } = useSearchOverlay()
    close()
  })
})
