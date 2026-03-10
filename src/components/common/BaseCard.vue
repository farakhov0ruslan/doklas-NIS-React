<script setup lang="ts">
defineProps<{
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  clickable?: boolean
}>()
</script>

<template>
  <div
    class="card"
    :class="[
      `card--p-${padding ?? 'md'}`,
      { 'card--hoverable': hoverable, 'card--clickable': clickable },
    ]"
  >
    <slot />
  </div>
</template>

<style scoped>
.card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.card--p-none { padding: 0; }
.card--p-sm   { padding: var(--space-sm); }
.card--p-md   { padding: var(--space-md); }
.card--p-lg   { padding: var(--space-lg); }

.card--hoverable {
  transition: box-shadow var(--transition), transform var(--transition);
}
.card--hoverable:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card--clickable {
  cursor: pointer;
}
</style>
