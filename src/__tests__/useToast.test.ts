import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useToast } from '@/composables/useToast'

beforeEach(() => {
  vi.useFakeTimers()
  const { toasts } = useToast()
  toasts.splice(0)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useToast', () => {
  it('show adds a toast to the list', () => {
    const { toasts, show } = useToast()
    show('Тест', 'success')
    expect(toasts).toHaveLength(1)
    expect(toasts[0]!.message).toBe('Тест')
    expect(toasts[0]!.type).toBe('success')
  })

  it('auto-removes toast after duration', () => {
    const { toasts, show } = useToast()
    show('Тест', 'info', 3000)
    expect(toasts).toHaveLength(1)
    vi.advanceTimersByTime(3000)
    expect(toasts).toHaveLength(0)
  })

  it('remove deletes by id', () => {
    const { toasts, show, remove } = useToast()
    show('Один', 'success')
    show('Два', 'error')
    const id = toasts[0]!.id
    remove(id)
    expect(toasts).toHaveLength(1)
    expect(toasts[0]!.message).toBe('Два')
  })

  it('defaults to success type', () => {
    const { toasts, show } = useToast()
    show('Сообщение')
    expect(toasts[0]!.type).toBe('success')
  })

  it('multiple toasts stack', () => {
    const { toasts, show } = useToast()
    show('А', 'success')
    show('Б', 'error')
    show('В', 'info')
    expect(toasts).toHaveLength(3)
  })
})
