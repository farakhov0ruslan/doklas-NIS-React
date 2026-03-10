<script setup lang="ts">
import { formatDuration, formatPrice } from '@/utils/timeHelpers'
import BaseButton from '@/components/common/BaseButton.vue'

defineProps<{
  totalDuration: number
  totalCost: number
  count: number
  loading?: boolean
}>()

const emit = defineEmits<{
  generate: []
}>()
</script>

<template>
  <div class="summary">
    <div class="summary__stats">
      <div class="summary__stat">
        <span class="summary__stat-label">Мест</span>
        <span class="summary__stat-value">{{ count }}</span>
      </div>
      <div class="summary__divider" />
      <div class="summary__stat">
        <span class="summary__stat-label">Время</span>
        <span class="summary__stat-value">{{ formatDuration(totalDuration) }}</span>
      </div>
      <div class="summary__divider" />
      <div class="summary__stat">
        <span class="summary__stat-label">Стоимость</span>
        <span class="summary__stat-value">{{ formatPrice(totalCost) }}</span>
      </div>
    </div>

    <BaseButton
      variant="primary"
      size="lg"
      :loading="loading"
      fullWidth
      @click="emit('generate')"
    >
      Построить маршрут
    </BaseButton>
  </div>
</template>

<style scoped>
.summary {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: var(--space-md) var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.summary__stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
}

.summary__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.summary__stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary__stat-value {
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--color-text);
}

.summary__divider {
  width: 1px;
  height: 32px;
  background: var(--color-border);
}
</style>
