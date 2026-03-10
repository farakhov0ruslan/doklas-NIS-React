import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '@/stores/cartStore'
import { usePlacesStore } from '@/stores/placesStore'
import type { Place } from '@/types'

const mockPlace: Place = {
  id: 'p1',
  name: 'Test Place',
  category: 'museums',
  shortDescription: '',
  description: '',
  duration: 90,
  price: 500,
  image: '',
  rating: 4.5,
  location: '',
  address: '',
  openHours: '',
  tags: [],
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('cartStore', () => {
  it('starts empty', () => {
    const store = useCartStore()
    expect(store.count).toBe(0)
  })

  it('add inserts an item', () => {
    const store = useCartStore()
    store.add('p1')
    expect(store.count).toBe(1)
    expect(store.isInCart('p1')).toBe(true)
  })

  it('add ignores duplicate placeIds', () => {
    const store = useCartStore()
    store.add('p1')
    store.add('p1')
    expect(store.count).toBe(1)
  })

  it('remove deletes the item', () => {
    const store = useCartStore()
    store.add('p1')
    store.remove('p1')
    expect(store.count).toBe(0)
    expect(store.isInCart('p1')).toBe(false)
  })

  it('reorder swaps items correctly', () => {
    const store = useCartStore()
    store.add('p1')
    store.add('p2')
    store.add('p3')
    store.reorder(0, 2)
    expect(store.items[0]!.placeId).toBe('p2')
    expect(store.items[2]!.placeId).toBe('p1')
  })

  it('clear empties the cart and removes localStorage', () => {
    const store = useCartStore()
    store.add('p1')
    store.clear()
    expect(store.count).toBe(0)
    expect(localStorage.getItem('atlas:cart')).toBeNull()
  })

  it('totalDuration sums durations from placesStore', () => {
    const placesStore = usePlacesStore()
    placesStore.all = [mockPlace, { ...mockPlace, id: 'p2', duration: 60 }]

    const cart = useCartStore()
    cart.add('p1')
    cart.add('p2')
    expect(cart.totalDuration).toBe(150)
  })

  it('totalEstimatedCost sums prices', () => {
    const placesStore = usePlacesStore()
    placesStore.all = [mockPlace, { ...mockPlace, id: 'p2', price: 300 }]

    const cart = useCartStore()
    cart.add('p1')
    cart.add('p2')
    expect(cart.totalEstimatedCost).toBe(800)
  })

  it('persists to localStorage on add', () => {
    const store = useCartStore()
    store.add('p1')
    expect(localStorage.getItem('atlas:cart')).toBeTruthy()
  })
})
