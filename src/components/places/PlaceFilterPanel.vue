<script setup lang="ts">
import { MAX_PRICE_LIMIT } from '@/composables/useFilters'

const props = defineProps<{
  isOpen: boolean
  minRating: number
  maxPrice: number | null
  activeCount: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:minRating', v: number): void
  (e: 'update:maxPrice', v: number | null): void
  (e: 'reset'): void
}>()

const RATING_OPTIONS = [0, 3, 3.5, 4, 4.5, 5] as const

function onPriceInput(event: Event) {
  const val = Number((event.target as HTMLInputElement).value)
  emit('update:maxPrice', val >= MAX_PRICE_LIMIT ? null : val)
}

function priceLabel(v: number | null): string {
  if (v === null) return 'Любая'
  if (v === 0) return 'Бесплатно'
  return `до ${v.toLocaleString('ru')} ₽`
}
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="isOpen" class="fp" role="dialog" aria-modal="true" aria-label="Фильтры">
        <div class="fp__overlay" @click="emit('close')" />

        <div class="fp__sheet">
          <div class="fp__header">
            <h3 class="fp__title">Фильтры</h3>
            <button class="fp__close" aria-label="Закрыть" @click="emit('close')">✕</button>
          </div>

          <div class="fp__section">
            <p class="fp__label">Минимальный рейтинг</p>
            <div class="fp__rating-row">
              <button
                v-for="v in RATING_OPTIONS"
                :key="v"
                class="fp__rating-btn"
                :class="{ 'fp__rating-btn--active': minRating === v }"
                @click="emit('update:minRating', v)"
              >
                {{ v === 0 ? 'Любой' : `${v}+` }}
              </button>
            </div>
          </div>

          <div class="fp__section">
            <p class="fp__label">
              Максимальная цена
              <span class="fp__label-val">— {{ priceLabel(maxPrice) }}</span>
            </p>
            <input
              type="range"
              class="fp__slider"
              min="0"
              :max="MAX_PRICE_LIMIT"
              step="100"
              :value="maxPrice ?? MAX_PRICE_LIMIT"
              @input="onPriceInput"
            />
            <div class="fp__slider-labels">
              <span>0 ₽</span>
              <span>{{ MAX_PRICE_LIMIT.toLocaleString('ru') }} ₽</span>
            </div>
          </div>

          <div class="fp__footer">
            <button class="fp__reset" @click="emit('reset')">Сбросить всё</button>
            <button class="fp__apply" @click="emit('close')">
              Применить{{ activeCount > 0 ? ` (${activeCount})` : '' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fp {
  position: fixed;
  inset: 0;
  z-index: 150;
  display: flex;
  align-items: flex-end;
}

.fp__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(2px);
}

.fp__sheet {
  position: relative;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  background: var(--color-surface);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  box-shadow: var(--shadow-lg);
}

.fp__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fp__title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
}

.fp__close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition);
}

.fp__close:hover {
  background: var(--color-accent-bg);
}

.fp__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.fp__label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
}

.fp__label-val {
  font-weight: 400;
  color: var(--color-text-muted);
}

.fp__rating-row {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.fp__rating-btn {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--color-border);
  background: var(--color-bg);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
  transition: border-color var(--transition), background var(--transition), color var(--transition);
}

.fp__rating-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.fp__rating-btn--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.fp__slider {
  width: 100%;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.fp__slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.fp__footer {
  display: flex;
  gap: var(--space-sm);
}

.fp__reset {
  flex: 1;
  padding: 10px;
  border-radius: var(--radius-full);
  border: 1.5px solid var(--color-border);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: border-color var(--transition), color var(--transition);
}

.fp__reset:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.fp__apply {
  flex: 2;
  padding: 10px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: #fff;
  font-size: var(--font-size-sm);
  font-weight: 700;
  cursor: pointer;
  transition: opacity var(--transition);
}

.fp__apply:hover {
  opacity: 0.9;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 220ms ease;
}

.sheet-enter-active .fp__sheet,
.sheet-leave-active .fp__sheet {
  transition: transform 220ms ease;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

.sheet-enter-from .fp__sheet,
.sheet-leave-to .fp__sheet {
  transform: translateY(100%);
}
</style>
