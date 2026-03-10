<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Category, Place } from '@/types'
import { CATEGORIES } from '@/utils/constants'
import PlaceCardCompact from './PlaceCardCompact.vue'

const props = defineProps<{ category: Category; places: Place[] }>()
const router = useRouter()
const meta = CATEGORIES[props.category]
</script>

<template>
  <section v-if="places.length" class="section">
    <div class="section__header">
      <h2 class="section__title" :style="{ color: meta.color }">
        {{ meta.emoji }} {{ meta.label }}
      </h2>
      <button class="section__more" type="button" @click="router.push({ name: 'places', query: { category } })">
        →
      </button>
    </div>
    <div class="section__scroll">
      <div
        v-for="(place, i) in places"
        :key="place.id"
        class="section__card-wrap"
        :style="{ '--i': i }"
      >
        <PlaceCardCompact :place="place" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-md);
}

.section__title {
  font-size: var(--font-size-md);
  font-weight: 700;
}

.section__more {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color var(--transition), background var(--transition);
}

.section__more:hover {
  border-color: var(--color-primary);
  background: var(--color-accent-bg);
}

.section__scroll {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  padding: var(--space-xs) var(--space-md);
  scrollbar-width: none;
}

.section__scroll::-webkit-scrollbar {
  display: none;
}

.section__card-wrap {
  animation: cardSlideIn 260ms ease both;
  animation-delay: calc(var(--i, 0) * 45ms);
}

@keyframes cardSlideIn {
  from { opacity: 0; transform: translateX(10px); }
  to   { opacity: 1; transform: translateX(0); }
}
</style>
