import { onMounted } from 'vue'
import { usePlacesStore } from '@/stores/placesStore'
import { useUserStore } from '@/stores/userStore'

/**
 * Гарантирует что placesStore.all / recommended заполнены.
 * Вызывать в любой вьюхе, которая отображает данные о местах,
 * но сама не является PlacesView (Planner, Summary, Cart).
 */
export function usePlacesInit() {
  const placesStore = usePlacesStore()
  const userStore = useUserStore()

  onMounted(async () => {
    if (placesStore.all.length === 0 && placesStore.recommended.length === 0) {
      if (userStore.preferences) {
        await placesStore.fetchRecommendations(userStore.preferences)
      } else {
        await placesStore.fetchAll()
      }
    }
  })
}
