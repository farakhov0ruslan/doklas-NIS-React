import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useFilters, MAX_PRICE_LIMIT } from '@/composables/useFilters'
import { vIntersection } from '@/directives/vIntersection'
import PlaceFilterPanel from '@/components/places/PlaceFilterPanel.vue'
import PlaceFilters from '@/components/places/PlaceFilters.vue'
import type { Place } from '@/types'

const makePlaces = (): Place[] => [
  { id: 'p1', name: 'Дорогой ресторан', category: 'food',  shortDescription: '', description: '', duration: 90,  price: 3000, image: '', rating: 4.9, location: '', address: '', openHours: '', tags: [] },
  { id: 'p2', name: 'Бюджетное кафе',   category: 'food',  shortDescription: '', description: '', duration: 60,  price: 300,  image: '', rating: 3.5, location: '', address: '', openHours: '', tags: [] },
  { id: 'p3', name: 'Музей',            category: 'museums',shortDescription: '', description: '', duration: 120, price: 500,  image: '', rating: 4.2, location: '', address: '', openHours: '', tags: [] },
]

beforeEach(() => {
  setActivePinia(createPinia())
})

// useFilters

describe('useFilters', () => {
  it('starts with no active filters', () => {
    const { minRating, maxPrice, activeCount } = useFilters()
    expect(minRating.value).toBe(0)
    expect(maxPrice.value).toBeNull()
    expect(activeCount.value).toBe(0)
  })

  it('activeCount increments for each active filter', () => {
    const { minRating, maxPrice, activeCount } = useFilters()
    minRating.value = 4
    expect(activeCount.value).toBe(1)
    maxPrice.value = 1000
    expect(activeCount.value).toBe(2)
  })

  it('apply filters by minRating', () => {
    const { minRating, apply } = useFilters()
    minRating.value = 4
    const result = apply(makePlaces())
    expect(result.map(p => p.id)).toEqual(['p1', 'p3'])
  })

  it('apply filters by maxPrice', () => {
    const { maxPrice, apply } = useFilters()
    maxPrice.value = 500
    const result = apply(makePlaces())
    expect(result.map(p => p.id)).toEqual(['p2', 'p3'])
  })

  it('apply with both filters is intersective', () => {
    const { minRating, maxPrice, apply } = useFilters()
    minRating.value = 4
    maxPrice.value = 1000
    const result = apply(makePlaces())
    expect(result.map(p => p.id)).toEqual(['p3'])
  })

  it('apply with no filters returns all places', () => {
    const { apply } = useFilters()
    expect(apply(makePlaces())).toHaveLength(3)
  })

  it('reset clears all filters', () => {
    const { minRating, maxPrice, activeCount, reset } = useFilters()
    minRating.value = 4
    maxPrice.value = 500
    reset()
    expect(minRating.value).toBe(0)
    expect(maxPrice.value).toBeNull()
    expect(activeCount.value).toBe(0)
  })
})

// PlaceFilterPanel

describe('PlaceFilterPanel', () => {
  function mountPanel(isOpen = true) {
    return mount(PlaceFilterPanel, {
      props: { isOpen, minRating: 0, maxPrice: null, activeCount: 0 },
      global: {
        stubs: {
          Teleport: { template: '<div><slot /></div>' },
          Transition: { template: '<slot />' },
        },
      },
    })
  }

  it('renders nothing when closed', () => {
    const wrapper = mountPanel(false)
    expect(wrapper.find('.fp').exists()).toBe(false)
  })

  it('renders sheet when open', () => {
    const wrapper = mountPanel(true)
    expect(wrapper.find('.fp__sheet').exists()).toBe(true)
  })

  it('renders 6 rating buttons', () => {
    const wrapper = mountPanel()
    expect(wrapper.findAll('.fp__rating-btn')).toHaveLength(6)
  })

  it('emits update:minRating when rating button clicked', async () => {
    const wrapper = mountPanel()
    const btns = wrapper.findAll('.fp__rating-btn')
    const fourBtn = btns.find(b => b.text().includes('4+'))
    await fourBtn!.trigger('click')
    expect(wrapper.emitted('update:minRating')?.[0]).toEqual([4])
  })

  it('emits close when overlay clicked', async () => {
    const wrapper = mountPanel()
    await wrapper.find('.fp__overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits reset when reset button clicked', async () => {
    const wrapper = mountPanel()
    await wrapper.find('.fp__reset').trigger('click')
    expect(wrapper.emitted('reset')).toBeTruthy()
  })

  it('shows active count on apply button', () => {
    const wrapper = mount(PlaceFilterPanel, {
      props: { isOpen: true, minRating: 4, maxPrice: 1000, activeCount: 2 },
      global: {
        stubs: {
          Teleport: { template: '<div><slot /></div>' },
          Transition: { template: '<slot />' },
        },
      },
    })
    expect(wrapper.find('.fp__apply').text()).toContain('(2)')
  })
})

// PlaceFilters (filter button)

describe('PlaceFilters filter button', () => {
  it('renders filter icon button', () => {
    const wrapper = mount(PlaceFilters, {
      props: { modelValue: null, filterCount: 0 },
    })
    expect(wrapper.find('.filter--icon').exists()).toBe(true)
  })

  it('emits open-filters when icon button clicked', async () => {
    const wrapper = mount(PlaceFilters, {
      props: { modelValue: null, filterCount: 0 },
    })
    await wrapper.find('.filter--icon').trigger('click')
    expect(wrapper.emitted('open-filters')).toBeTruthy()
  })

  it('shows badge when filterCount > 0', () => {
    const wrapper = mount(PlaceFilters, {
      props: { modelValue: null, filterCount: 2 },
    })
    expect(wrapper.find('.filter__badge').text()).toBe('2')
  })

  it('no badge when filterCount is 0', () => {
    const wrapper = mount(PlaceFilters, {
      props: { modelValue: null, filterCount: 0 },
    })
    expect(wrapper.find('.filter__badge').exists()).toBe(false)
  })
})

// vIntersection directive

function makeIOClass(
  cb: { ref: IntersectionObserverCallback | null },
  spies: { observe?: ReturnType<typeof vi.fn>; unobserve?: ReturnType<typeof vi.fn>; disconnect?: ReturnType<typeof vi.fn> } = {}
) {
  const observeSpy = spies.observe ?? vi.fn()
  const unobserveSpy = spies.unobserve ?? vi.fn()
  const disconnectSpy = spies.disconnect ?? vi.fn()
  return class MockIO {
    constructor(callback: IntersectionObserverCallback) { cb.ref = callback }
    observe = observeSpy
    unobserve = unobserveSpy
    disconnect = disconnectSpy
  }
}

describe('vIntersection directive', () => {
  it('adds class when intersection fires', () => {
    const cbRef = { ref: null as IntersectionObserverCallback | null }
    const unobserveSpy = vi.fn()
    vi.stubGlobal('IntersectionObserver', makeIOClass(cbRef, { unobserve: unobserveSpy }))

    const wrapper = mount({
      template: '<div v-intersection="\'visible\'">hello</div>',
      directives: { intersection: vIntersection },
    })

    const el = wrapper.element as HTMLElement
    expect(el.classList.contains('visible')).toBe(false)

    cbRef.ref!([{ isIntersecting: true, target: el } as IntersectionObserverEntry], {} as IntersectionObserver)
    expect(el.classList.contains('visible')).toBe(true)
    expect(unobserveSpy).toHaveBeenCalledWith(el)

    vi.unstubAllGlobals()
  })

  it('does not add class when not intersecting', () => {
    const cbRef = { ref: null as IntersectionObserverCallback | null }
    vi.stubGlobal('IntersectionObserver', makeIOClass(cbRef))

    const wrapper = mount({
      template: '<div v-intersection>item</div>',
      directives: { intersection: vIntersection },
    })

    const el = wrapper.element as HTMLElement
    cbRef.ref!([{ isIntersecting: false, target: el } as IntersectionObserverEntry], {} as IntersectionObserver)
    expect(el.classList.contains('is-visible')).toBe(false)

    vi.unstubAllGlobals()
  })

  it('disconnects observer on unmount', () => {
    const disconnectSpy = vi.fn()
    const cbRef = { ref: null as IntersectionObserverCallback | null }
    vi.stubGlobal('IntersectionObserver', makeIOClass(cbRef, { disconnect: disconnectSpy }))

    const wrapper = mount({
      template: '<div v-intersection>item</div>',
      directives: { intersection: vIntersection },
    })
    wrapper.unmount()
    expect(disconnectSpy).toHaveBeenCalled()

    vi.unstubAllGlobals()
  })
})
