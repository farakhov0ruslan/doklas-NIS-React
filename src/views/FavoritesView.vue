<script setup lang="ts">
import { computed } from 'vue'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { usePlacesStore } from '@/stores/placesStore'
import { useCart } from '@/composables/useCart'
import PlaceCard from '@/components/places/PlaceCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const favStore = useFavoritesStore()
const placesStore = usePlacesStore()
const { toggle } = useCart()

const pool = computed(() => [...placesStore.all, ...placesStore.recommended])

const favoritePlaces = computed(() =>
  favStore.ids
    .map(id => pool.value.find(p => p.id === id))
    .filter(p => p !== undefined)
)

function onAddToCart(placeId: string) {
  toggle(placeId)
}
</script>

<template>
  <div class="favs">
    <div class="favs__header">
      <h1 class="favs__title">Избранное</h1>
      <span v-if="favoritePlaces.length" class="favs__count">{{ favoritePlaces.length }}</span>
    </div>

    <EmptyState
      v-if="!favoritePlaces.length"
      icon="🤍"
      title="Пока пусто"
      description="Нажмите ❤️ на карточке места, чтобы сохранить его здесь"
      action-label="Смотреть места"
      @action="router.push('/places')"
    />

    <div v-else class="favs__grid">
      <div
        v-for="(place, i) in favoritePlaces"
        :key="place.id"
        class="favs__card-wrap"
        :style="{ '--i': i }"
      >
        <PlaceCard :place="place" @add-to-cart="onAddToCart" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.favs {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-lg) var(--space-md) var(--space-2xl);
  min-height: calc(100vh - var(--header-height));
}

.favs__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.favs__title {
  font-size: var(--font-size-xl);
  font-weight: 800;
  color: var(--color-text);
}

.favs__count {
  background: var(--color-primary);
  color: #fff;
  font-size: var(--font-size-sm);
  font-weight: 700;
  border-radius: var(--radius-full);
  padding: 2px 10px;
}

.favs__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.favs__card-wrap {
  animation: cardEnter 280ms ease both;
  animation-delay: calc(var(--i, 0) * 55ms);
}

@keyframes cardEnter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (min-width: 640px) {
  .favs__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .favs__grid {
    grid-template-columns: 1fr;
  }
}
</style>
