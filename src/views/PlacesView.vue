<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Category } from '@/types'
import { useUserStore } from '@/stores/userStore'
import { usePlacesStore } from '@/stores/placesStore'
import { useCartStore } from '@/stores/cartStore'
import { CATEGORIES } from '@/utils/constants'
import { useCart } from '@/composables/useCart'
import { useSort } from '@/composables/useSort'
import { useFilters } from '@/composables/useFilters'
import CategorySection from '@/components/places/CategorySection.vue'
import RecentlyViewedSection from '@/components/places/RecentlyViewedSection.vue'
import PlaceCard from '@/components/places/PlaceCard.vue'
import PlaceCardSkeleton from '@/components/places/PlaceCardSkeleton.vue'
import PlaceFilters from '@/components/places/PlaceFilters.vue'
import PlaceSortBar from '@/components/places/PlaceSortBar.vue'
import PlaceFilterPanel from '@/components/places/PlaceFilterPanel.vue'
import OnboardingModal from '@/components/onboarding/OnboardingModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const placesStore = usePlacesStore()
const cart = useCartStore()
const { toggle } = useCart()
const { sortKey, sortDir, setSort, sorted } = useSort()
const { minRating, maxPrice, activeCount: filterCount, apply: applyFilters, reset: resetFilters } = useFilters()

const showFilterPanel = ref(false)

const showModal = ref(false)

const activeFilter = ref<Category | null>(
  (route.query['category'] as Category) ?? null
)

const searchQuery = computed(() =>
  ((route.query['search'] as string) ?? '').toLowerCase().trim()
)

const categoriesWithPlaces = computed(() => {
  const interests = userStore.preferredCategories
  const source = interests.length > 0 ? interests : (Object.keys(CATEGORIES) as Category[])
  return source.filter(cat => placesStore.byCategory(cat).length > 0)
})

const allPlaces = computed(() => {
  const pool = placesStore.recommended.length > 0 ? placesStore.recommended : placesStore.all
  return pool
})

const searchResults = computed(() => {
  if (!searchQuery.value) return []
  const filtered = allPlaces.value.filter(p =>
    p.name.toLowerCase().includes(searchQuery.value) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.value)) ||
    p.address?.toLowerCase().includes(searchQuery.value)
  )
  return sorted(applyFilters(filtered))
})

const categoryCounts = computed(() => {
  const counts: Partial<Record<Category, number>> = {}
  for (const cat of Object.keys(CATEGORIES) as Category[]) {
    const n = placesStore.byCategory(cat).length
    if (n > 0) counts[cat] = n
  }
  return counts
})

const filteredPlaces = computed(() =>
  activeFilter.value ? sorted(applyFilters(placesStore.byCategory(activeFilter.value))) : []
)

const allFilteredSorted = computed(() => sorted(applyFilters(allPlaces.value)))

onMounted(async () => {
  if (!userStore.isOnboardingDismissed) {
    showModal.value = true
  }
  if (placesStore.recommended.length === 0) {
    if (userStore.preferences) {
      await placesStore.fetchRecommendations(userStore.preferences)
    } else {
      await placesStore.fetchAll()
    }
  }
})

function onAddToCart(placeId: string) {
  toggle(placeId)
}

function onSkip() {
  showModal.value = false
  userStore.skipOnboarding()
}

function onStartOnboarding() {
  showModal.value = false
  router.push('/onboarding')
}

async function onRetry() {
  placesStore.clearError()
  if (userStore.preferences) {
    await placesStore.fetchRecommendations(userStore.preferences)
  } else {
    await placesStore.fetchAll()
  }
}
</script>

<template>
  <div class="places">
    <div class="places__filters">
      <PlaceFilters
        v-model="activeFilter"
        :counts="categoryCounts"
        :filter-count="filterCount"
        @open-filters="showFilterPanel = true"
      />
    </div>

    <div v-if="placesStore.error" class="places__error">
      <p>{{ placesStore.error }}</p>
      <button class="places__retry" @click="onRetry">Попробовать снова</button>
    </div>

    <template v-else-if="placesStore.loading || (allPlaces.length === 0 && !searchQuery && !activeFilter)">
      <div v-if="activeFilter" class="places__grid">
        <PlaceCardSkeleton v-for="n in 6" :key="n" />
      </div>
      <div v-else class="places__loading">
        <LoadingSpinner size="lg" text="Подбираем места..." />
      </div>
    </template>

    <template v-else-if="searchQuery">
      <p class="places__search-heading">Результаты поиска: «{{ route.query['search'] }}»</p>
      <PlaceSortBar :sort-key="sortKey" :sort-dir="sortDir" @sort="setSort" />
      <div v-if="searchResults.length" class="places__grid">
        <div
          v-for="place in searchResults"
          :key="place.id"
          v-intersection="'places__card-wrap--visible'"
          class="places__card-wrap places__card-wrap--reveal"
        >
          <PlaceCard :place="place" @add-to-cart="onAddToCart" />
        </div>
      </div>
      <p v-else class="places__empty">По запросу ничего не найдено</p>
    </template>

    <template v-else-if="activeFilter">
      <PlaceSortBar :sort-key="sortKey" :sort-dir="sortDir" @sort="setSort" />
      <div v-if="filteredPlaces.length" class="places__grid">
        <div
          v-for="place in filteredPlaces"
          :key="place.id"
          v-intersection="'places__card-wrap--visible'"
          class="places__card-wrap places__card-wrap--reveal"
        >
          <PlaceCard :place="place" @add-to-cart="onAddToCart" />
        </div>
      </div>
      <p v-else class="places__empty">Мест в этой категории не найдено</p>
    </template>

    <template v-else-if="filterCount > 0">
      <PlaceSortBar :sort-key="sortKey" :sort-dir="sortDir" @sort="setSort" />
      <div v-if="allFilteredSorted.length" class="places__grid">
        <div
          v-for="place in allFilteredSorted"
          :key="place.id"
          v-intersection="'places__card-wrap--visible'"
          class="places__card-wrap places__card-wrap--reveal"
        >
          <PlaceCard :place="place" @add-to-cart="onAddToCart" />
        </div>
      </div>
      <p v-else class="places__empty">Ничего не найдено по заданным фильтрам</p>
    </template>

    <template v-else>
      <div class="places__sections">
        <CategorySection
          v-for="cat in categoriesWithPlaces"
          :key="cat"
          :category="cat"
          :places="placesStore.byCategory(cat)"
        />
      </div>
      <RecentlyViewedSection />
    </template>

    <button v-if="cart.count > 0" class="cart-fab" @click="router.push('/cart')">
      🛒 {{ cart.count }}
    </button>
  </div>

  <PlaceFilterPanel
    :is-open="showFilterPanel"
    :min-rating="minRating"
    :max-price="maxPrice"
    :active-count="filterCount"
    @close="showFilterPanel = false"
    @update:min-rating="minRating = $event"
    @update:max-price="maxPrice = $event"
    @reset="resetFilters"
  />

  <OnboardingModal
    v-if="showModal"
    @skip="onSkip"
    @start-onboarding="onStartOnboarding"
  />
</template>

<style scoped>
.places__card-wrap {
  animation: cardEnter 280ms ease both;
  animation-delay: calc(var(--i, 0) * 55ms);
}

@keyframes cardEnter {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* intersection-reveal variant (used in search/filter grids) */
.places__card-wrap--reveal {
  animation: none;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 280ms ease, transform 280ms ease;
}

.places__card-wrap--visible {
  opacity: 1;
  transform: translateY(0);
}

.places__search-heading {
  padding: var(--space-md) var(--space-md) 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}

.places {
  padding: var(--space-md) 0 var(--space-2xl);
  position: relative;
}

.places__filters {
  position: sticky;
  top: var(--header-height);
  z-index: 10;
  background: var(--color-bg);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--color-border);
}

.places__loading {
  display: flex;
  justify-content: center;
  padding: var(--space-2xl);
}

.places__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-2xl);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  text-align: center;
}

.places__retry {
  padding: 8px 20px;
  border-radius: var(--radius-full);
  background: var(--color-danger);
  color: #fff;
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--transition);
}

.places__retry:hover {
  opacity: 0.85;
}

.places__sections {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  padding-top: var(--space-lg);
}

.places__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  padding: var(--space-lg) var(--space-md);
}

@media (max-width: 480px) {
  .places__grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) {
  .places__grid {
    grid-template-columns: repeat(3, 1fr);
    max-width: 960px;
    margin: 0 auto;
  }
}

.places__empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-2xl);
}

.cart-fab {
  position: fixed;
  bottom: var(--space-xl);
  right: var(--space-lg);
  background: var(--color-secondary);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  padding: 12px 20px;
  font-size: var(--font-size-md);
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: background var(--transition), transform var(--transition);
  z-index: 50;
}

.cart-fab:hover {
  background: var(--color-secondary-dark);
  transform: scale(1.05);
}
</style>
