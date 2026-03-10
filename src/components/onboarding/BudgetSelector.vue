<script setup lang="ts">
import type { Budget } from '@/types'
import { BUDGET_LABELS } from '@/utils/constants'

defineProps<{ modelValue: Budget | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: Budget] }>()

const options: { key: Budget; emoji: string }[] = [
  { key: 'low',    emoji: '🪙' },
  { key: 'medium', emoji: '💳' },
  { key: 'high',   emoji: '💎' },
]
</script>

<template>
  <div class="options">
    <button
      v-for="o in options"
      :key="o.key"
      class="option"
      :class="{ 'option--active': modelValue === o.key }"
      type="button"
      @click="emit('update:modelValue', o.key)"
    >
      <span class="option__emoji">{{ o.emoji }}</span>
      <span class="option__label">{{ BUDGET_LABELS[o.key] }}</span>
    </button>
  </div>
</template>

<style scoped>
.options {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.option {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  text-align: left;
  transition: border-color var(--transition), background var(--transition);
}

.option:hover:not(.option--active) {
  border-color: var(--color-primary);
}

.option--active {
  border-color: var(--color-primary);
  background: var(--color-accent-bg);
}

.option__emoji {
  font-size: 24px;
  flex-shrink: 0;
}

.option__label {
  font-size: var(--font-size-md);
  font-weight: 500;
  color: var(--color-text);
}
</style>
