<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

function goToOnboarding() {
  userStore.resetOnboarding()
  router.push('/onboarding')
}
</script>

<template>
  <footer class="footer">
    <p class="footer__brand">ATLAS — персональный планировщик путешествий</p>
    <button class="footer__onboarding" @click="goToOnboarding">
      {{ userStore.isOnboardingDone ? '⚙️ Изменить предпочтения' : '✨ Настроить подборку' }}
    </button>
    <p class="footer__copy">© 2026 · Все маршруты — моковые данные для демонстрации</p>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: var(--space-md) var(--space-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.footer__brand {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-primary-dark);
}

.footer__onboarding {
  font-size: var(--font-size-xs);
  color: var(--color-primary-dark);
  cursor: pointer;
  background: none;
  border: none;
  padding: 2px 0;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: opacity var(--transition);
}

.footer__onboarding:hover {
  opacity: 0.7;
}

.footer__copy {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
