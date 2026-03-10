<script setup lang="ts">
import type { TravelStyle } from '@/types'
import { TRAVEL_STYLE_LABELS } from '@/utils/constants'

const props = defineProps<{ modelValue: TravelStyle[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: TravelStyle[]] }>()

function toggle(key: TravelStyle) {
  const current = props.modelValue
  const next = current.includes(key) ? current.filter(s => s !== key) : [...current, key]
  emit('update:modelValue', next)
}

const styles: { key: TravelStyle; image: string }[] = [
  { key: 'cultural',  image: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=400' },
  { key: 'party',     image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400' },
  { key: 'nature',    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400' },
  { key: 'gastro',    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400' },
  { key: 'adventure', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400' },
  { key: 'mixed',     image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400' },
]
</script>

<template>
  <div class="grid">
    <button
      v-for="s in styles"
      :key="s.key"
      class="style-card"
      :class="{ 'style-card--active': modelValue.includes(s.key) }"
      type="button"
      @click="toggle(s.key)"
    >
      <img :src="s.image" :alt="TRAVEL_STYLE_LABELS[s.key]" class="style-card__img" />
      <span class="style-card__label">{{ TRAVEL_STYLE_LABELS[s.key] }}</span>
    </button>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
}

.style-card {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 3px solid transparent;
  cursor: pointer;
  transition: border-color var(--transition), transform var(--transition);
  aspect-ratio: 4 / 3;
  padding: 0;
}

.style-card:hover {
  transform: scale(1.02);
}

.style-card--active {
  border-color: var(--color-primary);
}

.style-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.style-card__label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 8px;
  background: linear-gradient(transparent, rgba(0,0,0,0.65));
  color: #fff;
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-align: center;
}
</style>
