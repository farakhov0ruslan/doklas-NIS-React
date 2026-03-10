<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Place } from '@/types'
import { useCartStore } from '@/stores/cartStore'
import { useFavorites } from '@/composables/useFavorites'
import { formatDuration, formatPrice } from '@/utils/timeHelpers'
import CategoryBadge from '@/components/common/CategoryBadge.vue'
import StarRating from '@/components/common/StarRating.vue'

const props = defineProps<{ place: Place }>()
const emit = defineEmits<{ addToCart: [placeId: string] }>()

const router = useRouter()
const cart = useCartStore()
const { store: favStore, toggle: toggleFav } = useFavorites()
const inCart = computed(() => cart.isInCart(props.place.id))
const isFav = computed(() => favStore.isFavorite(props.place.id))

function onAddClick(e: Event) {
  e.stopPropagation()
  emit('addToCart', props.place.id)
}

function onFavClick(e: Event) {
  e.stopPropagation()
  toggleFav(props.place.id)
}
</script>

<template>
  <div class="card" @click="router.push(`/places/${place.id}`)">
    <div class="card__img-wrap">
      <img :src="place.image" :alt="place.name" class="card__img" loading="lazy" />
      <button
        class="card__fav"
        :class="{ 'card__fav--active': isFav }"
        type="button"
        :aria-label="isFav ? 'Убрать из избранного' : 'В избранное'"
        @click="onFavClick"
      >{{ isFav ? '❤️' : '🤍' }}</button>
    </div>
    <div class="card__body">
      <CategoryBadge :category="place.category" />
      <h3 class="card__name">{{ place.name }}</h3>
      <p class="card__desc clamp-2">{{ place.shortDescription }}</p>
      <div class="card__meta">
        <span>⏱ {{ formatDuration(place.duration) }}</span>
        <span>💰 {{ formatPrice(place.price) }}</span>
        <StarRating :rating="place.rating" />
      </div>
      <button
        class="card__btn"
        :class="{ 'card__btn--added': inCart }"
        type="button"
        @click="onAddClick"
      >
        {{ inCart ? '✓ Добавлено' : '+ В маршрут' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow var(--transition), transform var(--transition);
  display: flex;
  flex-direction: column;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card__img-wrap {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  position: relative;
}

.card__fav {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  cursor: pointer;
  transition: transform var(--transition), background var(--transition);
  border: none;
}

.card__fav:hover {
  transform: scale(1.15);
  background: #fff;
}

.card__fav--active {
  background: rgba(255, 255, 255, 0.95);
}

.card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 300ms ease;
}

.card:hover .card__img {
  transform: scale(1.04);
}

.card__body {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.card__name {
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--color-text);
  margin-top: 2px;
}

.card__desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  line-height: 1.5;
}

.card__meta {
  display: flex;
  gap: var(--space-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-top: auto;
  padding-top: 4px;
}

.card__btn {
  width: 100%;
  padding: 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition), color var(--transition);
  background: var(--color-primary);
  color: #fff;
  border: none;
  margin-top: 6px;
}

.card__btn:hover:not(.card__btn--added) {
  background: var(--color-primary-dark);
}

.card__btn--added {
  background: var(--color-accent-bg);
  color: var(--color-primary);
}
</style>
