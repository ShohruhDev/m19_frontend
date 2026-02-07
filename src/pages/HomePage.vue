<template>
  <div class="home-page">
    <AppHeader />

    <main>
      <HeroSection />



      <!-- Services Preview Section -->
      <section id="services" class="section-padding bg-dark">
        <div class="container-custom">
          <div class="text-center mb-16" data-scroll>
            <h2 class="text-display-md font-heading font-bold text-white mb-4">
              Наши услуги
            </h2>
            <p class="text-xl text-white/70 max-w-2xl mx-auto">
              Профессиональный уход и стиль для современного мужчины
            </p>
          </div>

          <div v-if="isLoading" class="flex justify-center py-12">
             <div class="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
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
                            {{ formatDuration(getServiceDuration(service)) }}
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
      </section>



      <!-- Staff Preview -->
      <section id="masters" class="section-padding bg-dark">
        <div class="container-custom">
          <div class="text-center mb-16">
            <h2 class="text-display-md font-heading font-bold text-white mb-4">
              Наши мастера
            </h2>
            <p class="text-xl text-white/70 max-w-2xl mx-auto">
              Профессионалы своего дела с многолетним опытом
            </p>
          </div>

          <div v-if="isLoading" class="flex justify-center py-12">
             <div class="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p class="text-white/50">Загрузка мастеров...</p>
          </div>

          <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              v-for="(master, index) in staffMembers"
              :key="index"
              class="card-premium p-0 overflow-hidden group cursor-pointer"
              @click="openStaffModal(master)"
            >
              <!-- Avatar -->
              <div class="aspect-square bg-dark-50 relative overflow-hidden">
                <div
                  class="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent
                         opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
                ></div>
                
                <!-- Real Image -->
                <img 
                  v-if="master.avatar" 
                  :src="master.avatar" 
                  :alt="master.name"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                <!-- Fallback Initials -->
                <div v-else class="absolute inset-0 flex items-center justify-center text-6xl font-bold text-gold-500/20">
                  {{ master.name.charAt(0) }}
                </div>
              </div>

              <!-- Info -->
              <div class="p-6 space-y-4">
                <div>
                  <h3 class="text-2xl font-heading font-bold text-white mb-1">
                    {{ master.name }}
                  </h3>
                  <p class="text-gold-500 font-medium">{{ master.role }}</p>
                </div>

                <p class="text-white/70 text-sm line-clamp-2">{{ master.description }}</p>

                <!-- Stats -->
                <div class="flex items-center gap-4 text-sm text-white/50 pt-4 border-t border-white/10">
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {{ master.rating }}
                  </span>
                  <span>{{ master.reviews }} отзывов</span>
                </div>

                <BaseButton
                  variant="outline"
                  class="w-full hover:bg-gold-500 hover:text-black border-gold-500/50 text-gold-500 cursor-pointer"
                  @click.stop="bookWithMaster(master)"
                >
                  Записаться
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Reviews Section -->
      <ReviewsSection />

      <!-- Contact Section -->
      <ContactSection />
    </main>

    <BookingFlowModal :is-open="isBookingOpen" @close="isBookingOpen = false" />
    <StaffDetailsModal 
      :is-open="isStaffModalOpen" 
      :staff="selectedStaff" 
      @update:is-open="isStaffModalOpen = $event"
      @book="bookWithMaster"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useBookingFlow } from '@/composables'
import { useAppStore } from '@/stores'
import AppHeader from '@/components/common/AppHeader.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import ReviewsSection from '@/components/sections/ReviewsSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import StaffDetailsModal from '@/components/staff/StaffDetailsModal.vue'
import BookingFlowModal from '@/components/booking/BookingFlow.vue'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown, Clock, Scissors } from 'lucide-vue-next'

import { altegService } from '@/services'
import type { AltegStaff, AltegService, AltegServiceCategory } from '@/types'

const appStore = useAppStore()
const { initializeBooking } = useBookingFlow()

const isBookingOpen = ref(false)
const isLoading = ref(true)
const categories = ref<AltegServiceCategory[]>([])
const isOpenState = ref<boolean[]>([])
const staffMembers = ref<any[]>([])
const isStaffModalOpen = ref(false)
const selectedStaff = ref<any>(null)

// Helper to strip HTML tags
const stripHtml = (html: string) => {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

const bookService = (service: AltegService) => {
  initializeBooking({ service })
  appStore.openBookingModal()
}

const bookWithMaster = (master: any) => {
  initializeBooking({ staff: master })
  isStaffModalOpen.value = false
  appStore.openBookingModal()
}

const openStaffModal = (master: any) => {
  selectedStaff.value = master
  isStaffModalOpen.value = true
}

const fetchCategories = async () => {
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
          existingCategory.services.push(...services.map(s => ({
            ...s,
            image_url: s.image_group?.images?.basic?.path || s.image_url || undefined
          })))
        } else {
          mappedCategories.push({
            id,
            title,
            services: services.map(s => ({
              ...s,
              image_url: s.image_group?.images?.basic?.path || s.image_url || undefined
            }))
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
  }
}

const fetchStaff = async () => {
  try {
    const staff = await altegService.fetchStaff()
    
    // Filter and Transform API data
    staffMembers.value = staff
      .filter((master: AltegStaff) => {
        const role = (master.specialization || 'Барбер').toLowerCase()
        // Show only Barbers (exclude Reception, Admin, Accountant, etc.)
        return role.includes('barber') || role.includes('барбер')
      })
      .map((master: AltegStaff) => ({
        ...master,
        name: master.name,
        role: master.specialization || 'Барбер', 
        description: stripHtml(master.information || master.description || 'Профессионал своего дела'),
        rating: master.rating || 5.0,
        reviews: master.comments_count || 0,
        experience: master.experience_years || 0,
        specializations: master.services ? ['Универсал'] : (master.specialization ? [master.specialization] : ['Мужские стрижки']),
        avatar: master.avatar_big || master.avatar_url || master.avatar
      }))
  } catch (err) {
    console.error('Failed to load staff:', err)
  }
}

// Formatting Helpers
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

onMounted(async () => {
  isLoading.value = true
  await Promise.all([
    fetchCategories(),
    fetchStaff()
  ])
  isLoading.value = false
})
</script>

