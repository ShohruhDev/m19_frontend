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
          <Collapsible
            v-for="(category, index) in categories"
            :key="category.id"
            v-model:open="isOpenState[index]"
            class="group/collapsible"
          >
            <CollapsibleTrigger class="w-full flex items-center justify-between p-6 bg-dark-50 border border-white/10 rounded-lg hover:border-gold-500/50 hover:bg-white/5 transition-all duration-300 cursor-pointer text-left">
              <h2 class="text-2xl font-heading font-bold text-white group-hover/collapsible:text-gold-500 transition-colors">
                {{ category.title }}
              </h2>
              <ChevronDown 
                class="w-6 h-6 text-gold-500 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-180" 
              />
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div class="pt-4 grid gap-4">
                <div
                  v-for="service in category.services"
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
                        <span class="flex items-center gap-1">
                          <Clock class="w-4 h-4" />
                          {{ formatDuration(service.duration) }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 mt-2 md:mt-0">
                      <div class="text-2xl font-bold text-gold-500 whitespace-nowrap">{{ formatPrice(service.price_min) }}</div>
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

    <BookingFlow :is-open="isBookingOpen" @close="isBookingOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import BookingFlow from '@/components/booking/BookingFlow.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown, Clock, Scissors } from 'lucide-vue-next'
import { altegService } from '@/services'
import type { AltegServiceCategory, AltegService } from '@/types'

const isBookingOpen = ref(false)
const isLoading = ref(true)
const error = ref<string | null>(null)
const categories = ref<AltegServiceCategory[]>([])
// State for collapsibles - array of booleans matching categories length
const isOpenState = ref<boolean[]>([])

const fetchCategories = async () => {
  isLoading.value = true
  error.value = null
  try {
    const allServices = await altegService.fetchServices()
    
    // Group services by category_id
    const groupedServices: Record<number, AltegService[]> = {}
    allServices.forEach(service => {
      const catId = service.category_id || 0
      if (!groupedServices[catId]) {
        groupedServices[catId] = []
      }
      groupedServices[catId].push(service)
    })

    // Map groups to categories with titles based on heuristics
    const mappedCategories: AltegServiceCategory[] = []
    
    const getCategoryTitle = (services: AltegService[]): string => {
      const hitSales = services.find(s => s.title.includes('ХИТ ПРОДАЖ'))
      if (hitSales) {
        if (hitSales.price_min > 480000) return 'Индивидуальное обслуживание в VIP Room'
        if (hitSales.price_min > 400000) return 'Профессиональный барбер в общем зале'
      }
      const haircut = services.find(s => s.title.includes('Классическая стрижка'))
      if (haircut) {
         if (haircut.price_min > 200000) return 'Индивидуальное обслуживание в VIP Room'
         return 'Профессиональный барбер в общем зале'
      }
      return 'Услуги'
    }

    Object.entries(groupedServices).forEach(([idStr, services]) => {
      const id = parseInt(idStr)
      if (services.length > 0) {
        const title = getCategoryTitle(services)
        
        // Check if category with this title already exists
        const existingCategory = mappedCategories.find(c => c.title === title)
        
        if (existingCategory) {
          // Merge services into existing category
          existingCategory.services.push(...services)
        } else {
          mappedCategories.push({
            id,
            title,
            services
          })
        }
      }
    })

    mappedCategories.sort((a, b) => {
      if (a.title.includes('VIP')) return 1
      if (b.title.includes('VIP')) return -1
      return 0
    })

    categories.value = mappedCategories
    // Close all categories by default
    isOpenState.value = mappedCategories.map(() => false)
    
  } catch (err) {
    console.error('Failed to load services:', err)
    error.value = 'Не удалось загрузить список услуг'
  } finally {
    isLoading.value = false
  }
}

const bookService = (_service: AltegService) => {
  isBookingOpen.value = true
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
  fetchCategories()
})
</script>


