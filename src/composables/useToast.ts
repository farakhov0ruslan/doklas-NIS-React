import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

let nextId = 0

const toasts = reactive<Toast[]>([])

export function useToast() {
  function show(message: string, type: ToastType = 'success', duration = 3000) {
    const id = ++nextId
    toasts.push({ id, message, type })
    setTimeout(() => {
      const i = toasts.findIndex(t => t.id === id)
      if (i !== -1) toasts.splice(i, 1)
    }, duration)
  }

  function remove(id: number) {
    const i = toasts.findIndex(t => t.id === id)
    if (i !== -1) toasts.splice(i, 1)
  }

  return { toasts, show, remove }
}
