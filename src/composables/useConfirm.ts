import { ref } from 'vue'

interface ConfirmState {
  title: string
  message: string
  resolve: (v: boolean) => void
}

const state = ref<ConfirmState | null>(null)

export function useConfirm() {
  function confirm(title: string, message: string): Promise<boolean> {
    return new Promise(resolve => {
      state.value = { title, message, resolve }
    })
  }

  function answer(v: boolean) {
    state.value?.resolve(v)
    state.value = null
  }

  return { state, confirm, answer }
}
