import { computed } from 'vue'
import { usePlannerStore } from '@/stores/plannerStore'
import { formatDuration } from '@/utils/timeHelpers'

export function usePlanner() {
  const planner = usePlannerStore()

  const daysSummary = computed(() =>
    planner.days.map(d => ({
      ...d,
      formattedDuration: formatDuration(d.totalDuration),
    }))
  )

  return {
    planner,
    daysSummary,
  }
}
