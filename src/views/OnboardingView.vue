<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Category, Budget, TravelStyle, Pace } from '@/types'
import { useUserStore } from '@/stores/userStore'
import { usePlacesStore } from '@/stores/placesStore'
import ProgressBar from '@/components/onboarding/ProgressBar.vue'
import InterestChips from '@/components/onboarding/InterestChips.vue'
import StyleImagePicker from '@/components/onboarding/StyleImagePicker.vue'
import BudgetSelector from '@/components/onboarding/BudgetSelector.vue'
import PaceSelector from '@/components/onboarding/PaceSelector.vue'
import DaysInput from '@/components/onboarding/DaysInput.vue'

const router = useRouter()
const userStore = useUserStore()
const placesStore = usePlacesStore()

const TOTAL_STEPS = 5

const step = ref(1)
const interests = ref<Category[]>([])
const travelStyle = ref<TravelStyle[]>([])
const budget = ref<Budget | null>(null)
const pace = ref<Pace | null>(null)
const tripDays = ref(3)

const stepTitles = [
  'Что вам интересно?',
  'Как вы видите свою поездку?',
  'Какой у вас бюджет?',
  'В каком темпе путешествуете?',
  'Сколько дней планируете?',
]

const canNext = computed(() => {
  if (step.value === 1) return interests.value.length > 0
  if (step.value === 2) return travelStyle.value.length > 0
  if (step.value === 3) return budget.value !== null
  if (step.value === 4) return pace.value !== null
  return true
})

const title = computed(() => stepTitles[step.value - 1] ?? '')

function next() {
  if (step.value < TOTAL_STEPS) step.value++
}

function back() {
  if (step.value > 1) step.value--
}

async function finish() {
  const prefs = {
    interests: interests.value,
    travelStyle: travelStyle.value,
    budget: budget.value!,
    pace: pace.value!,
    tripDays: tripDays.value,
  }
  userStore.setPreferences(prefs)
  userStore.completeOnboarding()
  await placesStore.fetchRecommendations(prefs)
  router.push('/places')
}
</script>

<template>
  <div
    class="onboarding"
    @keydown.enter.window="canNext && (step < TOTAL_STEPS ? next() : finish())"
  >
    <div class="onboarding__inner">
      <header class="onboarding__header">
        <RouterLink to="/" class="onboarding__back-home">← ATLAS</RouterLink>
        <ProgressBar :current="step" :total="TOTAL_STEPS" />
      </header>

      <Transition name="step" mode="out-in">
        <div :key="step" class="onboarding__step">
          <h2 class="onboarding__title">{{ title }}</h2>

          <InterestChips v-if="step === 1" v-model="interests" />
          <StyleImagePicker v-else-if="step === 2" v-model="travelStyle" />
          <BudgetSelector v-else-if="step === 3" v-model="budget" />
          <PaceSelector v-else-if="step === 4" v-model="pace" />
          <div v-else class="days-step">
            <DaysInput v-model="tripDays" />
            <p class="days-step__hint">Мы распределим активности по дням автоматически</p>
          </div>
        </div>
      </Transition>

      <div class="onboarding__nav">
        <button v-if="step > 1" class="onboarding__btn-back" type="button" @click="back">
          ← Назад
        </button>
        <div v-else />

        <button
          v-if="step < TOTAL_STEPS"
          class="onboarding__btn-next"
          type="button"
          :disabled="!canNext"
          @click="next"
        >
          Далее →
        </button>
        <button
          v-else
          class="onboarding__btn-finish"
          type="button"
          :disabled="placesStore.loading"
          @click="finish"
        >
          {{ placesStore.loading ? 'Подбираем...' : 'Начать планирование 🚀' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.onboarding {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
}

.onboarding__inner {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.onboarding__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.onboarding__back-home {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 0.05em;
}

.onboarding__step {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  min-height: 320px;
}

.onboarding__title {
  font-size: var(--font-size-xl);
  font-weight: 800;
  color: var(--color-text);
}

.days-step {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.days-step__hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.onboarding__nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.onboarding__btn-back {
  padding: 10px 20px;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  background: transparent;
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: border-color var(--transition), color var(--transition);
}

.onboarding__btn-back:hover {
  border-color: var(--color-text-muted);
  color: var(--color-text);
}

.onboarding__btn-next,
.onboarding__btn-finish {
  padding: 12px 28px;
  border-radius: var(--radius-md);
  border: none;
  background: var(--color-primary);
  color: #fff;
  font-size: var(--font-size-md);
  font-weight: 700;
  cursor: pointer;
  transition: background var(--transition), opacity var(--transition);
}

.onboarding__btn-next:disabled,
.onboarding__btn-finish:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.onboarding__btn-next:hover:not(:disabled),
.onboarding__btn-finish:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.step-enter-active,
.step-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.step-enter-from {
  opacity: 0;
  transform: translateX(16px);
}

.step-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>
