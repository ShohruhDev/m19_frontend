<template>
  <Card
    class="group relative cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-xl hover:border-primary/50"
    :class="[
      isSelected ? 'border-primary bg-secondary shadow-lg shadow-primary/10' : 'bg-card border-border',
    ]"
    @click="handleClick"
  >
    <!-- Hover gradient overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0
             group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-primary/10
             transition-all duration-500 pointer-events-none"
    ></div>

    <div class="relative z-10 p-8">
      <slot></slot>
    </div>

    <!-- Selected indicator -->
    <div
      v-if="isSelected"
      class="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <!-- Shimmer effect on hover -->
    <div
      class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
      style="
        background: linear-gradient(
          90deg,
          transparent,
          rgba(212, 175, 55, 0.1),
          transparent
        );
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      "
    ></div>
  </Card>
</template>

<script setup lang="ts">
import { Card } from '@/components/ui/card'

interface Props {
  isSelected?: boolean
}

withDefaults(defineProps<Props>(), {
  isSelected: false,
})

const emit = defineEmits<{
  click: []
}>()

const handleClick = () => {
  emit('click')
}
</script>

<style scoped>
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>

