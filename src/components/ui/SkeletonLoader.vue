<template>
  <div class="skeleton-loader" :class="[type, sizeClass]">
    <div class="shimmer"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'text' | 'avatar' | 'card' | 'image'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
})

const sizeClass = computed(() => {
  const sizes = {
    text: {
      sm: 'h-4 w-32',
      md: 'h-5 w-48',
      lg: 'h-6 w-64',
    },
    avatar: {
      sm: 'h-10 w-10 rounded-full',
      md: 'h-16 w-16 rounded-full',
      lg: 'h-24 w-24 rounded-full',
    },
    card: {
      sm: 'h-32 w-full rounded-lg',
      md: 'h-48 w-full rounded-lg',
      lg: 'h-64 w-full rounded-lg',
    },
    image: {
      sm: 'h-40 w-full rounded',
      md: 'h-60 w-full rounded',
      lg: 'h-80 w-full rounded',
    },
  }
  return sizes[props.type][props.size]
})
</script>

<style scoped>
.skeleton-loader {
  position: relative;
  overflow: hidden;
  background-color: var(--color-dark-50);
}

.shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(212, 175, 55, 0.1) 50%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>

