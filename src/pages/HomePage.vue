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
            <h2 class="text-display-md font-heading font-bold text-gradient mb-4">
              Наши услуги
            </h2>
            <p class="text-xl text-white/70 max-w-2xl mx-auto">
              Профессиональный уход и стиль для современного мужчины
            </p>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="(service, index) in featuredServices"
              :key="index"
              class="card-premium p-8 group"
            >
              <div class="text-4xl mb-4">{{ service.icon }}</div>
              <h3 class="text-2xl font-heading font-bold text-white mb-3">
                {{ service.title }}
              </h3>
              <p class="text-white/70 mb-6">{{ service.description }}</p>
              <div class="flex items-center justify-between">
                <span class="text-2xl font-bold text-gold-500">{{ service.price }}</span>
                <span class="text-white/50">{{ service.duration }}</span>
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
            <h2 class="text-display-md font-heading font-bold text-gradient mb-4">
              Наши мастера
            </h2>
            <p class="text-xl text-white/70 max-w-2xl mx-auto">
              Профессионалы своего дела с многолетним опытом
            </p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <div
              v-for="(master, index) in featuredMasters"
              :key="index"
              class="card-premium p-0 overflow-hidden group"
            >
              <div class="aspect-square bg-dark-50 relative overflow-hidden">
                <div
                  class="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent
                         opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>
              </div>
              <div class="p-6">
                <h3 class="text-xl font-heading font-bold text-white mb-2">
                  {{ master.name }}
                </h3>
                <p class="text-gold-500 mb-4">{{ master.role }}</p>
                <div class="flex items-center gap-2 text-sm text-white/50">
                  <span class="flex items-center gap-1">
                    <svg class="w-4 h-4 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {{ master.rating }}
                  </span>
                  <span>{{ master.experience }} лет опыта</span>
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
            <div>
              <h3 class="text-2xl font-heading font-bold text-gradient mb-4">{{ BARBERSHOP_INFO.shortName }}</h3>
              <p class="text-white/50 text-sm">
                {{ BARBERSHOP_INFO.tagline }}
              </p>
              <div class="flex gap-4 mt-4">
                <a :href="BARBERSHOP_INFO.social.instagram" target="_blank" class="text-white/50 hover:text-gold-500 transition-colors">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 class="font-heading font-semibold text-white mb-4">Навигация</h4>
              <ul class="space-y-2 text-sm text-white/50">
                <li><RouterLink to="/" class="hover:text-gold-500 transition-colors">Главная</RouterLink></li>
                <li><RouterLink to="/services" class="hover:text-gold-500 transition-colors">Услуги</RouterLink></li>
                <li><RouterLink to="/staff" class="hover:text-gold-500 transition-colors">Мастера</RouterLink></li>
                <li><RouterLink to="/reviews" class="hover:text-gold-500 transition-colors">Отзывы</RouterLink></li>
              </ul>
            </div>
            <div>
              <h4 class="font-heading font-semibold text-white mb-4">Контакты</h4>
              <ul class="space-y-2 text-sm text-white/50">
                <li>
                  <a :href="BARBERSHOP_INFO.contact.phoneLink" class="hover:text-gold-500 transition-colors">
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

    <!-- Booking Modal -->
    <BookingFlow :is-open="appStore.isBookingModalOpen" @close="appStore.closeBookingModal()" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '@/stores'
import AppHeader from '@/components/common/AppHeader.vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import BookingFlow from '@/components/booking/BookingFlow.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { SERVICES, MASTERS, BARBERSHOP_INFO, FEATURES } from '@/data/m19-data'

const appStore = useAppStore()

// Топ-3 популярных услуги
const featuredServices = SERVICES.flatMap(cat => cat.items)
  .filter(service => service.popular)
  .slice(0, 3)
  .map(service => ({
    icon: service.icon,
    title: service.title,
    description: service.description,
    price: `${(service.price / 1000).toFixed(0)} 000 сўм`,
    duration: `${service.duration} мин`,
  }))

// Топ-3 мастера
const featuredMasters = MASTERS.slice(0, 3).map(master => ({
  name: master.name,
  role: master.role,
  rating: master.rating,
  experience: master.experience,
}))

onMounted(() => {
  // Scroll animations будут автоматически работать через GSAP ScrollTrigger
})
</script>

