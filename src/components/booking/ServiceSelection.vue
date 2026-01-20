<template>
  <div class="space-y-4">
    <h2 class="text-2xl font-heading font-bold text-gold-500 mb-6">Выберите услугу</h2>

    <SkeletonLoader v-if="isLoading" type="card" size="md" />
    <SkeletonLoader v-if="isLoading" type="card" size="md" />

    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-500">{{ error }}</p>
      <BaseButton class="mt-4" @click="loadServices">Попробовать снова</BaseButton>
    </div>

    <div v-else class="grid gap-4">
      <SelectableCard
        v-for="service in services"
        :key="service.id"
        :is-selected="selectedService?.id === service.id"
        @click="selectService(service)"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="text-xl font-heading font-semibold text-white mb-2">
              {{ service.title }}
            </h3>
            <p v-if="service.description" class="text-white/70 text-sm mb-4">
              {{ service.description }}
            </p>
            <div class="flex items-center gap-4 text-sm text-white/50">
              <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ service.duration }} мин
              </span>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-gold-500">
              {{ formatPrice(service.price_min) }}
            </div>
            <div v-if="service.price_max && service.price_max !== service.price_min" class="text-sm text-white/50">
              до {{ formatPrice(service.price_max) }}
            </div>
          </div>
        </div>
      </SelectableCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useBookingFlow } from '@/composables'
import BaseButton from '@/components/ui/BaseButton.vue'
import SelectableCard from '@/components/ui/SelectableCard.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
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
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

onMounted(() => {
  if (services.value.length === 0) {
    loadServices()
  }
})
</script>

