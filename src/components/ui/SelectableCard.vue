<template>
  <div
    class="card-premium p-8 group cursor-pointer relative overflow-hidden"
    :class="{ 'border-gold-500 bg-dark-100': isSelected }"
    @click="handleClick"
  >
    <!-- Hover gradient overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-gold-500/0 via-gold-500/0 to-gold-500/0
             group-hover:from-gold-500/10 group-hover:via-gold-500/5 group-hover:to-gold-500/10
             transition-all duration-500 pointer-events-none"
    ></div>

    <div class="relative z-10">
      <slot></slot>
    </div>

    <!-- Selected indicator -->
    <div
      v-if="isSelected"
      class="absolute top-4 right-4 w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center"
    >
      <svg class="w-5 h-5 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <!-- Shimmer effect on hover -->
    <div
      class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
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
  </div>
</template>

<script setup lang="ts">
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

