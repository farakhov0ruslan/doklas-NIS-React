<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlacesStore } from '@/stores/placesStore'
import { useSearchOverlay } from '@/composables/useSearchOverlay'

const MAX_RESULTS = 8

const router = useRouter()
const placesStore = usePlacesStore()
const { isOpen, close } = useSearchOverlay()

const query = ref('')
const activeIndex = ref(-1)
const inputRef = ref<HTMLInputElement | null>(null)

const pool = computed(() => {
  const seen = new Set<string>()
  return [...placesStore.all, ...placesStore.recommended].filter(p => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })
})

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return pool.value
    .filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.address?.toLowerCase().includes(q)
    )
    .slice(0, MAX_RESULTS)
})

watch(isOpen, open => {
  if (open) {
    query.value = ''
    activeIndex.value = -1
    // focus input on next frame after transition
    requestAnimationFrame(() => inputRef.value?.focus())
  }
})

watch(query, () => { activeIndex.value = -1 })

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return
  if (e.key === 'Escape') { close(); return }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, -1)
  } else if (e.key === 'Enter') {
    if (activeIndex.value >= 0 && results.value[activeIndex.value]) {
      goToPlace(results.value[activeIndex.value]!.id)
    } else if (query.value.trim()) {
      goToSearch()
    }
  }
}

function goToPlace(id: string) {
  close()
  router.push(`/places/${id}`)
}

function goToSearch() {
  close()
  router.push({ path: '/places', query: { search: query.value.trim() } })
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="isOpen" class="search-overlay" role="dialog" aria-modal="true" aria-label="Поиск мест" @click.self="close">
        <div class="search-overlay__box">
          <div class="search-overlay__input-wrap">
            <svg class="search-overlay__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref="inputRef"
              v-model="query"
              class="search-overlay__input"
              type="text"
              placeholder="Поиск мест, категорий, тегов…"
              autocomplete="off"
            />
            <button class="search-overlay__close" aria-label="Закрыть" @click="close">✕</button>
          </div>

          <div v-if="results.length" class="search-overlay__results">
            <button
              v-for="(place, i) in results"
              :key="place.id"
              class="search-overlay__result"
              :class="{ 'search-overlay__result--active': i === activeIndex }"
              @click="goToPlace(place.id)"
              @mouseenter="activeIndex = i"
            >
              <img :src="place.image" :alt="place.name" class="search-overlay__result-img" />
              <div class="search-overlay__result-info">
                <span class="search-overlay__result-name">{{ place.name }}</span>
                <span class="search-overlay__result-meta">{{ place.address }}</span>
              </div>
              <span class="search-overlay__result-arrow">→</span>
            </button>

            <button
              v-if="query.trim()"
              class="search-overlay__all"
              @click="goToSearch"
            >
              Смотреть все результаты: «{{ query.trim() }}»
            </button>
          </div>

          <p v-else-if="query.trim()" class="search-overlay__empty">
            По запросу «{{ query }}» ничего не найдено
          </p>

          <p v-else class="search-overlay__hint">
            Начните вводить название места, тег или адрес
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: calc(var(--header-height) + var(--space-lg));
  padding-left: var(--space-md);
  padding-right: var(--space-md);
}

.search-overlay__box {
  width: 100%;
  max-width: 600px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.search-overlay__input-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.search-overlay__icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.search-overlay__input {
  flex: 1;
  font-size: var(--font-size-md);
  color: var(--color-text);
  background: none;
  border: none;
  outline: none;
  font-family: var(--font-family);
}

.search-overlay__input::placeholder {
  color: var(--color-text-muted);
}

.search-overlay__close {
  color: var(--color-text-muted);
  font-size: 14px;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background var(--transition);
}

.search-overlay__close:hover {
  background: var(--color-accent-bg);
}

.search-overlay__results {
  display: flex;
  flex-direction: column;
}

.search-overlay__result {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  width: 100%;
  transition: background var(--transition);
  cursor: pointer;
}

.search-overlay__result:hover,
.search-overlay__result--active {
  background: var(--color-accent-bg);
}

.search-overlay__result-img {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.search-overlay__result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.search-overlay__result-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-overlay__result-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-overlay__result-arrow {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.search-overlay__all {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-sm);
  color: var(--color-primary-dark);
  font-weight: 600;
  text-align: left;
  width: 100%;
  border-top: 1px solid var(--color-border);
  transition: background var(--transition);
}

.search-overlay__all:hover {
  background: var(--color-accent-bg);
}

.search-overlay__empty,
.search-overlay__hint {
  padding: var(--space-lg) var(--space-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  text-align: center;
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 180ms ease;
}

.overlay-enter-active .search-overlay__box,
.overlay-leave-active .search-overlay__box {
  transition: transform 180ms ease, opacity 180ms ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.overlay-enter-from .search-overlay__box,
.overlay-leave-to .search-overlay__box {
  transform: translateY(-12px);
  opacity: 0;
}
</style>
