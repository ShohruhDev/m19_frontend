<template>
  <div class="home-page">
    <AppHeader />

    <main>
      <HeroSection />



      <!-- Services Carousel Section -->
      <section id="services" class="section-padding bg-dark">
        <div class="container-custom">
          <!-- Header -->
          <div class="flex items-end justify-between mb-10">
            <div>
              <h2 class="text-display-md font-heading font-bold text-white mb-2">Наши услуги</h2>
              <p class="text-white/50 text-base">Профессиональный уход и стиль для современного мужчины</p>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-6">
              <button class="services-prev w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center hover:border-gold-500 hover:text-gold-500 transition-all duration-200">
                <ChevronLeft class="w-4 h-4" />
              </button>
              <button class="services-next w-10 h-10 rounded-full border border-white/20 text-white flex items-center justify-center hover:border-gold-500 hover:text-gold-500 transition-all duration-200">
                <ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="isLoading" class="flex justify-center py-12">
            <div class="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
          </div>

          <!-- Swiper -->
          <Swiper
            v-else
            :modules="swiperModules"
            :space-between="20"
            :loop="true"
            :centered-slides="true"
            :autoplay="{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }"
            :navigation="{ prevEl: '.services-prev', nextEl: '.services-next' }"
            :grab-cursor="true"
            :breakpoints="{
              0:    { slidesPerView: 1.15 },
              480:  { slidesPerView: 2 },
              768:  { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }"
          >
            <SwiperSlide v-for="service in allServices" :key="service.id">
              <div class="card-premium overflow-hidden group flex flex-col cursor-pointer h-full">
                <!-- Image -->
                <div class="relative w-full overflow-hidden" style="aspect-ratio: 3/2;">
                  <img
                    v-if="service.image_url"
                    :src="service.image_url"
                    :alt="service.title"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    @error="(e: any) => e.target.style.display = 'none'"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-100 to-dark-200">
                    <Scissors class="w-10 h-10 text-white/10" />
                  </div>
                  <div class="absolute inset-0 bg-gradient-to-t from-dark-50/70 via-transparent to-transparent"></div>
                  <div v-if="service.discount && service.discount > 0" class="absolute top-3 left-3 bg-gold-500 text-dark text-xs font-bold px-2.5 py-1 rounded-full">
                    −{{ service.discount }}%
                  </div>
                </div>

                <!-- Content -->
                <div class="p-4 flex flex-col flex-1 gap-3">
                  <div class="flex-1">
                    <h3 class="text-sm font-heading font-semibold text-white group-hover:text-gold-500 transition-colors leading-snug mb-1.5">
                      {{ service.title }}
                    </h3>
                    <div v-if="getServiceDuration(service)" class="flex items-center gap-1 text-xs text-white/35">
                      <Clock class="w-3 h-3" />
                      {{ formatDuration(getServiceDuration(service)) }}
                    </div>
                  </div>

                  <div class="flex items-end justify-between gap-2 pt-2.5 border-t border-white/10">
                    <div>
                      <div class="text-base font-bold text-gold-500 leading-none">
                        {{ service.price_min === service.price_max ? formatPrice(service.price_min) : 'от ' + formatPrice(service.price_min) }}
                      </div>
                      <div v-if="service.price_min !== service.price_max" class="text-xs text-white/30 mt-0.5">
                        до {{ formatPrice(service.price_max) }}
                      </div>
                    </div>
                    <button
                      class="shrink-0 text-xs font-medium px-3 py-1.5 rounded-md border border-gold-500/50 text-gold-500 hover:bg-gold-500 hover:text-dark transition-all duration-200"
                      @click.stop="bookService(service)"
                    >
                      Записаться
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
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
import { onMounted, onUnmounted, ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Navigation } from 'swiper/modules'
import 'swiper/css'
import { useBookingFlow } from '@/composables'
import { useAppStore } from '@/stores'
import AppHeader from '@/components/common/AppHeader.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import ReviewsSection from '@/components/sections/ReviewsSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import StaffDetailsModal from '@/components/staff/StaffDetailsModal.vue'
import BookingFlowModal from '@/components/booking/BookingFlow.vue'
import { ChevronLeft, ChevronRight, Clock, Scissors } from 'lucide-vue-next'

import { altegService } from '@/services'
import type { AltegStaff, AltegService } from '@/types'

const appStore = useAppStore()
const { initializeBooking } = useBookingFlow()

const isBookingOpen = ref(false)
const isLoading = ref(true)
const allServices = ref<AltegService[]>([])
const staffMembers = ref<any[]>([])

const swiperModules = [Autoplay, Navigation]
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

const fetchServices = async () => {
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


import { useHead } from '@unhead/vue'

// SEO
useHead({
  title: 'M19 Barbershop - Премиальный барбершоп в Ташкенте',
  meta: [
    {
      name: 'description',
      content: 'Стильные мужские стрижки, оформление бороды и уход за лицом. Лучшие мастера, премиальная косметика и атмосфера настоящего мужского клуба.'
    },
    {
      name: 'keywords',
      content: 'барбершоп ташкент, мужская стрижка, стрижка бороды, барбер, мужской салон, m19'
    },
    { property: 'og:title', content: 'M19 Barbershop - Премиальный стиль' },
    { property: 'og:description', content: 'Стильные стрижки и уход за бородой в центре Ташкента.' },
    { property: 'og:image', content: 'https://m19barbershop.uz/barbershop-1.png' },
    { property: 'og:url', content: 'https://m19barbershop.uz' },
    { property: 'og:type', content: 'website' }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'HairSalon',
        name: 'M19 Barbershop',
        image: 'https://m19barbershop.uz/barbershop-1.png',
        '@id': 'https://m19barbershop.uz',
        url: 'https://m19barbershop.uz',
        telephone: '+998991234567', // Замените на реальный
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Улица, дом', // Замените на реальный
          addressLocality: 'Ташкент',
          addressCountry: 'UZ'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 41.2995, // Примерные координаты
          longitude: 69.2401
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '10:00',
            closes: '22:00'
          }
        ],
        priceRange: '$$'
      })
    }
  ]
})

onMounted(async () => {
  isLoading.value = true
  await Promise.all([
    fetchServices(),
    fetchStaff()
  ])
  isLoading.value = false
})

onUnmounted(() => {})
</script>

<style scoped>
/* Make all Swiper slides equal height (stretch to tallest card) */
:deep(.swiper-wrapper) {
  align-items: stretch;
}
:deep(.swiper-slide) {
  height: auto;
}
</style>

