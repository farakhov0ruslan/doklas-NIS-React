<script setup lang="ts">
import type { SortKey, SortDir } from '@/composables/useSort'

defineProps<{
  sortKey: SortKey
  sortDir: SortDir
}>()

const emit = defineEmits<{
  (e: 'sort', key: SortKey): void
}>()

const items: { key: SortKey; label: string }[] = [
  { key: 'rating',   label: 'Рейтинг' },
  { key: 'price',    label: 'Цена' },
  { key: 'duration', label: 'Время' },
  { key: 'name',     label: 'Название' },
]
</script>

<template>
  <div class="sort-bar">
    <span class="sort-bar__label">Сортировка:</span>
    <button
      v-for="item in items"
      :key="item.key"
      class="sort-bar__btn"
      :class="{ 'sort-bar__btn--active': sortKey === item.key }"
      @click="emit('sort', item.key)"
    >
      {{ item.label }}
      <span v-if="sortKey === item.key" class="sort-bar__dir">
        {{ sortDir === 'asc' ? '↑' : '↓' }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.sort-bar {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  overflow-x: auto;
  scrollbar-width: none;
}

.sort-bar::-webkit-scrollbar {
  display: none;
}

.sort-bar__label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.sort-bar__btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background var(--transition), color var(--transition), border-color var(--transition);
}

.sort-bar__btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.sort-bar__btn--active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.sort-bar__dir {
  font-size: 10px;
  font-weight: 700;
}
</style>
