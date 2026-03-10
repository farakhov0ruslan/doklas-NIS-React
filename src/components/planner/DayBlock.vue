<script setup lang="ts">
import { ref } from 'vue'
import type { DayPlan, Place } from '@/types'
import { formatDuration } from '@/utils/timeHelpers'
import PlaceInDayRow from './PlaceInDayRow.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const props = defineProps<{
  day: DayPlan
  places: Place[]
}>()

const emit = defineEmits<{
  remove: [dayNumber: number, placeId: string]
  reorder: [dayNumber: number, fromIndex: number, toIndex: number]
  moveToDay: [placeId: string, sourceDayNum: number, targetDayNum: number]
}>()

const dragFromIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const isDragTarget = ref(false)

function onDragStart(index: number) {
  dragFromIndex.value = index
}

function onDragOver(index: number) {
  dragOverIndex.value = index
}

function onDrop(toIndex: number) {
  if (dragFromIndex.value !== null && dragFromIndex.value !== toIndex) {
    emit('reorder', props.day.dayNumber, dragFromIndex.value, toIndex)
  }
  dragFromIndex.value = null
  dragOverIndex.value = null
}

function onContainerDragOver(e: DragEvent) {
  e.preventDefault()
  isDragTarget.value = true
}

function onContainerDrop(e: DragEvent) {
  e.preventDefault()
  isDragTarget.value = false
  const raw = e.dataTransfer?.getData('text/plain')
  if (!raw) return
  try {
    const { placeId, sourceDayNum } = JSON.parse(raw) as { placeId: string; sourceDayNum: number }
    if (sourceDayNum !== props.day.dayNumber) {
      emit('moveToDay', placeId, sourceDayNum, props.day.dayNumber)
    }
  } catch {
    // invalid dataTransfer payload — ignore
  }
}

function onContainerDragLeave(e: DragEvent) {
  // only clear if leaving the block entirely (not entering a child)
  if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
    isDragTarget.value = false
  }
}

function placeForEntry(placeId: string): Place | undefined {
  return props.places.find(p => p.id === placeId)
}
</script>

<template>
  <div
    class="block"
    :class="{ 'block--drag-target': isDragTarget }"
    @dragover="onContainerDragOver"
    @drop="onContainerDrop"
    @dragleave="onContainerDragLeave"
  >
    <div class="block__header">
      <div class="block__title-wrap">
        <span class="block__day-num">День {{ day.dayNumber }}</span>
        <span class="block__meta">{{ day.places.length }} мест · {{ formatDuration(day.totalDuration) }}</span>
      </div>
      <span v-if="isDragTarget" class="block__drop-hint">Перетащить сюда</span>
    </div>

    <div class="block__body">
      <EmptyState
        v-if="day.places.length === 0"
        icon="📍"
        title="День пуст"
        description="Перетащите место из другого дня"
      />

      <template v-for="(entry, i) in day.places" :key="entry.placeId">
        <PlaceInDayRow
          v-if="placeForEntry(entry.placeId)"
          :entry="entry"
          :place="placeForEntry(entry.placeId)!"
          :index="i"
          :day-number="day.dayNumber"
          :class="{ 'is-drag-over': dragOverIndex === i && dragFromIndex !== i }"
          @remove="emit('remove', $event, entry.placeId)"
          @drag-start="onDragStart"
          @drag-over="onDragOver"
          @drop="onDrop"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.block {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow var(--transition), outline var(--transition);
}

.block--drag-target {
  box-shadow: var(--shadow-md);
  outline: 2px dashed var(--color-primary);
  outline-offset: 2px;
}

.block__header {
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-accent-bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.block__title-wrap {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
}

.block__day-num {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
}

.block__meta {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.block__drop-hint {
  font-size: var(--font-size-xs);
  color: var(--color-primary-dark);
  font-weight: 600;
  animation: fadeIn 150ms ease;
}

.block__body {
  padding: var(--space-sm) var(--space-md);
  display: flex;
  flex-direction: column;
}

.is-drag-over {
  outline: 2px dashed var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
</style>
