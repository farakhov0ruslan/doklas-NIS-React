<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ rating: number; max?: number }>()
const max = computed(() => props.max ?? 5)

type StarType = 'full' | 'half' | 'empty'

const stars = computed<StarType[]>(() => {
  const result: StarType[] = []
  for (let i = 1; i <= max.value; i++) {
    if (props.rating >= i) result.push('full')
    else if (props.rating >= i - 0.5) result.push('half')
    else result.push('empty')
  }
  return result
})
</script>

<template>
  <span class="stars" :aria-label="`Рейтинг ${rating} из ${max}`" role="img">
    <span
      v-for="(type, i) in stars"
      :key="i"
      class="star"
      :class="`star--${type}`"
    >★</span>
    <span class="stars__value">{{ rating }}</span>
  </span>
</template>

<style scoped>
.stars {
  display: inline-flex;
  align-items: center;
  gap: 1px;
}

.star {
  font-size: 14px;
  line-height: 1;
}

.star--full {
  color: #F5A623;
}

.star--half {
  background: linear-gradient(to right, #F5A623 50%, var(--color-border) 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.star--empty {
  color: var(--color-border);
}

.stars__value {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  margin-left: 3px;
}
</style>
