import { createRouter, createWebHistory } from 'vue-router'
import { usePlannerStore } from '@/stores/plannerStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',            name: 'home',         component: () => import('@/views/HomeView.vue') },
    { path: '/onboarding',  name: 'onboarding',   component: () => import('@/views/OnboardingView.vue') },
    { path: '/places',      name: 'places',        component: () => import('@/views/PlacesView.vue') },
    { path: '/places/:id',  name: 'place-detail',  component: () => import('@/views/PlaceDetailView.vue') },
    { path: '/cart',        name: 'cart',          component: () => import('@/views/CartView.vue') },
    { path: '/planner',     name: 'planner',       component: () => import('@/views/PlannerView.vue') },
    { path: '/summary',     name: 'summary',       component: () => import('@/views/SummaryView.vue') },
    { path: '/favorites',   name: 'favorites',     component: () => import('@/views/FavoritesView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue') },
  ],
})

router.beforeEach(to => {
  const planner = usePlannerStore()
  if (to.name === 'planner' && !planner.isGenerated) return { name: 'cart' }
  if (to.name === 'summary' && !planner.isGenerated) return { name: 'home' }
})

router.afterEach(() => {
  window.scrollTo({ top: 0, behavior: 'instant' })
})

export default router
