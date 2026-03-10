import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCart } from '@/composables/useCart'
import { useCartStore } from '@/stores/cartStore'
import { usePlacesStore } from '@/stores/placesStore'
import type { Place } from '@/types'

const mockPlace: Place = {
  id: 'p1',
  name: 'Эрмитаж',
  category: 'museums',
  shortDescription: '',
  description: '',
  duration: 120,
  price: 500,
  image: '',
  rating: 4.9,
  location: '',
  address: '',
  openHours: '',
  tags: [],
}

beforeEach(() => {
  setActivePinia(createPinia())
  sessionStorage.clear()
  usePlacesStore().all = [mockPlace]
})

describe('useCart', () => {
  it('toggle adds place to cart', () => {
    const { toggle, cart } = useCart()
    toggle('p1')
    expect(cart.isInCart('p1')).toBe(true)
  })

  it('toggle removes if already in cart', () => {
    const cartStore = useCartStore()
    cartStore.add('p1')

    const { toggle, cart } = useCart()
    toggle('p1')
    expect(cart.isInCart('p1')).toBe(false)
  })

  it('cartPlaces reflects current cart items', () => {
    const { toggle, cartPlaces } = useCart()
    toggle('p1')
    expect(cartPlaces.value).toHaveLength(1)
    expect(cartPlaces.value[0]!.id).toBe('p1')
  })
})
