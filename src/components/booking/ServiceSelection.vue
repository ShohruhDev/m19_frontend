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

    <div v-else class="pb-4">
      <div class="grid gap-3">
        <SelectableCard
          v-for="service in activeServices"
          :key="service.id"
          :is-selected="isServiceSelected(service)"
          @click="toggleService(service)"
          class="p-4 relative"
        >
          <!-- Discount badge -->
          <div
            v-if="service.discount && service.discount > 0"
            class="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full"
          >
            −{{ service.discount }}%
          </div>

          <div class="flex justify-between items-start gap-4" :class="{ 'pr-16': service.discount && service.discount > 0 }">
            <div class="flex-1 min-w-0">
              <h4 class="font-heading font-medium text-foreground mb-1 leading-snug">
                {{ service.title }}
              </h4>
              <div class="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                <span v-if="getServiceDuration(service)" class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatDuration(getServiceDuration(service)) }}
                </span>
              </div>
            </div>

            <div class="text-right shrink-0 flex flex-col items-end gap-2">
              <!-- Selection indicator -->
              <div
                class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200"
                :class="isServiceSelected(service) ? 'bg-primary border-primary' : 'border-muted-foreground/30'"
              >
                <Check v-if="isServiceSelected(service)" class="w-4 h-4 text-primary-foreground" />
              </div>

              <!-- Price -->
              <div v-if="service.price_min === service.price_max" class="font-bold text-primary text-base">
                {{ formatPrice(service.price_min) }}
              </div>
              <div v-else class="text-right">
                <div class="font-bold text-primary text-base">от {{ formatPrice(service.price_min) }}</div>
                <div class="text-xs text-muted-foreground">до {{ formatPrice(service.price_max) }}</div>
              </div>
            </div>
          </div>
        </SelectableCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useBookingFlow } from '@/composables'
import SelectableCard from '@/components/ui/SelectableCard.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-vue-next'
import type { AltegService } from '@/types'

const {
  services,
  selectedServices,
  isLoading,
  error,
  loadServices,
  toggleService,
} = useBookingFlow()

const activeServices = computed<AltegService[]>(() => {
  if (!services.value || services.value.length === 0) return []
  return services.value.filter(s => s.active !== 0)
})

const isServiceSelected = (service: AltegService) => {
  return selectedServices.value.some(s => s.id === service.id)
}

const getServiceDuration = (service: AltegService): number => {
  return service.staff?.[0]?.seance_length || 0
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
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

onMounted(() => {
  if (services.value.length === 0) {
    loadServices()
  }
})
</script>
