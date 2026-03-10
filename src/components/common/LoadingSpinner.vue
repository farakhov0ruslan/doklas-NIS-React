<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg'
  text?: string
}>()
</script>

<template>
  <div class="spinner-wrap">
    <div class="spinner" :class="`spinner--${size ?? 'md'}`" />
    <p v-if="text" class="spinner-text">{{ text }}</p>
  </div>
</template>

<style scoped>
.spinner-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.spinner {
  border-radius: 50%;
  border-style: solid;
  border-color: var(--color-border);
  border-top-color: var(--color-primary);
  animation: spin 0.8s linear infinite;
}

.spinner--sm { width: 18px; height: 18px; border-width: 2px; }
.spinner--md { width: 32px; height: 32px; border-width: 3px; }
.spinner--lg { width: 48px; height: 48px; border-width: 4px; }

.spinner-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
