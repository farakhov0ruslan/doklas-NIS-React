<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { usePlacesStore } from '@/stores/placesStore'
import { useUserStore } from '@/stores/userStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { useConfirm } from '@/composables/useConfirm'
import { usePlacesInit } from '@/composables/usePlacesInit'
import CartItemRow from '@/components/cart/CartItemRow.vue'
import CartSummary from '@/components/cart/CartSummary.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const { confirm } = useConfirm()
const cart = useCartStore()
const places = usePlacesStore()
const user = useUserStore()
const planner = usePlannerStore()
usePlacesInit()

const dragFrom = { value: -1 }

function placeForItem(placeId: string) {
  const pool = [...places.all, ...places.recommended]
  return pool.find(p => p.id === placeId)
}

const tripDays = computed(() => user.preferences?.tripDays ?? 3)

async function handleGenerate() {
  await planner.generate(
    cart.items.map(i => i.placeId),
    tripDays.value,
  )
  if (planner.isGenerated) {
    await router.push('/planner')
  }
}

function onDragStart(index: number) {
  dragFrom.value = index
}

function onDragOver(_index: number) {}

function onDrop(toIndex: number) {
  if (dragFrom.value !== -1 && dragFrom.value !== toIndex) {
    cart.reorder(dragFrom.value, toIndex)
  }
  dragFrom.value = -1
}
</script>

<template>
  <div class="cart-view">
    <div class="cart-view__header">
      <h1 class="cart-view__title">Моя подборка</h1>
      <button
        v-if="cart.count > 0"
        class="cart-view__clear"
        type="button"
        @click="confirm('Очистить подборку?', 'Все места будут удалены из подборки.').then(ok => ok && cart.clear())"
      >
        Очистить
      </button>
    </div>

    <EmptyState
      v-if="cart.count === 0"
      icon="🧺"
      title="Подборка пуста"
      description="Добавляйте понравившиеся места и мы построим для вас маршрут"
      action-label="Смотреть места"
      @action="router.push('/places')"
    />

    <div v-else class="cart-view__list">
      <template v-for="(item, i) in cart.items" :key="item.placeId">
        <CartItemRow
          v-if="placeForItem(item.placeId)"
          :item="item"
          :place="placeForItem(item.placeId)!"
          :index="i"
          @remove="cart.remove($event)"
          @drag-start="onDragStart"
          @drag-over="onDragOver"
          @drop="onDrop"
        />
      </template>
    </div>

    <div v-if="cart.count > 0" class="cart-view__footer">
      <CartSummary
        :total-duration="cart.totalDuration"
        :total-cost="cart.totalEstimatedCost"
        :count="cart.count"
        :loading="planner.loading"
        @generate="handleGenerate"
      />

      <p v-if="planner.error" class="cart-view__error">{{ planner.error }}</p>
    </div>
  </div>
</template>

<style scoped>
.cart-view {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--space-lg) var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  min-height: calc(100vh - var(--header-height));
}

.cart-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-view__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
}

.cart-view__clear {
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  cursor: pointer;
  background: none;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: background var(--transition);
}

.cart-view__clear:hover {
  background: #fdecea;
}

.cart-view__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  flex: 1;
}

.cart-view__footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  position: sticky;
  bottom: 0;
}

.cart-view__error {
  font-size: var(--font-size-sm);
  color: var(--color-danger);
  text-align: center;
}
</style>
