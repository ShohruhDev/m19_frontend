<template>
  <div class="home-page">
    <AppHeader />

    <main>
      <HeroSection />

      <!-- Features Section -->
      <section class="section-padding bg-dark-50">
        <div class="container-custom">
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="(feature, index) in FEATURES"
              :key="index"
              class="card-premium p-6 text-center group hover:scale-105 transition-transform duration-300"
            >
              <div class="text-5xl mb-4">{{ feature.icon }}</div>
              <h3 class="text-xl font-heading font-bold text-white mb-2">
                {{ feature.title }}
              </h3>
              <p class="text-white/70 text-sm">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </section>

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

          <div v-if="bookingStore.isLoading && !bookingStore.services.length" class="text-center py-12">
             <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p class="text-white/50">Загрузка услуг...</p>
          </div>

          <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="service in featuredServices"
              :key="service.id"
              class="card-premium p-8 group flex flex-col"
            >
              <div class="text-4xl mb-4 text-primary">
                 <!-- Generic Icon -->
                 <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                 </svg>
              </div>
              <h3 class="text-2xl font-heading font-bold text-white mb-3">
                {{ service.title }}
              </h3>
              <p v-if="service.description" class="text-white/70 mb-6 line-clamp-2 flex-grow">
                {{ service.description }}
              </p>
              <div class="flex items-end justify-between mt-auto">
                <span class="text-2xl font-bold text-primary">{{ formatPrice(service.price_min) }}</span>
                <span class="text-white/50 text-sm">{{ formatDuration(service.duration) }}</span>
              </div>
            </div>
          </div>

          <div class="text-center mt-12">
            <BaseButton variant="secondary" size="lg" @click="$router.push('/services')">
              Все услуги и цены
            </BaseButton>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="section-padding bg-premium-dark relative overflow-hidden">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute inset-0 bg-gradient-to-r from-gold-500 to-gold-700"></div>
        </div>

        <div class="container-custom relative z-10">
          <div class="max-w-3xl mx-auto text-center space-y-8">
            <h2 class="text-display-md font-heading font-bold text-white">
              Готовы к переменам?
            </h2>
            <p class="text-xl text-white/70">
              Запишитесь онлайн и получите скидку 10% на первое посещение
            </p>
            <BaseButton
              variant="primary"
              size="lg"
              @click="appStore.openBookingModal()"
            >
              Записаться сейчас
            </BaseButton>
          </div>
        </div>
      </section>

      <!-- Staff Preview -->
      <section class="section-padding bg-dark">
        <div class="container-custom">
          <div class="text-center mb-16">
            <h2 class="text-display-md font-heading font-bold text-white mb-4">
              Наши мастера
            </h2>
            <p class="text-xl text-white/70 max-w-2xl mx-auto">
              Профессионалы своего дела с многолетним опытом
            </p>
          </div>

          <div v-if="bookingStore.isLoading && !bookingStore.staff.length" class="text-center py-12">
             <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
             <p class="text-white/50">Загрузка мастеров...</p>
          </div>

          <div v-else class="grid md:grid-cols-3 gap-8">
            <div
              v-for="master in featuredMasters"
              :key="master.id"
              class="card-premium p-0 overflow-hidden group"
            >
              <div class="aspect-square bg-dark-50 relative overflow-hidden">
                <img 
                  v-if="master.avatar_url || master.avatar || master.avatar_big"
                  :src="master.avatar_url || master.avatar_big || master.avatar"
                  :alt="master.name"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground bg-secondary">
                  {{ master.name.charAt(0) }}
                </div>
                <!-- Overlay -->
                <div
                  class="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent
                         opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                ></div>
              </div>
              <div class="p-6">
                <h3 class="text-xl font-heading font-bold text-white mb-2">
                  {{ master.name }}
                </h3>
                <p class="text-primary mb-4 text-sm">{{ master.specialization || 'Барбер' }}</p>
                <div class="flex items-center gap-2 text-sm text-white/50">
                  <span class="flex items-center gap-1 text-yellow-500" v-if="master.rating">
                    <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {{ master.rating }}
                  </span>
                  <span v-if="master.experience_years">{{ master.experience_years }} лет опыта</span>
                </div>
              </div>
            </div>
          </div>

          <div class="text-center mt-12">
            <BaseButton variant="secondary" size="lg" @click="$router.push('/staff')">
              Все мастера
            </BaseButton>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <ContactSection />

      <!-- Footer -->
      <footer class="bg-dark-100 border-t border-white/10 py-12">
        <div class="container-custom">
          <div class="grid md:grid-cols-4 gap-8">
            <div class="space-y-4">
              <!-- Logo in Footer -->
              <div class="flex items-center gap-3">
                <img src="@/assets/logo.png" alt="M19 Logo" class="h-12 w-auto object-contain" />
              </div>
              
              <h3 class="text-2xl font-heading font-bold text-white">{{ BARBERSHOP_INFO.shortName }}</h3>
              <p class="text-white/50 text-sm">
                {{ BARBERSHOP_INFO.tagline }}
              </p>
              <div class="flex gap-4 mt-4">
                <a :href="BARBERSHOP_INFO.social.instagram" target="_blank" class="text-white/50 hover:text-primary transition-colors">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 class="font-heading font-semibold text-white mb-4">Навигация</h4>
              <ul class="space-y-2 text-sm text-white/50">
                <li><RouterLink to="/" class="hover:text-primary transition-colors">Главная</RouterLink></li>
                <li><RouterLink to="/services" class="hover:text-primary transition-colors">Услуги</RouterLink></li>
                <li><RouterLink to="/staff" class="hover:text-primary transition-colors">Мастера</RouterLink></li>
                <li><RouterLink to="/reviews" class="hover:text-primary transition-colors">Отзывы</RouterLink></li>
              </ul>
            </div>
            <div>
              <h4 class="font-heading font-semibold text-white mb-4">Контакты</h4>
              <ul class="space-y-2 text-sm text-white/50">
                <li>
                  <a :href="BARBERSHOP_INFO.contact.phoneLink" class="hover:text-primary transition-colors">
                    {{ BARBERSHOP_INFO.contact.phoneDisplay }}
                  </a>
                </li>
                <li>{{ BARBERSHOP_INFO.contact.email }}</li>
                <li>{{ BARBERSHOP_INFO.address.street }}</li>
                <li>{{ BARBERSHOP_INFO.address.city }}, {{ BARBERSHOP_INFO.address.metro }}</li>
              </ul>
            </div>
            <div>
              <h4 class="font-heading font-semibold text-white mb-4">Режим работы</h4>
              <ul class="space-y-2 text-sm text-white/50">
                <li>{{ BARBERSHOP_INFO.workingHours.display }}</li>
              </ul>
            </div>
          </div>
          <div class="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/30">
            © 2026 {{ BARBERSHOP_INFO.name }}. Все права защищены.
          </div>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAppStore, useBookingStore } from '@/stores'
import AppHeader from '@/components/common/AppHeader.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { BARBERSHOP_INFO, FEATURES } from '@/data/m19-data'
import { altegService } from '@/services'
import type { AltegStaff } from '@/types'

const appStore = useAppStore()
const bookingStore = useBookingStore()

const localStaff = ref<AltegStaff[]>([])
const isMastersLoading = ref(false)

// Computed for Services
const featuredServices = computed(() => {
  // Sort by popularity if available, or just take first 6
  return bookingStore.services.slice(0, 6)
})

// Computed for Masters
const featuredMasters = computed(() => {
  return localStaff.value.slice(0, 3)
})

// Formatting Helpers
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

onMounted(async () => {
  // Load Services
  if (bookingStore.services.length === 0) {
    await bookingStore.loadServices()
  }

  // Load Masters for Landing Page
  // Try to fetch staff without service ID (if supported) or use the first service
  if (localStaff.value.length === 0) {
    isMastersLoading.value = true
    try {
      // Try fetching all staff using '0' or similar if API supports it, or just pass a service ID
      // If store services loaded, use first one
      let serviceId: string | number = 0
      if (bookingStore.services.length > 0) {
        serviceId = bookingStore.services[0].id
      }
      
      const rawStaff = await altegService.fetchStaff(serviceId)
      
      // Filter only Barbers and clean data if needed
      localStaff.value = rawStaff.filter(master => {
         const role = (master.specialization || 'Барбер').toLowerCase()
         return role.includes('barber') || role.includes('барбер')
      })

    } catch (error) {
      console.error('Failed to load landing page masters:', error)
    } finally {
      isMastersLoading.value = false
    }
  }
})
</script>

