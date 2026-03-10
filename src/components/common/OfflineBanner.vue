<script setup lang="ts">
import { useNetworkStatus } from '@/composables/useNetworkStatus'

const { isOnline } = useNetworkStatus()
</script>

<template>
  <Teleport to="body">
    <Transition name="banner">
      <div v-if="!isOnline" class="offline" role="alert" aria-live="polite">
        📡 Нет соединения с интернетом
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.offline {
  position: fixed;
  bottom: var(--space-lg);
  left: 50%;
  transform: translateX(-50%);
  background: #2C2C2C;
  color: #fff;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  z-index: 500;
  white-space: nowrap;
  box-shadow: var(--shadow-lg);
}

.banner-enter-active,
.banner-leave-active {
  transition: opacity 250ms ease, transform 250ms ease;
}

.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
</style>
