import { useFavoritesStore } from '@/stores/favoritesStore'
import { usePlacesStore } from '@/stores/placesStore'
import { useToast } from './useToast'

export function useFavorites() {
  const store = useFavoritesStore()
  const places = usePlacesStore()
  const { show } = useToast()

  function toggle(placeId: string) {
    const place = places.getById(placeId)
    const name = place?.name ?? 'Место'
    if (store.isFavorite(placeId)) {
      store.toggle(placeId)
      show(`«${name}» убрано из избранного`, 'info')
    } else {
      store.toggle(placeId)
      show(`«${name}» добавлено в избранное`, 'success')
    }
  }

  return { store, toggle }
}
