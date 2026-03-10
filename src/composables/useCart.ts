import { computed } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import { usePlacesStore } from '@/stores/placesStore'
import { useToast } from './useToast'

export function useCart() {
  const cart = useCartStore()
  const places = usePlacesStore()
  const { show } = useToast()

  const cartPlaces = computed(() => cart.places)

  function toggle(placeId: string) {
    const place = places.getById(placeId)
    if (cart.isInCart(placeId)) {
      cart.remove(placeId)
      show(`«${place?.name ?? 'Место'}» удалено из подборки`, 'info')
    } else {
      cart.add(placeId)
      show(`«${place?.name ?? 'Место'}» добавлено в подборку`, 'success')
    }
  }

  return {
    cart,
    cartPlaces,
    toggle,
  }
}
