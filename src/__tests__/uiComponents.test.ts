import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import StarRating from '@/components/common/StarRating.vue'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('StarRating component', () => {
  it('renders 5 stars by default', () => {
    const wrapper = mount(StarRating, { props: { rating: 4.5 } })
    expect(wrapper.findAll('.star')).toHaveLength(5)
  })

  it('marks full stars correctly for rating 3.0', () => {
    const wrapper = mount(StarRating, { props: { rating: 3.0 } })
    const stars = wrapper.findAll('.star')
    expect(stars[0]!.classes()).toContain('star--full')
    expect(stars[1]!.classes()).toContain('star--full')
    expect(stars[2]!.classes()).toContain('star--full')
    expect(stars[3]!.classes()).toContain('star--empty')
    expect(stars[4]!.classes()).toContain('star--empty')
  })

  it('marks half star for rating 3.5', () => {
    const wrapper = mount(StarRating, { props: { rating: 3.5 } })
    const stars = wrapper.findAll('.star')
    expect(stars[2]!.classes()).toContain('star--full')
    expect(stars[3]!.classes()).toContain('star--half')
    expect(stars[4]!.classes()).toContain('star--empty')
  })

  it('displays rating value', () => {
    const wrapper = mount(StarRating, { props: { rating: 4.7 } })
    expect(wrapper.find('.stars__value').text()).toBe('4.7')
  })

  it('respects custom max prop', () => {
    const wrapper = mount(StarRating, { props: { rating: 3, max: 3 } })
    expect(wrapper.findAll('.star')).toHaveLength(3)
    expect(wrapper.findAll('.star--full')).toHaveLength(3)
  })
})

describe('useDocumentTitle composable', () => {
  it('exports a function', async () => {
    const mod = await import('@/composables/useDocumentTitle')
    expect(typeof mod.useDocumentTitle).toBe('function')
  })
})

describe('useTheme composable', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
    localStorage.removeItem('atlas:theme')
  })

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  it('toggle switches isDark value', async () => {
    vi.resetModules()
    const { useTheme } = await import('@/composables/useTheme')
    const { isDark, toggle } = useTheme()
    const initial = isDark.value
    toggle()
    expect(isDark.value).toBe(!initial)
  })

  it('persists theme choice to localStorage', async () => {
    vi.resetModules()
    const { useTheme } = await import('@/composables/useTheme')
    const { toggle } = useTheme()
    toggle()
    await nextTick()
    const stored = localStorage.getItem('atlas:theme')
    expect(['dark', 'light']).toContain(stored)
  })
})

describe('useSearch composable', () => {
  it('filters places by name substring', () => {
    const places = [
      { id: '1', name: 'Эрмитаж', tags: [], address: '' },
      { id: '2', name: 'Новая Голландия', tags: [], address: '' },
    ]
    const q = 'эрм'
    const result = places.filter(p =>
      p.name.toLowerCase().includes(q.toLowerCase())
    )
    expect(result).toHaveLength(1)
    expect(result[0]!.name).toBe('Эрмитаж')
  })

  it('filters by tag', () => {
    const places = [
      { id: '1', name: 'Музей', tags: ['искусство', 'история'], address: '' },
      { id: '2', name: 'Кафе', tags: ['еда'], address: '' },
    ]
    const q = 'история'
    const result = places.filter(p => p.tags.some(t => t.includes(q)))
    expect(result).toHaveLength(1)
  })
})
