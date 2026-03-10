<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()
</script>

<template>
  <Teleport to="body">
    <div class="toasts" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
          @click="remove(toast.id)"
        >
          <span class="toast__icon">
            {{ toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ' }}
          </span>
          <span class="toast__msg">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toasts {
  position: fixed;
  bottom: var(--space-lg);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  pointer-events: none;
  width: max-content;
  max-width: calc(100vw - var(--space-xl));
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 10px var(--space-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 500;
  box-shadow: var(--shadow-md);
  pointer-events: all;
  cursor: pointer;
  white-space: nowrap;
}

.toast--success {
  background: #1a3d1a;
  color: #a8f0a0;
}

.toast--error {
  background: #3d1a1a;
  color: #f0a0a0;
}

.toast--info {
  background: #1a2a3d;
  color: #a0c0f0;
}

.toast__icon {
  font-size: 13px;
  font-weight: 700;
}

.toast-enter-active {
  animation: toastIn 250ms ease;
}

.toast-leave-active {
  animation: toastIn 200ms ease reverse;
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
