<script setup lang="ts">
import { useConfirm } from '@/composables/useConfirm'

const { state, answer } = useConfirm()
</script>

<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div v-if="state" class="overlay" @click.self="answer(false)" @keydown.esc.window="answer(false)">
        <div class="modal" role="dialog" :aria-label="state.title">
          <h3 class="modal__title">{{ state.title }}</h3>
          <p class="modal__message">{{ state.message }}</p>
          <div class="modal__actions">
            <button class="modal__btn modal__btn--cancel" @click="answer(false)">Отмена</button>
            <button class="modal__btn modal__btn--confirm" @click="answer(true)">Подтвердить</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: var(--space-md);
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  max-width: 360px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.modal__title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
}

.modal__message {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  line-height: 1.5;
}

.modal__actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
}

.modal__btn {
  padding: 9px 20px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition);
}

.modal__btn--cancel {
  background: var(--color-bg);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.modal__btn--cancel:hover {
  border-color: var(--color-text-muted);
}

.modal__btn--confirm {
  background: var(--color-danger);
  color: #fff;
  border: none;
}

.modal__btn--confirm:hover {
  opacity: 0.88;
}

.confirm-enter-active {
  animation: fadeIn 180ms ease;
}

.confirm-leave-active {
  animation: fadeIn 150ms ease reverse;
}
</style>
