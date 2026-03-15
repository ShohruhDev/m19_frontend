<template>
  <div class="services-page min-h-screen bg-dark">
    <AppHeader />

    <main class="pt-32 pb-20">
      <div class="container-custom">
        <div class="text-center mb-16">
          <h1 class="text-display-md font-heading font-bold text-gradient mb-4">
            Услуги и цены
          </h1>
          <p class="text-xl text-white/70 max-w-2xl mx-auto">
            Полный спектр барбер-услуг для современного мужчины
          </p>
        </div>

        <div v-if="isLoading" class="flex justify-center py-20">
           <div class="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else-if="error" class="text-center py-20 text-red-500">
           {{ error }}
        </div>

        <div v-else class="space-y-6">
          <Collapsible v-model:open="isOpen" class="group/collapsible">
            <CollapsibleTrigger class="w-full flex items-center justify-between p-6 bg-dark-50 border border-white/10 rounded-lg hover:border-gold-500/50 hover:bg-white/5 transition-all duration-300 cursor-pointer text-left">
              <h2 class="text-2xl font-heading font-bold text-white group-hover/collapsible:text-gold-500 transition-colors">
                Услуги
              </h2>
              <ChevronDown
                class="w-6 h-6 text-gold-500 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-180"
              />
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div class="pt-4 grid gap-4">
                <div
                  v-for="service in allServices"
                  :key="service.id"
                  class="card-premium p-4 md:p-6 flex flex-col md:flex-row gap-6 group hover:translate-x-1 transition-transform"
                >
                  <!-- Service Image -->
                  <div class="w-full md:w-32 h-32 md:h-24 shrink-0 rounded-lg overflow-hidden bg-dark-100 border border-white/10 relative">
                     <img
                       v-if="service.image_url"
                       :src="service.image_url"
                       :alt="service.title"
                       class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                       @error="(e: any) => e.target.style.display = 'none'"
                     />
                     <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-100 to-dark-200">
                        <Scissors class="w-8 h-8 text-white/20" />
                     </div>
                  </div>

                  <!-- Content -->
                  <div class="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div class="flex-1">
                      <h3 class="text-xl font-heading font-semibold text-white mb-2 group-hover:text-gold-500 transition-colors">
                        {{ service.title }}
                      </h3>
                      <p class="text-white/70 text-sm mb-3 max-w-xl">{{ service.description }}</p>
                      <div class="flex items-center gap-4 text-sm text-white/50">
                        <span v-if="getServiceDuration(service)" class="flex items-center gap-1">
                          <Clock class="w-4 h-4" />
                          {{ formatDuration(getServiceDuration(service)) }}
                        </span>
                        <span v-if="service.discount && service.discount > 0" class="text-gold-500 font-semibold">
                          −{{ service.discount }}% скидка
                        </span>
                      </div>
                    </div>

                    <div class="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 mt-2 md:mt-0">
                      <div>
                        <div class="text-2xl font-bold text-gold-500 whitespace-nowrap">
                          {{ service.price_min === service.price_max ? formatPrice(service.price_min) : 'от ' + formatPrice(service.price_min) }}
                        </div>
                        <div v-if="service.price_min !== service.price_max" class="text-xs text-white/40 text-right">
                          до {{ formatPrice(service.price_max) }}
                        </div>
                      </div>
                      <BaseButton
                        variant="secondary"
                        size="sm"
                        class="w-full md:w-auto"
                        @click="bookService(service)"
                      >
                        Записаться
                      </BaseButton>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </main>

    <BookingFlowModal :is-open="isBookingOpen" @close="isBookingOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBookingFlow } from '@/composables'
import AppHeader from '@/components/common/AppHeader.vue'
import BookingFlowModal from '@/components/booking/BookingFlow.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown, Clock, Scissors } from 'lucide-vue-next'
import { altegService } from '@/services'
import type { AltegService } from '@/types'

const isBookingOpen = ref(false)
const isLoading = ref(true)
const error = ref<string | null>(null)
const allServices = ref<AltegService[]>([])
const isOpen = ref(true)

const fetchServices = async () => {
  isLoading.value = true
  error.value = null
  try {
    const services = await altegService.fetchServices()
    allServices.value = services
      .filter(s => s.active !== 0)
      .map(s => ({
        ...s,
        image_url: s.image_group?.images?.basic?.path || s.image_url || undefined
      }))
  } catch (err) {
    console.error('Failed to load services:', err)
    error.value = 'Не удалось загрузить список услуг'
  } finally {
    isLoading.value = false
  }
}

const { initializeBooking } = useBookingFlow()

const bookService = (service: AltegService) => {
  initializeBooking({ service })
  isBookingOpen.value = true
}

// Helper to get service duration from staff array
const getServiceDuration = (service: AltegService): number => {
  // seance_length is in seconds, get from first staff member
  return service.staff?.[0]?.seance_length || 0
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

onMounted(() => {
  fetchServices()
})
</script>


