import type { Directive } from 'vue'

export const vIntersection: Directive<HTMLElement, string | undefined> = {
  mounted(el, binding) {
    const className = binding.value ?? 'is-visible'
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add(className)
          observer.unobserve(el)
        }
      },
      { threshold: 0.08 },
    )
    observer.observe(el)
    ;(el as any).__vio__ = observer
  },
  unmounted(el) {
    ;(el as any).__vio__?.disconnect()
  },
}
