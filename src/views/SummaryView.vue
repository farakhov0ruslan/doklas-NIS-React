<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePlannerStore } from '@/stores/plannerStore'
import { usePlacesStore } from '@/stores/placesStore'
import { useUserStore } from '@/stores/userStore'
import { useCartStore } from '@/stores/cartStore'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { usePlacesInit } from '@/composables/usePlacesInit'
import { formatDuration, formatPrice } from '@/utils/timeHelpers'
import CategoryBadge from '@/components/common/CategoryBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const planner = usePlannerStore()
const placesStore = usePlacesStore()
const user = useUserStore()
const cart = useCartStore()
const { show } = useToast()
const { confirm } = useConfirm()
usePlacesInit()

const allPlaces = computed(() => [...placesStore.all, ...placesStore.recommended])

function placeById(id: string) {
  return allPlaces.value.find(p => p.id === id)
}

const totalCost = computed(() =>
  planner.days.flatMap(d => d.places).reduce((sum, entry) => {
    const p = placeById(entry.placeId)
    return sum + (p?.price ?? 0)
  }, 0)
)

const totalDuration = computed(() =>
  planner.days.reduce((sum, d) => sum + d.totalDuration, 0)
)

const notes = ref('')

const usefulLinks = [
  { label: '🗺️ Яндекс Карты — Санкт-Петербург', url: '#' },
  { label: '🌤️ Погода в Санкт-Петербурге', url: '#' },
  { label: '🚇 Схема метро', url: '#' },
  { label: '🎫 Бронирование отелей', url: '#' },
]

function buildShareText(): string {
  const lines: string[] = [`🗺️ Мой маршрут ATLAS — ${planner.days.length} дня, ${planner.totalPlaces} мест`]
  for (const day of planner.days) {
    lines.push(`\nДень ${day.dayNumber}:`)
    for (const entry of day.places) {
      const p = placeById(entry.placeId)
      if (p) lines.push(`  ${entry.startTime} ${p.name}`)
    }
  }
  lines.push(`\nОбщая стоимость: ${formatPrice(totalCost.value)}`)
  return lines.join('\n')
}

async function handleShare() {
  const text = buildShareText()
  if (navigator.share) {
    await navigator.share({ title: 'Мой маршрут ATLAS', text })
    show('Поделились маршрутом!', 'success')
  } else {
    await navigator.clipboard.writeText(text)
    show('Маршрут скопирован в буфер обмена', 'info')
  }
}

async function handleReset() {
  const ok = await confirm('Начать заново?', 'Маршрут и подборка будут удалены. Это действие нельзя отменить.')
  if (!ok) return
  planner.resetPlan()
  cart.clear()
  router.push('/')
}

function handlePrint() {
  window.print()
}

function handleExport() {
  const lines: string[] = [
    'ATLAS — Мой маршрут',
    '='.repeat(40),
    '',
  ]
  if (user.preferences) {
    const budget = user.preferences.budget === 'low' ? 'Бюджетный' : user.preferences.budget === 'high' ? 'Премиум' : 'Средний'
    lines.push(`Бюджет: ${budget}`, `Дней: ${planner.days.length}`, '')
  }
  for (const day of planner.days) {
    lines.push(`День ${day.dayNumber}  (${formatDuration(day.totalDuration)})`)
    lines.push('-'.repeat(30))
    for (const entry of day.places) {
      const p = placeById(entry.placeId)
      if (p) lines.push(`  ${entry.startTime}–${entry.endTime}  ${p.name}  (${formatPrice(p.price)})`)
    }
    lines.push('')
  }
  lines.push('='.repeat(40))
  lines.push(`Итого мест: ${planner.totalPlaces}`)
  lines.push(`Общая стоимость: ${formatPrice(totalCost.value)}`)
  lines.push(`Общее время: ${formatDuration(totalDuration.value)}`)
  if (notes.value.trim()) {
    lines.push('', 'Заметки:', notes.value.trim())
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'atlas-маршрут.txt'
  a.click()
  URL.revokeObjectURL(url)
  show('Маршрут сохранён как .txt', 'success')
}
</script>

<template>
  <div class="summary">
    <div v-if="placesStore.loading" class="summary__loading">
      <LoadingSpinner text="Загружаем данные…" />
    </div>

    <template v-else>
    <div class="summary__header">
      <div>
        <h1 class="summary__title">Итоговый маршрут</h1>
        <p v-if="user.preferences" class="summary__subtitle">
          {{ planner.days.length }} {{ planner.days.length === 1 ? 'день' : 'дня' }} ·
          {{ user.preferences.budget === 'low' ? 'Бюджетный' : user.preferences.budget === 'high' ? 'Премиум' : 'Средний' }} бюджет
        </p>
      </div>
      <div class="summary__header-actions">
        <BaseButton variant="outline" size="sm" @click="handleShare">🔗 Поделиться</BaseButton>
        <BaseButton variant="outline" size="sm" @click="handleExport">💾 Скачать</BaseButton>
        <BaseButton variant="outline" size="sm" @click="handlePrint">🖨️ Печать</BaseButton>
      </div>
    </div>

    <div class="summary__totals">
      <div class="summary__total-item">
        <span class="summary__total-num">{{ planner.totalPlaces }}</span>
        <span class="summary__total-label">мест</span>
      </div>
      <div class="summary__total-item">
        <span class="summary__total-num">{{ formatDuration(totalDuration) }}</span>
        <span class="summary__total-label">итого</span>
      </div>
      <div class="summary__total-item">
        <span class="summary__total-num">{{ formatPrice(totalCost) }}</span>
        <span class="summary__total-label">стоимость</span>
      </div>
    </div>

    <div class="summary__days">
      <div v-for="day in planner.days" :key="day.dayNumber" class="summary__day">
        <div class="summary__day-header">
          <h2 class="summary__day-title">День {{ day.dayNumber }}</h2>
          <span class="summary__day-meta">{{ formatDuration(day.totalDuration) }}</span>
        </div>

        <div class="summary__places">
          <div
            v-for="(entry, i) in day.places"
            :key="entry.placeId"
            class="summary__place"
          >
            <div class="summary__place-time">
              <span class="summary__place-start">{{ entry.startTime }}</span>
              <span class="summary__place-end">{{ entry.endTime }}</span>
            </div>

            <div class="summary__place-line">
              <div class="summary__place-dot" />
              <div v-if="i < day.places.length - 1" class="summary__place-connector" />
            </div>

            <template v-if="placeById(entry.placeId)">
              <img
                :src="placeById(entry.placeId)!.image"
                :alt="placeById(entry.placeId)!.name"
                class="summary__place-img"
              />
              <div class="summary__place-info">
                <p class="summary__place-name">{{ placeById(entry.placeId)!.name }}</p>
                <div class="summary__place-meta">
                  <CategoryBadge :category="placeById(entry.placeId)!.category" />
                  <span class="summary__place-price">{{ formatPrice(placeById(entry.placeId)!.price) }}</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="summary__notes">
      <h3 class="summary__section-title">📝 Заметки</h3>
      <textarea
        v-model="notes"
        class="summary__notes-input"
        placeholder="Добавьте заметки к поездке — список вещей, пожелания, напоминания…"
        rows="4"
      />
    </div>

    <div class="summary__links">
      <h3 class="summary__section-title">🔗 Полезные ссылки</h3>
      <div class="summary__links-list">
        <a
          v-for="link in usefulLinks"
          :key="link.label"
          :href="link.url"
          class="summary__link"
          target="_blank"
          rel="noopener"
        >
          {{ link.label }}
        </a>
      </div>
    </div>

    <div class="summary__footer">
      <BaseButton variant="outline" @click="router.push('/planner')">
        ← Редактировать
      </BaseButton>
      <BaseButton variant="danger" @click="handleReset">
        Начать заново
      </BaseButton>
    </div>
    </template>
  </div>
</template>

<style scoped>
.summary {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-lg) var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  min-height: calc(100vh - var(--header-height));
}

.summary__loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 40vh;
}

.summary__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
}

.summary__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
}

.summary__subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  margin-top: 4px;
}

.summary__header-actions {
  display: flex;
  gap: var(--space-sm);
}

.summary__totals {
  display: flex;
  gap: var(--space-lg);
  padding: var(--space-md) var(--space-lg);
  background: var(--color-accent-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-primary);
}

.summary__total-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.summary__total-num {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-primary-dark);
}

.summary__total-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.summary__days {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.summary__day {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.summary__day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  background: var(--color-accent-bg);
  border-bottom: 1px solid var(--color-border);
}

.summary__day-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
}

.summary__day-meta {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.summary__places {
  padding: var(--space-sm) var(--space-md);
  display: flex;
  flex-direction: column;
}

.summary__place {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-sm) 0;
}

.summary__place-time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 44px;
  gap: 2px;
  flex-shrink: 0;
}

.summary__place-start {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
}

.summary__place-end {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.summary__place-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
  align-self: stretch;
  flex-shrink: 0;
}

.summary__place-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary);
  flex-shrink: 0;
  margin-top: 4px;
}

.summary__place-connector {
  flex: 1;
  width: 2px;
  background: var(--color-border);
  margin-top: 4px;
}

.summary__place-img {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.summary__place-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.summary__place-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary__place-meta {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.summary__place-price {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.summary__footer {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.summary__notes,
.summary__links {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.summary__section-title {
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--color-text);
}

.summary__notes-input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-sm);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  color: var(--color-text);
  background: var(--color-bg);
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
  transition: border-color var(--transition);
}

.summary__notes-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.summary__links-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary__link {
  font-size: var(--font-size-sm);
  color: var(--color-primary-dark);
  text-decoration: none;
  padding: 6px var(--space-sm);
  border-radius: var(--radius-sm);
  background: var(--color-accent-bg);
  transition: background var(--transition);
}

.summary__link:hover {
  background: #d4edd3;
}

@media (max-width: 480px) {
  .summary__totals {
    gap: var(--space-md);
    padding: var(--space-md);
  }

  .summary__footer {
    flex-direction: column;
  }
}

@media print {
  .summary__header-actions,
  .summary__footer {
    display: none;
  }
}
</style>
