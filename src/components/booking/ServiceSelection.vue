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

    <div 
      v-else 
      class="pb-4"
    >
      <div class="space-y-3">
        <Collapsible
          v-for="(category, index) in categories"
          :key="category.id"
          v-model:open="isOpenState[index]"
          class="group/collapsible"
        >
          <CollapsibleTrigger class="w-full flex items-center justify-between p-4 bg-secondary/50 border border-border rounded-lg hover:border-primary/50 hover:bg-secondary transition-all duration-300 cursor-pointer text-left">
            <h3 class="text-base font-heading font-semibold text-foreground group-hover/collapsible:text-primary transition-colors">
              {{ category.title }}
            </h3>
            <ChevronDown 
              class="w-5 h-5 text-primary transition-transform duration-300 group-data-[state=open]/collapsible:rotate-180" 
            />
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div class="pt-3 grid gap-2">
              <SelectableCard
                v-for="service in category.services"
                :key="service.id"
                :is-selected="isServiceSelected(service)"
                @click="toggleService(service)"
                class="p-4"
              >
                <div class="flex justify-between items-start gap-4" :class="{ 'pr-12': isServiceSelected(service) }">
                  <div class="flex-1 min-w-0">
                    <h4 class="font-heading font-medium text-foreground mb-1 truncate">
                      {{ service.title }}
                    </h4>
                    <p v-if="service.description" class="text-muted-foreground text-sm mb-2 line-clamp-2">
                      {{ service.description }}
                    </p>
                    <div class="flex items-center gap-3 text-xs text-muted-foreground">
                      <span class="flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ formatDuration(getServiceDuration(service)) }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="text-right shrink-0 flex flex-col items-end gap-2">
                    <!-- Checkbox for selection state -->
                    <div 
                      class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200"
                      :class="isServiceSelected(service) ? 'bg-primary border-primary' : 'border-muted-foreground/30'"
                    >
                      <Check v-if="isServiceSelected(service)" class="w-4 h-4 text-primary-foreground" />
                    </div>

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
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useBookingFlow } from '@/composables'
import SelectableCard from '@/components/ui/SelectableCard.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown, Check } from 'lucide-vue-next'
import type { AltegService, AltegServiceCategory } from '@/types'

const {
  services,
  selectedServices,
  isLoading,
  error,
  loadServices,
  toggleService,
} = useBookingFlow()

// State for collapsibles
const isOpenState = ref<boolean[]>([])

// Group services by category
const categories = computed(() => {
  if (!services.value || services.value.length === 0) return []

  // Group services by category_id
  const groupedServices: Record<number, AltegService[]> = {}
  services.value.forEach(service => {
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

  // Initialize collapsible states - all closed by default
  if (isOpenState.value.length !== mappedCategories.length) {
    isOpenState.value = mappedCategories.map(() => false)
  }

  return mappedCategories
})

const isServiceSelected = (service: AltegService) => {
  return selectedServices.value.some(s => s.id === service.id)
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
  if (services.value.length === 0) {
    loadServices()
  }
})
</script>

