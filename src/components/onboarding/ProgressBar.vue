<script setup lang="ts">
defineProps<{
  current: number
  total: number
}>()
</script>

<template>
  <div class="progress" role="progressbar" :aria-valuenow="current" :aria-valuemax="total">
    <div class="progress__track">
      <div class="progress__fill" :style="{ width: `${(current / total) * 100}%` }" />
    </div>
    <span class="progress__label">{{ current }} / {{ total }}</span>
  </div>
</template>

<style scoped>
.progress {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.progress__track {
  flex: 1;
  height: 6px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress__fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  transition: width 300ms ease;
}

.progress__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
