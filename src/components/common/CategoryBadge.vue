<script setup lang="ts">
import type { Category } from '@/types'
import { CATEGORIES } from '@/utils/constants'

const props = defineProps<{ category: Category }>()
const meta = CATEGORIES[props.category]
</script>

<template>
  <span class="badge" :style="{ background: meta.color + '22', color: meta.color }">
    {{ meta.emoji }} {{ meta.label }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  white-space: nowrap;
}
</style>
