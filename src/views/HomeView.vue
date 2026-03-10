<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { usePlacesStore } from '@/stores/placesStore'
import { useSearch } from '@/composables/useSearch'
import OnboardingModal from '@/components/onboarding/OnboardingModal.vue'

const router = useRouter()
const userStore = useUserStore()
const placesStore = usePlacesStore()
const { query: searchQuery } = useSearch()

const showModal = ref(false)

const destinations = [
  {
    name: 'Санкт-Петербург',
    tag: 'Культура и история',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
  },
  {
    name: 'Москва',
    tag: 'Мегаполис',
    image: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=600',
  },
  {
    name: 'Казань',
    tag: 'Восток и запад',
    image: 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=600',
  },
]

async function onSearch() {
  if (!userStore.isOnboardingDone) {
    showModal.value = true
    return
  }
  if (userStore.preferences) {
    await placesStore.fetchRecommendations(userStore.preferences)
  }
  const q = searchQuery.value.trim()
  router.push(q ? `/places?search=${encodeURIComponent(q)}` : '/places')
}

function onSkip() {
  showModal.value = false
  userStore.skipOnboarding()
  router.push('/places')
}

function onStartOnboarding() {
  showModal.value = false
  router.push('/onboarding')
}
</script>

<template>
  <div class="home">
    <section class="hero">
      <img
        class="hero__bg"
        src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600"
        alt=""
      />
      <div class="hero__overlay" />
      <div class="hero__content">
        <p class="hero__eyebrow">Ваш личный гид по России</p>
        <h1 class="hero__title">Здесь рождаются<br />самые крутые<br />путешествия</h1>

        <div class="search-card">
          <div class="search-card__fields">
            <div class="search-card__field">
              <label class="search-card__label">Куда?</label>
              <input v-model="searchQuery" class="search-card__input" type="text" placeholder="Санкт-Петербург" />
            </div>
            <div class="search-card__divider" />
            <div class="search-card__field">
              <label class="search-card__label">Персон</label>
              <input class="search-card__input" type="number" min="1" placeholder="2" />
            </div>
            <div class="search-card__divider" />
            <div class="search-card__field">
              <label class="search-card__label">Даты</label>
              <input class="search-card__input" type="date" />
            </div>
          </div>
          <button class="search-card__btn" @click="onSearch">Показать</button>
        </div>
      </div>
    </section>

    <section class="destinations">
      <h2 class="destinations__title">Подборки мест</h2>
      <div class="destinations__list">
        <div
          v-for="dest in destinations"
          :key="dest.name"
          class="dest-card"
          @click="router.push('/places')"
        >
          <img :src="dest.image" :alt="dest.name" class="dest-card__img" loading="lazy" />
          <div class="dest-card__overlay" />
          <div class="dest-card__info">
            <span class="dest-card__tag">{{ dest.tag }}</span>
            <p class="dest-card__name">{{ dest.name }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>

  <OnboardingModal
    v-if="showModal"
    @skip="onSkip"
    @start-onboarding="onStartOnboarding"
  />
</template>

<style scoped>
.home {
  padding-bottom: var(--space-2xl);
}

.hero {
  position: relative;
  height: 100vh;
  min-height: 560px;
  display: flex;
  align-items: flex-end;
  padding-bottom: var(--space-2xl);
}

.hero__bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
}

.hero__content {
  position: relative;
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.hero__eyebrow {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.hero__title {
  font-size: clamp(28px, 5vw, 48px);
  font-weight: 800;
  color: #fff;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.search-card {
  background: #fff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.search-card__fields {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

@media (max-width: 520px) {
  .search-card__fields {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
  }

  .search-card__divider {
    width: 100%;
    height: 1px;
    margin: 0;
  }

  .search-card__field {
    padding: var(--space-sm) 0;
  }

  .hero__content {
    padding: 0 var(--space-md);
  }

  .dest-card {
    width: 160px;
    height: 220px;
  }
}

.search-card__field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.search-card__label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.search-card__input {
  border: none;
  outline: none;
  font-size: var(--font-size-md);
  color: var(--color-text);
  background: transparent;
  width: 100%;
  padding: 4px 0;
}

.search-card__input::placeholder {
  color: var(--color-border);
}

.search-card__divider {
  width: 1px;
  height: 36px;
  background: var(--color-border);
  flex-shrink: 0;
}

.search-card__btn {
  width: 100%;
  padding: 14px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: background var(--transition), transform var(--transition);
}

.search-card__btn:hover {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.search-card__btn:active {
  transform: translateY(0);
}

.destinations {
  padding: var(--space-xl) var(--space-lg) 0;
  max-width: 680px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.destinations__title {
  font-size: var(--font-size-xl);
  font-weight: 800;
  color: var(--color-text);
}

.destinations__list {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: var(--space-xs);
}

.destinations__list::-webkit-scrollbar {
  display: none;
}

.dest-card {
  position: relative;
  flex-shrink: 0;
  width: 200px;
  height: 260px;
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--transition), box-shadow var(--transition);
}

.dest-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.dest-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 400ms ease;
}

.dest-card:hover .dest-card__img {
  transform: scale(1.06);
}

.dest-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
}

.dest-card__info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dest-card__tag {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.dest-card__name {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: #fff;
}
</style>
