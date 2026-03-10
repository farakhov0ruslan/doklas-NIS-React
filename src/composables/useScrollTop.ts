import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollTop(threshold = 300) {
  const visible = ref(false)

  function onScroll() {
    visible.value = window.scrollY > threshold
  }

  onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
  onUnmounted(() => window.removeEventListener('scroll', onScroll))

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return { visible, scrollToTop }
}
