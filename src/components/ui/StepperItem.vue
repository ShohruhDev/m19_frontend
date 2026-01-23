<template>
  <div class="flex items-center justify-between py-4 px-6 bg-card border border-border">
    <div class="flex items-center space-x-4">
      <div
        :class="[
          'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300',
          isComplete ? 'bg-primary border-primary' : 'border-muted-foreground/30',
          isActive ? 'border-primary scale-110' : '',
        ]"
      >
        <svg
          v-if="isComplete"
          class="w-5 h-5 text-primary-foreground"
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
        <span v-else :class="['text-sm font-bold', isActive ? 'text-primary' : 'text-muted-foreground']">
          {{ number }}
        </span>
      </div>

      <div>
        <h3
          :class="[
            'font-heading font-semibold',
            isActive ? 'text-primary' : 'text-muted-foreground',
          ]"
        >
          {{ title }}
        </h3>
        <p v-if="subtitle && isActive" class="text-sm text-muted-foreground">{{ subtitle }}</p>
      </div>
    </div>

    <div
      v-if="!isFirst"
      class="absolute left-10 -top-4 w-0.5 h-4 bg-border"
      :class="{ 'bg-primary': isComplete }"
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

