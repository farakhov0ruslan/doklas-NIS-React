<script setup lang="ts">
import type { CartItem, Place } from '@/types'
import { formatDuration, formatPrice } from '@/utils/timeHelpers'
import CategoryBadge from '@/components/common/CategoryBadge.vue'

defineProps<{ item: CartItem; place: Place; index: number }>()

const emit = defineEmits<{
  remove: [placeId: string]
  dragStart: [index: number]
  dragOver: [index: number]
  drop: [index: number]
}>()
</script>

<template>
  <div
    class="row"
    draggable="true"
    @dragstart="emit('dragStart', index)"
    @dragover.prevent="emit('dragOver', index)"
    @drop.prevent="emit('drop', index)"
  >
    <span class="row__handle" title="Перетащить">⠿</span>

    <img :src="place.image" :alt="place.name" class="row__img" />

    <div class="row__info">
      <p class="row__name">{{ place.name }}</p>
      <CategoryBadge :category="place.category" />
      <p class="row__meta">⏱ {{ formatDuration(place.duration) }} · 💰 {{ formatPrice(place.price) }}</p>
    </div>

    <button class="row__remove" type="button" :title="`Удалить ${place.name}`" @click="emit('remove', place.id)">
      ✕
    </button>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  cursor: grab;
  transition: box-shadow var(--transition), opacity var(--transition);
}

.row:active {
  cursor: grabbing;
}

.row[draggable="true"]:hover {
  box-shadow: var(--shadow-md);
}

.row__handle {
  font-size: 18px;
  color: var(--color-text-muted);
  cursor: grab;
  flex-shrink: 0;
  user-select: none;
}

.row__img {
  width: 60px;
  height: 60px;
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
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row__meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.row__remove {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 13px;
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
