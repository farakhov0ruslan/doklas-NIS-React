<template>
  <div class="skeleton">
    <div class="skeleton__img" />
    <div class="skeleton__body">
      <div class="skeleton__badge" />
      <div class="skeleton__title" />
      <div class="skeleton__line" />
      <div class="skeleton__line skeleton__line--short" />
      <div class="skeleton__meta" />
      <div class="skeleton__btn" />
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.skeleton {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.skeleton__img {
  aspect-ratio: 4 / 3;
  background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
}

.skeleton__body {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.skeleton__badge,
.skeleton__title,
.skeleton__line,
.skeleton__meta,
.skeleton__btn {
  border-radius: var(--radius-sm);
  background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
}

.skeleton__badge  { height: 20px; width: 80px; border-radius: var(--radius-full); }
.skeleton__title  { height: 18px; width: 75%; }
.skeleton__line   { height: 13px; width: 100%; }
.skeleton__line--short { width: 60%; }
.skeleton__meta   { height: 13px; width: 85%; margin-top: 4px; }
.skeleton__btn    { height: 34px; width: 100%; margin-top: 4px; border-radius: var(--radius-sm); }
</style>
