<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Place } from '@/types'
import { useCart } from '@/composables/useCart'
import { useFavorites } from '@/composables/useFavorites'
import { formatDuration, formatPrice } from '@/utils/timeHelpers'

const props = defineProps<{ place: Place }>()
const router = useRouter()
const { cart, toggle } = useCart()
const { store: favStore, toggle: toggleFav } = useFavorites()
const inCart = computed(() => cart.isInCart(props.place.id))
const isFav = computed(() => favStore.isFavorite(props.place.id))

function onAddClick(e: Event) {
  e.stopPropagation()
  toggle(props.place.id)
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
      <p class="card__name truncate">{{ place.name }}</p>
      <p class="card__meta">{{ formatDuration(place.duration) }} · {{ formatPrice(place.price) }}</p>
      <button
        class="card__add"
        :class="{ 'card__add--active': inCart }"
        type="button"
        @click="onAddClick"
      >
        {{ inCart ? '✓' : '+' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 180px;
  flex-shrink: 0;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow var(--transition), transform var(--transition);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card__img-wrap {
  height: 120px;
  overflow: hidden;
  position: relative;
}

.card__fav {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  cursor: pointer;
  transition: transform var(--transition), background var(--transition);
  border: none;
}

.card__fav:hover {
  transform: scale(1.15);
  background: #fff;
}

.card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 300ms ease;
}

.card:hover .card__img {
  transform: scale(1.05);
}

.card__body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
}

.card__name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
  padding-right: 28px;
}

.card__meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.card__add {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition);
  border: none;
}

.card__add--active {
  background: var(--color-accent-bg);
  color: var(--color-primary);
}
</style>
