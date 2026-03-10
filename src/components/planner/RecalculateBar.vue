<script setup lang="ts">
import type { RecalculateAction } from '@/types'

defineProps<{ loading?: boolean }>()

const emit = defineEmits<{
  recalculate: [action: RecalculateAction]
}>()

const actions: { key: RecalculateAction; label: string; icon: string; hint: string }[] = [
  { key: 'lighter', label: 'Легче', icon: '🕊️', hint: 'Убрать самые длинные места' },
  { key: 'optimize', label: 'Оптимизировать', icon: '⚡', hint: 'Сортировать по продолжительности' },
  { key: 'more', label: 'Добавить', icon: '➕', hint: 'Добавить новые места' },
]
</script>

<template>
  <div class="bar">
    <p class="bar__label">Скорректировать маршрут:</p>
    <div class="bar__actions">
      <button
        v-for="action in actions"
        :key="action.key"
        class="bar__btn"
        type="button"
        :title="action.hint"
        :disabled="loading"
        @click="emit('recalculate', action.key)"
      >
        <span class="bar__btn-icon">{{ action.icon }}</span>
        {{ action.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.bar {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.bar__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-weight: 500;
}

.bar__actions {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.bar__btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-full);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
  transition: background var(--transition), border-color var(--transition), color var(--transition);
}

.bar__btn:hover:not(:disabled) {
  background: var(--color-accent-bg);
  border-color: var(--color-primary);
  color: var(--color-primary-dark);
}

.bar__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bar__btn-icon {
  font-size: 16px;
  line-height: 1;
}
</style>
