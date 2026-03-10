<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
</script>

<template>
  <div class="notfound">
    <span class="notfound__emoji">🗺️</span>
    <h1 class="notfound__code">404</h1>
    <p class="notfound__title">Страница не найдена</p>
    <p class="notfound__sub">Кажется, вы свернули не туда. Давайте вернёмся на главную.</p>
    <div class="notfound__actions">
      <BaseButton variant="primary" @click="router.push('/')">На главную</BaseButton>
      <BaseButton variant="outline" @click="router.back()">← Назад</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.notfound {
  min-height: calc(100vh - var(--header-height));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  padding: var(--space-2xl) var(--space-lg);
  text-align: center;
}

.notfound__emoji {
  font-size: 64px;
  line-height: 1;
  animation: float 3s ease-in-out infinite;
}

.notfound__code {
  font-size: 96px;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1;
  letter-spacing: -0.04em;
}

.notfound__title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text);
}

.notfound__sub {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  max-width: 320px;
  line-height: 1.6;
}

.notfound__actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
}
</style>
