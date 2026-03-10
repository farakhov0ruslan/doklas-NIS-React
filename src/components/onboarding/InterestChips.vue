<script setup lang="ts">
import type { Category } from '@/types'
import { CATEGORIES } from '@/utils/constants'

const props = defineProps<{ modelValue: Category[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: Category[]] }>()

const options = Object.entries(CATEGORIES) as [Category, (typeof CATEGORIES)[Category]][]

function toggle(cat: Category) {
  const next = props.modelValue.includes(cat)
    ? props.modelValue.filter(c => c !== cat)
    : [...props.modelValue, cat]
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="chips">
    <button
      v-for="[key, meta] in options"
      :key="key"
      class="chip"
      :class="{ 'chip--active': modelValue.includes(key) }"
      type="button"
      @click="toggle(key)"
    >
      {{ meta.emoji }} {{ meta.label }}
    </button>
  </div>
</template>

<style scoped>
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.chip {
  padding: 8px 16px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: border-color var(--transition), background var(--transition), color var(--transition);
}

.chip:hover:not(.chip--active) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.chip--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}
</style>
