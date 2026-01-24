<template>
  <div class="border-t border-border bg-card p-4">
    <div class="flex items-center justify-between gap-4">
      <!-- Info Section -->
      <div class="flex-1 min-w-0">
        <div v-if="selectedService" class="flex flex-col">
          <div class="text-sm text-foreground font-medium truncate">
            {{ selectedService.title }}
          </div>
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{{ formatPrice(selectedService.price_min) }}</span>
            <span class="w-1 h-1 rounded-full bg-border"></span>
            <span>{{ formatDuration(getServiceDuration(selectedService)) }}</span>
          </div>
        </div>
        <div v-else class="text-sm text-muted-foreground">
          Выберите услугу
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <Button
          v-if="canGoBack && currentStep !== 'confirmation'"
          variant="outline"
          size="sm"
          @click="$emit('back')"
          class="h-10 w-10 p-0 rounded-full shrink-0"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </Button>

        <Button
          v-if="currentStep !== 'confirmation'"
          :disabled="!canGoNext"
          size="sm"
          @click="$emit('next')"
          class="h-10 px-6 rounded-full font-medium"
        >
          {{ nextButtonText }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBookingStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { Button } from '@/components/ui/button'

defineEmits<{
  next: []
  back: []
}>()

const bookingStore = useBookingStore()
const { selectedService, currentStep, canGoNext, canGoBack } = storeToRefs(bookingStore)

const nextButtonText = computed(() => {
  if (!selectedService.value) return 'Далее'
  switch (currentStep.value) {
    case 'service': return 'Выбрать мастера'
    case 'staff': return 'Выбрать время'
    case 'time': return 'Подтвердить'
    default: return 'Далее'
  }
})

const getServiceDuration = (service: any) => {
  // seance_length is in seconds, get from first staff member
  return service?.staff?.[0]?.seance_length || 0
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('uz-UZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' сум'
}

const formatDuration = (seconds: number) => {
  if (!seconds) return ''
  const minutes = Math.floor(seconds / 60)
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`
  }
  return `${minutes} мин`
}
</script>
