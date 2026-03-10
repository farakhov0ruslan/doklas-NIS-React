<script setup lang="ts">
import { useScrollTop } from '@/composables/useScrollTop'

const { visible, scrollToTop } = useScrollTop()
</script>

<template>
  <Teleport to="body">
    <Transition name="scroll-top">
      <button
        v-if="visible"
        class="scroll-top"
        aria-label="Прокрутить наверх"
        @click="scrollToTop"
      >
        ↑
      </button>
    </Transition>
  </Teleport>
</template>

<style scoped>
.scroll-top {
  position: fixed;
  bottom: var(--space-xl);
  left: var(--space-lg);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 18px;
  font-weight: 700;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 50;
  border: 1px solid var(--color-border);
  transition: background var(--transition), color var(--transition), transform var(--transition);
}

.scroll-top:hover {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.scroll-top-enter-active,
.scroll-top-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}

.scroll-top-enter-from,
.scroll-top-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
