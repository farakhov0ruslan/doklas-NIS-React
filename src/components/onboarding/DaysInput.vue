<script setup lang="ts">
const props = defineProps<{ modelValue: number }>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

function change(delta: number) {
  const next = Math.min(14, Math.max(1, props.modelValue + delta))
  emit('update:modelValue', next)
}

function onInput(e: Event) {
  const val = parseInt((e.target as HTMLInputElement).value, 10)
  if (!isNaN(val)) emit('update:modelValue', Math.min(14, Math.max(1, val)))
}
</script>

<template>
  <div class="days">
    <button class="days__btn" type="button" :disabled="modelValue <= 1" @click="change(-1)">−</button>
    <input
      class="days__input"
      type="number"
      min="1"
      max="14"
      :value="modelValue"
      @input="onInput"
    />
    <button class="days__btn" type="button" :disabled="modelValue >= 14" @click="change(1)">+</button>
    <span class="days__hint">{{ modelValue === 1 ? 'день' : modelValue < 5 ? 'дня' : 'дней' }}</span>
  </div>
</template>

<style scoped>
.days {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.days__btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color var(--transition), background var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.days__btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  background: var(--color-accent-bg);
}

.days__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.days__input {
  width: 72px;
  height: 44px;
  text-align: center;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
  background: var(--color-surface);
  -moz-appearance: textfield;
}

.days__input::-webkit-outer-spin-button,
.days__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.days__hint {
  font-size: var(--font-size-md);
  color: var(--color-text-muted);
}
</style>
