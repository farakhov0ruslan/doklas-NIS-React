import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setActivePinia, createPinia, getActivePinia } from 'pinia'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { usePlacesStore } from '@/stores/placesStore'
import { useConfirm } from '@/composables/useConfirm'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import type { Place } from '@/types'

const mockPlace: Place = {
  id: 'p1', name: 'Эрмитаж', category: 'museums',
  shortDescription: '', description: '',
  duration: 120, price: 500, image: '', rating: 4.9,
  location: '', address: '', openHours: '', tags: [],
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
})

describe('favoritesStore', () => {
  it('starts empty', () => {
    const store = useFavoritesStore()
    expect(store.ids).toHaveLength(0)
    expect(store.count).toBe(0)
  })

  it('toggle adds a place', () => {
    const store = useFavoritesStore()
    store.toggle('p1')
    expect(store.isFavorite('p1')).toBe(true)
    expect(store.count).toBe(1)
  })

  it('toggle twice removes the place', () => {
    const store = useFavoritesStore()
    store.toggle('p1')
    store.toggle('p1')
    expect(store.isFavorite('p1')).toBe(false)
    expect(store.count).toBe(0)
  })

  it('persists to localStorage', () => {
    const store = useFavoritesStore()
    store.toggle('p1')
    expect(localStorage.getItem('atlas:favorites')).toContain('p1')
  })

  it('isFavorite returns false for unknown id', () => {
    const store = useFavoritesStore()
    expect(store.isFavorite('unknown')).toBe(false)
  })
})

describe('useFavorites composable', () => {
  it('toggle calls store.toggle', async () => {
    const places = usePlacesStore()
    places.all = [mockPlace]
    const store = useFavoritesStore()

    const { useFavorites } = await import('@/composables/useFavorites')
    const { toggle } = useFavorites()

    toggle('p1')
    expect(store.isFavorite('p1')).toBe(true)
  })
})

describe('useConfirm composable', () => {
  it('confirm returns promise that resolves true on answer(true)', async () => {
    const { confirm, answer } = useConfirm()
    const promise = confirm('Удалить?', 'Это нельзя отменить')
    answer(true)
    expect(await promise).toBe(true)
  })

  it('confirm resolves false on answer(false)', async () => {
    const { confirm, answer } = useConfirm()
    const promise = confirm('Удалить?', 'Это нельзя отменить')
    answer(false)
    expect(await promise).toBe(false)
  })

  it('state is null after answer', () => {
    const { state, confirm, answer } = useConfirm()
    confirm('Заголовок', 'Сообщение')
    expect(state.value).not.toBeNull()
    answer(true)
    expect(state.value).toBeNull()
  })
})

describe('ConfirmModal component', () => {
  it('renders nothing when state is null', () => {
    const { state } = useConfirm()
    state.value = null
    const wrapper = mount(ConfirmModal, {
      global: { plugins: [getActivePinia()!] },
    })
    expect(wrapper.find('.modal').exists()).toBe(false)
  })

  it('renders modal when confirm() is called', async () => {
    const { confirm } = useConfirm()
    confirm('Тест', 'Сообщение теста')
    mount(ConfirmModal, {
      attachTo: document.body,
      global: { plugins: [getActivePinia()!] },
    })
    await nextTick()
    const title = document.querySelector('.modal__title')
    expect(title).not.toBeNull()
    expect(title!.textContent).toBe('Тест')
    document.body.innerHTML = ''
  })
})
