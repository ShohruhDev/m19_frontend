<template>
  <Skeleton :class="['bg-muted', skeletonClasses]" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  type?: 'text' | 'avatar' | 'card' | 'image'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
})

const skeletonClasses = computed(() => {
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

