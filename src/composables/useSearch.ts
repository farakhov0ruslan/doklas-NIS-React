import { ref, watch } from 'vue'

export function useSearch(delayMs = 300) {
  const query = ref('')
  const debouncedQuery = ref('')
  let timer: ReturnType<typeof setTimeout> | null = null

  watch(query, val => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      debouncedQuery.value = val.trim().toLowerCase()
    }, delayMs)
  })

  function clear() {
    query.value = ''
    debouncedQuery.value = ''
    if (timer) clearTimeout(timer)
  }

  return { query, debouncedQuery, clear }
}
