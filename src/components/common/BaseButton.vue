<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}>()
</script>

<template>
  <button
    class="btn"
    :class="[
      `btn--${variant ?? 'primary'}`,
      `btn--${size ?? 'md'}`,
      { 'btn--full': fullWidth, 'btn--loading': loading },
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="btn__spinner" />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition), color var(--transition),
    border-color var(--transition), opacity var(--transition), box-shadow var(--transition);
  white-space: nowrap;
  border: 2px solid transparent;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--full {
  width: 100%;
}

.btn--sm { padding: 6px 14px;  font-size: var(--font-size-sm); }
.btn--md { padding: 10px 20px; font-size: var(--font-size-md); }
.btn--lg { padding: 14px 28px; font-size: var(--font-size-lg); }

.btn--primary {
  background: var(--color-primary);
  color: #fff;
}
.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  box-shadow: var(--shadow-sm);
}

.btn--outline {
  background: transparent;
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.btn--outline:hover:not(:disabled) {
  background: var(--color-accent-bg);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text);
}
.btn--ghost:hover:not(:disabled) {
  background: var(--color-accent-bg);
}

.btn--danger {
  background: var(--color-danger);
  color: #fff;
}
.btn--danger:hover:not(:disabled) {
  opacity: 0.85;
}

.btn__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
