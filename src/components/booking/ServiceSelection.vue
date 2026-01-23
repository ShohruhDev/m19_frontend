<template>
  <div class="space-y-4">
    <h2 class="text-xl font-heading font-semibold text-primary mb-4">Выберите услугу</h2>

    <div v-if="isLoading">
      <div class="grid gap-4">
        <Skeleton class="h-24 w-full" />
        <Skeleton class="h-24 w-full" />
        <Skeleton class="h-24 w-full" />
      </div>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-destructive">{{ error }}</p>
      <Button variant="outline" class="mt-4" @click="loadServices">Попробовать снова</Button>
    </div>

    <ScrollArea v-else class="h-[400px] pr-4">
      <div class="grid gap-3">
        <SelectableCard
          v-for="service in services"
          :key="service.id"
          :is-selected="selectedService?.id === service.id"
          @click="selectService(service)"
          class="p-4"
        >
          <div class="flex justify-between items-start gap-4">
            <div class="flex-1 min-w-0">
              <h3 class="font-heading font-medium text-foreground mb-1 truncate">
                {{ service.title }}
              </h3>
              <p v-if="service.description" class="text-muted-foreground text-sm mb-2 line-clamp-2">
                {{ service.description }}
              </p>
              <div class="flex items-center gap-3 text-xs text-muted-foreground">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatDuration(service.duration) }}
                </span>
              </div>
            </div>
            
            <div class="text-right shrink-0">
              <div class="font-bold text-primary text-lg">
                {{ formatPrice(service.price_min) }}
              </div>
              <div v-if="service.price_max && service.price_max !== service.price_min" class="text-xs text-muted-foreground">
                до {{ formatPrice(service.price_max) }}
              </div>
            </div>
          </div>
        </SelectableCard>
      </div>
    </ScrollArea>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useBookingFlow } from '@/composables'
import SelectableCard from '@/components/ui/SelectableCard.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { AltegService } from '@/types'

const {
  services,
  selectedService,
  isLoading,
  error,
  loadServices,
  selectService: selectServiceAction,
} = useBookingFlow()

const selectService = (service: AltegService) => {
  selectServiceAction(service)
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
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

onMounted(() => {
  if (services.value.length === 0) {
    loadServices()
  }
})
</script>

