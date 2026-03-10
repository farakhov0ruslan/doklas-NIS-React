import { watchEffect } from 'vue'
import { useRoute } from 'vue-router'

const TITLES: Record<string, string> = {
  home:         'ATLAS — Ваш гид по России',
  onboarding:   'Опрос — ATLAS',
  places:       'Места — ATLAS',
  'place-detail': 'Место — ATLAS',
  cart:         'Моя подборка — ATLAS',
  planner:      'Маршрут — ATLAS',
  summary:      'Итоговый маршрут — ATLAS',
  favorites:    'Избранное — ATLAS',
  'not-found':  '404 — ATLAS',
}

export function useDocumentTitle() {
  const route = useRoute()
  watchEffect(() => {
    document.title = TITLES[route.name as string] ?? 'ATLAS'
  })
}
