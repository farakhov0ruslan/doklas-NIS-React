<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlannerStore } from '@/stores/plannerStore'
import { usePlacesStore } from '@/stores/placesStore'
import { usePlacesInit } from '@/composables/usePlacesInit'
import DayBlock from '@/components/planner/DayBlock.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const planner = usePlannerStore()
const placesStore = usePlacesStore()
usePlacesInit()

const allPlaces = computed(() => [...placesStore.all, ...placesStore.recommended])

function handleRemove(dayNumber: number, placeId: string) {
  planner.removePlaceFromDay(dayNumber, placeId)
}

function handleReorder(dayNumber: number, fromIndex: number, toIndex: number) {
  planner.reorderInDay(dayNumber, fromIndex, toIndex)
}

function handleMoveToDay(placeId: string, sourceDayNum: number, targetDayNum: number) {
  planner.movePlace(sourceDayNum, targetDayNum, placeId)
}
</script>

<template>
  <div class="planner">
    <div class="planner__header">
      <div>
        <h1 class="planner__title">Ваш маршрут</h1>
        <p class="planner__subtitle">{{ planner.days.length }} {{ planner.days.length === 1 ? 'день' : 'дня' }} · {{ planner.totalPlaces }} мест</p>
      </div>
      <BaseButton variant="outline" size="sm" @click="router.push('/summary')">
        Сохранить →
      </BaseButton>
    </div>

    <div v-if="planner.loading || placesStore.loading" class="planner__loading">
      <LoadingSpinner />
      <p>{{ planner.loading ? 'Пересчитываем маршрут…' : 'Загружаем данные…' }}</p>
    </div>

    <template v-else>
      <p v-if="planner.error" class="planner__error">{{ planner.error }}</p>

      <div class="planner__days">
        <DayBlock
          v-for="day in planner.days"
          :key="day.dayNumber"
          :day="day"
          :places="allPlaces"
          @remove="handleRemove"
          @reorder="handleReorder"
          @move-to-day="handleMoveToDay"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.planner {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-lg) var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  min-height: calc(100vh - var(--header-height));
}

.planner__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-md);
}

.planner__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
}

.planner__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-top: 2px;
}

.planner__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-2xl);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.planner__error {
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  text-align: center;
}

.planner__days {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
</style>
