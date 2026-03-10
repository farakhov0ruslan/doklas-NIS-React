<script setup lang="ts">
import type { Category } from '@/types'
import { CATEGORIES } from '@/utils/constants'

const props = defineProps<{
  modelValue: Category | null
  counts?: Partial<Record<Category, number>>
  filterCount?: number
}>()
const emit = defineEmits<{
  'update:modelValue': [value: Category | null]
  'open-filters': []
}>()

const categories = Object.entries(CATEGORIES) as [Category, (typeof CATEGORIES)[Category]][]
</script>

<template>
  <div class="filters">
    <button
      class="filter filter--icon"
      type="button"
      :class="{ 'filter--has-filters': (props.filterCount ?? 0) > 0 }"
      aria-label="Открыть фильтры"
      @click="emit('open-filters')"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
      </svg>
      <span v-if="(props.filterCount ?? 0) > 0" class="filter__badge">{{ props.filterCount }}</span>
    </button>
    <button
      class="filter"
      :class="{ 'filter--active': modelValue === null }"
      type="button"
      @click="emit('update:modelValue', null)"
    >
      Все
    </button>
    <button
      v-for="[key, meta] in categories"
      :key="key"
      class="filter"
      :class="{ 'filter--active': modelValue === key }"
      type="button"
      @click="emit('update:modelValue', key)"
    >
      {{ meta.emoji }} {{ meta.label }}
      <span v-if="props.counts?.[key]" class="filter__count">{{ props.counts[key] }}</span>
    </button>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  gap: var(--space-xs);
  overflow-x: auto;
  padding: var(--space-xs) var(--space-md);
  scrollbar-width: none;
}

.filters::-webkit-scrollbar {
  display: none;
}

.filter {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
  transition: border-color var(--transition), background var(--transition), color var(--transition);
}

.filter:hover:not(.filter--active) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.filter__count {
  background: rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  min-width: 16px;
  text-align: center;
}

.filter:not(.filter--active) .filter__count {
  background: var(--color-accent-bg);
  color: var(--color-primary-dark);
}

.filter--icon {
  padding: 6px 10px;
  position: relative;
  flex-shrink: 0;
}

.filter--has-filters {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.filter__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--color-primary);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
</style>
