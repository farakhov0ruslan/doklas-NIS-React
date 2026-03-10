<script setup lang="ts">
const emit = defineEmits<{ skip: []; startOnboarding: [] }>()
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @click.self="emit('skip')" @keydown.esc.window="emit('skip')">
      <div class="modal">
        <p class="modal__text">
          Прежде чем вы увидите варианты путешествий — пройдите короткий опрос 🏄
        </p>
        <p class="modal__sub">
          Так наша система сможет подобрать более подходящие варианты
        </p>
        <div class="modal__actions">
          <button class="modal__btn modal__btn--skip" @click="emit('skip')">Не сейчас</button>
          <button class="modal__btn modal__btn--start" @click="emit('startOnboarding')">Пройти тест</button>
        </div>
      </div>
    </div>
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
  z-index: 200;
  padding: var(--space-md);
  animation: fadeIn 200ms ease;
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  max-width: 400px;
  width: 100%;
  text-align: center;
  animation: slideUp 220ms ease;
}

.modal__text {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.4;
  margin-bottom: var(--space-sm);
}

.modal__sub {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-lg);
  line-height: 1.5;
}

.modal__actions {
  display: flex;
  gap: var(--space-sm);
}

.modal__btn {
  flex: 1;
  padding: 12px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition), color var(--transition);
}

.modal__btn--skip {
  background: var(--color-bg);
  color: var(--color-text-muted);
  border: 2px solid var(--color-border);
}

.modal__btn--skip:hover {
  border-color: var(--color-text-muted);
}

.modal__btn--start {
  background: var(--color-primary);
  color: #fff;
  border: 2px solid transparent;
}

.modal__btn--start:hover {
  background: var(--color-primary-dark);
}
</style>
