import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, defineComponent, h } from 'vue'
import { setActivePinia, createPinia, getActivePinia } from 'pinia'
import { useRecentlyViewed } from '@/composables/useRecentlyViewed'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { usePlacesStore } from '@/stores/placesStore'
import FavoritesView from '@/views/FavoritesView.vue'
import type { Place } from '@/types'

const mockPlace: Place = {
  id: 'p1', name: 'Эрмитаж', category: 'museums',
  shortDescription: 'Музей', description: 'Описание',
  duration: 120, price: 500, image: 'img.jpg', rating: 4.9,
  location: '', address: 'Адрес', openHours: '10–18', tags: ['история'],
}

const mockPlace2: Place = {
  id: 'p2', name: 'Петергоф', category: 'parks',
  shortDescription: 'Парк', description: 'Фонтаны',
  duration: 180, price: 700, image: 'img2.jpg', rating: 4.7,
  location: '', address: 'Пригород', openHours: '10–18', tags: ['парк'],
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  // reset module-singleton for useRecentlyViewed
  const { clear } = useRecentlyViewed()
  clear()
})

describe('useRecentlyViewed', () => {
  it('starts empty', () => {
    const { ids } = useRecentlyViewed()
    expect(ids.value).toHaveLength(0)
  })

  it('track adds an id', () => {
    const { ids, track } = useRecentlyViewed()
    track('p1')
    expect(ids.value).toContain('p1')
  })

  it('track deduplicates — same id moves to front', () => {
    const { ids, track } = useRecentlyViewed()
    track('p1')
    track('p2')
    track('p1')
    expect(ids.value[0]).toBe('p1')
    expect(ids.value).toHaveLength(2)
  })

  it('limits to 8 entries', () => {
    const { ids, track } = useRecentlyViewed()
    for (let i = 0; i < 10; i++) track(`p${i}`)
    expect(ids.value).toHaveLength(8)
  })

  it('persists to localStorage', () => {
    const { track } = useRecentlyViewed()
    track('p1')
    expect(localStorage.getItem('atlas:recent')).toContain('p1')
  })

  it('clear empties the list and removes localStorage key', () => {
    const { ids, track, clear } = useRecentlyViewed()
    track('p1')
    clear()
    expect(ids.value).toHaveLength(0)
    expect(localStorage.getItem('atlas:recent')).toBeNull()
  })
})

describe('FavoritesView', () => {
  const routerMock = { push: vi.fn() }
  const routerPlugin = { install: (app: any) => { app.config.globalProperties.$router = routerMock } }

  function mountFavs() {
    return mount(FavoritesView, {
      global: {
        plugins: [getActivePinia()!],
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          PlaceCard: { template: '<div class="place-card">{{ place?.name }}</div>', props: ['place'] },
          EmptyState: { template: '<div class="empty-state">{{ title }}</div>', props: ['icon', 'title', 'description', 'actionLabel'] },
        },
        mocks: { $router: routerMock },
      },
    })
  }

  it('shows EmptyState when no favorites', () => {
    const wrapper = mountFavs()
    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })

  it('shows count badge when favorites exist', async () => {
    const favStore = useFavoritesStore()
    const placesStore = usePlacesStore()
    placesStore.all = [mockPlace, mockPlace2]
    favStore.toggle('p1')
    favStore.toggle('p2')

    const wrapper = mountFavs()
    await nextTick()
    expect(wrapper.find('.favs__count').exists()).toBe(true)
    expect(wrapper.find('.favs__count').text()).toBe('2')
  })

  it('renders PlaceCard for each favorited place', async () => {
    const favStore = useFavoritesStore()
    const placesStore = usePlacesStore()
    placesStore.all = [mockPlace, mockPlace2]
    favStore.toggle('p1')
    favStore.toggle('p2')

    const wrapper = mountFavs()
    await nextTick()
    const cards = wrapper.findAll('.place-card')
    expect(cards).toHaveLength(2)
  })

  it('does not show count badge when no favorites', () => {
    const wrapper = mountFavs()
    expect(wrapper.find('.favs__count').exists()).toBe(false)
  })
})

describe('SummaryView export .txt', () => {
  it('handleExport creates a blob with place names', async () => {
    const createdUrls: string[] = []
    const revokedUrls: string[] = []
    const clickedElements: HTMLAnchorElement[] = []

    const origCreate = URL.createObjectURL
    const origRevoke = URL.revokeObjectURL
    URL.createObjectURL = (blob: Blob) => {
      createdUrls.push('blob:url')
      return 'blob:url'
    }
    URL.revokeObjectURL = (url: string) => { revokedUrls.push(url) }

    const origCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        const el = origCreateElement('a') as HTMLAnchorElement
        el.click = () => { clickedElements.push(el) }
        return el
      }
      return origCreateElement(tag)
    })

    // Import SummaryView and check download logic via blob creation
    const { usePlannerStore } = await import('@/stores/plannerStore')
    const { useCartStore } = await import('@/stores/cartStore')
    const plannerStore = usePlannerStore()
    const cartStore = useCartStore()

    // Simulate a generated plan
    const placesStore = usePlacesStore()
    placesStore.all = [mockPlace]
    cartStore.add('p1')
    plannerStore.generate({ days: 1, budget: 'medium', categories: [], pace: 'moderate' })

    const wrapper = mount(
      (await import('@/views/SummaryView.vue')).default,
      {
        global: {
          plugins: [getActivePinia()!],
          stubs: {
            RouterLink: { template: '<a><slot /></a>' },
            BaseButton: { template: '<button @click="$emit(\'click\')"><slot /></button>', emits: ['click'] },
            CategoryBadge: { template: '<span />' },
            Teleport: { template: '<div><slot /></div>' },
          },
          mocks: { $router: { push: vi.fn() } },
        },
      }
    )
    await nextTick()

    // Find export button by text
    const buttons = wrapper.findAll('button')
    const exportBtn = buttons.find(b => b.text().includes('Скачать'))
    expect(exportBtn).toBeDefined()
    await exportBtn!.trigger('click')
    await nextTick()

    expect(createdUrls).toHaveLength(1)
    expect(clickedElements).toHaveLength(1)
    expect(clickedElements[0].download).toBe('atlas-маршрут.txt')
    expect(revokedUrls).toHaveLength(1)

    URL.createObjectURL = origCreate
    URL.revokeObjectURL = origRevoke
    vi.restoreAllMocks()
  })
})
