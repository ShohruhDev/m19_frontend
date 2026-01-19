<template>
  <div class="flex items-center justify-between py-4 px-6 bg-dark-50 border border-white/10">
    <div class="flex items-center space-x-4">
      <div
        :class="[
          'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300',
          isComplete ? 'bg-gold-500 border-gold-500' : 'border-white/30',
          isActive ? 'border-gold-500 scale-110' : '',
        ]"
      >
        <svg
          v-if="isComplete"
          class="w-5 h-5 text-dark"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span v-else :class="['text-sm font-bold', isActive ? 'text-gold-500' : 'text-white/50']">
          {{ number }}
        </span>
      </div>

      <div>
        <h3
          :class="[
            'font-heading font-semibold',
            isActive ? 'text-gold-500' : 'text-white/50',
          ]"
        >
          {{ title }}
        </h3>
        <p v-if="subtitle && isActive" class="text-sm text-white/50">{{ subtitle }}</p>
      </div>
    </div>

    <div
      v-if="!isFirst"
      class="absolute left-10 -top-4 w-0.5 h-4 bg-white/20"
      :class="{ 'bg-gold-500': isComplete }"
    ></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  number: number
  title: string
  subtitle?: string
  isActive: boolean
  isComplete: boolean
  isFirst?: boolean
}

withDefaults(defineProps<Props>(), {
  isFirst: false,
})
</script>

