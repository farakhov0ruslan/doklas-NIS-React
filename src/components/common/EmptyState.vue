<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  actionLabel?: string
}>()

const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <div class="empty">
    <div class="empty__icon">🗺️</div>
    <h3 class="empty__title">{{ title }}</h3>
    <p v-if="description" class="empty__desc">{{ description }}</p>
    <button v-if="actionLabel" class="empty__action" @click="emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--space-2xl) var(--space-lg);
  gap: var(--space-sm);
}

.empty__icon {
  font-size: 48px;
  margin-bottom: var(--space-sm);
}

.empty__title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
}

.empty__desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  max-width: 280px;
  line-height: 1.6;
}

.empty__action {
  margin-top: var(--space-sm);
  padding: 10px 24px;
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition);
}

.empty__action:hover {
  background: var(--color-primary-dark);
}
</style>
