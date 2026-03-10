<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { usePlannerStore } from '@/stores/plannerStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useTheme } from '@/composables/useTheme'
import { useSearchOverlay } from '@/composables/useSearchOverlay'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const planner = usePlannerStore()
const favStore = useFavoritesStore()
const { isDark, toggle: toggleTheme } = useTheme()
const { open: openSearch } = useSearchOverlay()

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    openSearch()
  }
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

const showTabBar = computed(() =>
  ['places', 'place-detail', 'planner', 'summary'].includes(String(route.name))
)

const isActive = (name: string) => route.name === name
</script>

<template>
  <header class="header">
    <RouterLink to="/" class="logo">ATLAS</RouterLink>

    <nav v-if="showTabBar" class="tabs">
      <RouterLink to="/places" class="tab" :class="{ 'tab--active': isActive('places') || isActive('place-detail') }">
        Места
      </RouterLink>
      <RouterLink to="/planner" class="tab" :class="{ 'tab--active': isActive('planner') || isActive('summary') }">
        Мой маршрут
        <span v-if="planner.totalPlaces > 0" class="tab__badge">{{ planner.days.length }}</span>
      </RouterLink>
    </nav>

    <button class="search-btn" aria-label="Поиск (Cmd+K)" @click="openSearch">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    </button>

    <button class="theme-btn" :aria-label="isDark ? 'Светлая тема' : 'Тёмная тема'" @click="toggleTheme">
      {{ isDark ? '☀️' : '🌙' }}
    </button>

    <button class="fav-btn" aria-label="Избранное" @click="router.push('/favorites')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <Transition name="badge">
        <span v-if="favStore.count > 0" :key="favStore.count" class="fav-btn__badge">{{ favStore.count }}</span>
      </Transition>
    </button>

    <button class="cart-btn" aria-label="Корзина" @click="router.push('/cart')">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <Transition name="badge">
        <span v-if="cart.count > 0" :key="cart.count" class="cart-btn__badge">{{ cart.count }}</span>
      </Transition>
    </button>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--header-height);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  padding: 0 var(--space-lg);
  gap: var(--space-md);
}

.logo {
  font-size: var(--font-size-lg);
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.tabs {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: var(--space-xs);
}

.tab {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text);
  transition: background var(--transition), color var(--transition);
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  text-decoration: none;
}

.tab:hover:not(.tab--disabled):not(.tab--active) {
  background: var(--color-accent-bg);
}

.tab--active {
  background: var(--color-primary);
  color: #fff;
}


.tab__badge {
  background: rgba(255, 255, 255, 0.35);
  color: #fff;
  font-size: var(--font-size-xs);
  font-weight: 700;
  border-radius: var(--radius-full);
  padding: 1px 6px;
  min-width: 18px;
  text-align: center;
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  color: var(--color-text);
  transition: background var(--transition), color var(--transition);
  flex-shrink: 0;
  margin-left: auto;
}

.search-btn:hover {
  background: var(--color-accent-bg);
  color: var(--color-primary);
}

.theme-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  font-size: 18px;
  color: var(--color-text);
  transition: background var(--transition);
  flex-shrink: 0;
}

.theme-btn:hover {
  background: var(--color-accent-bg);
}

.fav-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  color: var(--color-text);
  transition: background var(--transition), color var(--transition);
  flex-shrink: 0;
}

.fav-btn:hover {
  background: var(--color-accent-bg);
  color: var(--color-danger);
}

.fav-btn__badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: var(--color-danger);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: var(--radius-full);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.cart-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  color: var(--color-text);
  transition: background var(--transition), color var(--transition);
  flex-shrink: 0;
}

.cart-btn:hover {
  background: var(--color-accent-bg);
  color: var(--color-primary);
}

.cart-btn__badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: var(--color-primary);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: var(--radius-full);
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.badge-enter-active {
  animation: badgePop 300ms ease;
}

@media (max-width: 480px) {
  .tabs {
    gap: 2px;
  }

  .tab {
    padding: 6px 10px;
    font-size: var(--font-size-xs);
  }
}
</style>
