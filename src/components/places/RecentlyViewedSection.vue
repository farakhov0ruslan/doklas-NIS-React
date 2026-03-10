<script setup lang="ts">
import { computed } from 'vue'
import { useRecentlyViewed } from '@/composables/useRecentlyViewed'
import { usePlacesStore } from '@/stores/placesStore'
import PlaceCardCompact from './PlaceCardCompact.vue'

const { ids } = useRecentlyViewed()
const placesStore = usePlacesStore()

const places = computed(() => {
  const pool = [...placesStore.all, ...placesStore.recommended]
  return ids.value
    .map(id => pool.find(p => p.id === id))
    .filter(p => p !== undefined)
})
</script>

<template>
  <section v-if="places.length" class="recent">
    <h2 class="recent__title">Недавно просмотренные</h2>
    <div class="recent__scroll">
      <div
        v-for="(place, i) in places"
        :key="place.id"
        class="recent__card-wrap"
        :style="{ '--i': i }"
      >
        <PlaceCardCompact :place="place" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.recent {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding-top: var(--space-lg);
}

.recent__title {
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--color-text);
  padding: 0 var(--space-md);
}

.recent__scroll {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  padding: var(--space-xs) var(--space-md);
  scrollbar-width: none;
}

.recent__scroll::-webkit-scrollbar {
  display: none;
}

.recent__card-wrap {
  animation: cardSlideIn 240ms ease both;
  animation-delay: calc(var(--i, 0) * 40ms);
}

@keyframes cardSlideIn {
  from { opacity: 0; transform: translateX(8px); }
  to   { opacity: 1; transform: translateX(0); }
}
</style>
