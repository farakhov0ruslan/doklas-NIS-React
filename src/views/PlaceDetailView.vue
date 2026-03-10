<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlacesStore } from '@/stores/placesStore'
import { formatDuration, formatPrice } from '@/utils/timeHelpers'
import { useCart } from '@/composables/useCart'
import { useFavorites } from '@/composables/useFavorites'
import { useRecentlyViewed } from '@/composables/useRecentlyViewed'
import type { Category } from '@/types'
import CategoryBadge from '@/components/common/CategoryBadge.vue'
import StarRating from '@/components/common/StarRating.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const placesStore = usePlacesStore()
const { cart, toggle } = useCart()
const { store: favStore, toggle: toggleFav } = useFavorites()
const { track } = useRecentlyViewed()

const id = route.params.id as string

const place = computed(() => placesStore.currentPlace)
const inCart = computed(() => cart.isInCart(id))
const isFav = computed(() => favStore.isFavorite(id))

const servicesByCategory: Record<Category, string[]> = {
  museums:    ['Аудиогид на русском', 'Хранение вещей', 'Кафе на территории', 'Сувенирный магазин'],
  food:       ['Столик без брони', 'Меню на английском', 'Вегетарианские блюда', 'Доставка'],
  music:      ['Бронирование столиков', 'Живая музыка', 'Коктейльное меню', 'Гардероб'],
  excursions: ['Групповые туры', 'Индивидуальный гид', 'Трансфер от метро', 'Фотоостановки'],
  shopping:   ['Примерочные', 'Хранение покупок', 'Бесплатный Wi-Fi', 'Обмен товара'],
  extreme:    ['Инструктаж по безопасности', 'Аренда снаряжения', 'Страхование', 'Фото и видео'],
}

const services = computed(() =>
  place.value ? servicesByCategory[place.value.category] : []
)

function toggleCart() {
  toggle(id)
}

onMounted(() => {
  placesStore.fetchById(id)
  track(id)
})
</script>

<template>
  <div class="detail">
    <div v-if="placesStore.loading" class="detail__loading">
      <LoadingSpinner />
    </div>

    <div v-else-if="placesStore.error || !place" class="detail__error">
      <p>{{ placesStore.error ?? 'Место не найдено' }}</p>
      <BaseButton variant="outline" @click="router.back()">Назад</BaseButton>
    </div>

    <template v-else>
      <div class="detail__hero">
        <img :src="place.image" :alt="place.name" class="detail__img" />
        <div class="detail__hero-overlay" />
        <button class="detail__back" type="button" aria-label="Назад" @click="router.back()">←</button>
        <button
          class="detail__fav"
          :class="{ 'detail__fav--active': isFav }"
          type="button"
          :aria-label="isFav ? 'Убрать из избранного' : 'В избранное'"
          @click="toggleFav(id)"
        >{{ isFav ? '❤️' : '🤍' }}</button>
        <div class="detail__hero-content">
          <CategoryBadge :category="place.category" />
          <h1 class="detail__name">{{ place.name }}</h1>
        </div>
      </div>

      <div class="detail__body">
        <div class="detail__meta-row">
          <div class="detail__meta-item">
            <StarRating :rating="place.rating" />
          </div>
          <div class="detail__meta-item">
            <span class="detail__meta-icon">⏱</span>
            <span class="detail__meta-val">{{ formatDuration(place.duration) }}</span>
          </div>
          <div class="detail__meta-item">
            <span class="detail__meta-icon">💰</span>
            <span class="detail__meta-val">{{ formatPrice(place.price) }}</span>
          </div>
        </div>

        <div v-if="place.address" class="detail__info-row">
          <span class="detail__info-icon">📍</span>
          <span>{{ place.address }}</span>
        </div>

        <div v-if="place.openHours" class="detail__info-row">
          <span class="detail__info-icon">🕐</span>
          <span>{{ place.openHours }}</span>
        </div>

        <p class="detail__desc">{{ place.description }}</p>

        <div v-if="services.length" class="detail__services">
          <h3 class="detail__section-title">Услуги</h3>
          <ul class="detail__services-list">
            <li v-for="service in services" :key="service" class="detail__service-item">
              <span class="detail__service-check">✓</span>
              {{ service }}
            </li>
          </ul>
        </div>

        <div v-if="place.tags.length" class="detail__tags">
          <span v-for="tag in place.tags" :key="tag" class="detail__tag"># {{ tag }}</span>
        </div>

        <BaseButton
          :variant="inCart ? 'danger' : 'primary'"
          size="lg"
          fullWidth
          @click="toggleCart"
        >
          {{ inCart ? 'Удалить из подборки' : 'Добавить в подборку' }}
        </BaseButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.detail {
  min-height: calc(100vh - var(--header-height));
}

.detail__loading,
.detail__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-2xl);
  min-height: 60vh;
}

.detail__hero {
  position: relative;
  height: 320px;
  overflow: hidden;
}

.detail__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail__hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%);
}

.detail__back {
  position: absolute;
  top: var(--space-md);
  left: var(--space-md);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(8px);
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition);
}

.detail__back:hover {
  background: rgba(255,255,255,0.35);
}

.detail__fav {
  position: absolute;
  top: var(--space-md);
  right: var(--space-md);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(8px);
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition), transform var(--transition);
  border: none;
}

.detail__fav:hover {
  background: rgba(255,255,255,0.35);
  transform: scale(1.1);
}

.detail__hero-content {
  position: absolute;
  bottom: var(--space-lg);
  left: var(--space-lg);
  right: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.detail__name {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  color: white;
  line-height: 1.2;
}

.detail__body {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--space-lg) var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.detail__meta-row {
  display: flex;
  gap: var(--space-lg);
}

.detail__meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail__meta-icon {
  font-size: 18px;
}

.detail__meta-val {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
}

.detail__info-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.detail__info-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.detail__desc {
  font-size: var(--font-size-md);
  color: var(--color-text);
  line-height: 1.6;
}

.detail__section-title {
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.detail__services-list {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xs) var(--space-md);
}

.detail__service-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.detail__service-check {
  color: var(--color-primary);
  font-weight: 700;
  flex-shrink: 0;
}

.detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.detail__tag {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  background: var(--color-bg);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
}
</style>
