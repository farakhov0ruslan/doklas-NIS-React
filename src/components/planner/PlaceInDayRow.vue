<script setup lang="ts">
import type { PlaceInDay, Place } from '@/types'
import CategoryBadge from '@/components/common/CategoryBadge.vue'

const props = defineProps<{
  entry: PlaceInDay
  place: Place
  index: number
  dayNumber: number
}>()

const emit = defineEmits<{
  remove: [dayNumber: number, placeId: string]
  dragStart: [index: number]
  dragOver: [index: number]
  drop: [index: number]
}>()

function onDragStart(e: DragEvent) {
  e.dataTransfer?.setData('text/plain', JSON.stringify({ placeId: props.place.id, sourceDayNum: props.dayNumber }))
  emit('dragStart', props.index)
}
</script>

<template>
  <div
    class="row"
    draggable="true"
    @dragstart="onDragStart"
    @dragover.prevent="emit('dragOver', index)"
    @drop.prevent="emit('drop', index)"
  >
    <div class="row__time">
      <span class="row__time-start">{{ entry.startTime }}</span>
      <span class="row__time-end">{{ entry.endTime }}</span>
    </div>

    <div class="row__line">
      <div class="row__dot" />
      <div class="row__connector" />
    </div>

    <img :src="place.image" :alt="place.name" class="row__img" />

    <div class="row__info">
      <p class="row__name">{{ place.name }}</p>
      <CategoryBadge :category="place.category" />
    </div>

    <button
      class="row__remove"
      type="button"
      :title="`Удалить ${place.name}`"
      @click="emit('remove', dayNumber, place.id)"
    >
      ✕
    </button>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
  cursor: grab;
}

.row:active {
  cursor: grabbing;
}

.row__time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 44px;
  gap: 2px;
}

.row__time-start {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
}

.row__time-end {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.row__line {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
  align-self: stretch;
  flex-shrink: 0;
}

.row__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary);
  flex-shrink: 0;
  margin-top: 4px;
}

.row__connector {
  flex: 1;
  width: 2px;
  background: var(--color-border);
  margin-top: 4px;
}

.row__img {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.row__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.row__name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row__remove {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  transition: background var(--transition), color var(--transition);
}

.row__remove:hover {
  background: #fdecea;
  color: var(--color-danger);
}
</style>
