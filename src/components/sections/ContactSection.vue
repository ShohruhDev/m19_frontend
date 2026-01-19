<template>
  <section class="section-padding bg-dark">
    <div class="container-custom">
      <div class="text-center mb-16">
        <h2 class="text-display-md font-heading font-bold text-gradient mb-4">
          Контакты и расположение
        </h2>
        <p class="text-xl text-white/70 max-w-2xl mx-auto">
          Мы находимся в центре Ташкента, рядом с метро «Айбек»
        </p>
      </div>

      <div class="grid lg:grid-cols-2 gap-12">
        <!-- Contact Info -->
        <div class="space-y-8">
          <!-- Address -->
          <div class="card-premium p-8">
            <div class="flex items-start gap-4">
              <div class="text-4xl">📍</div>
              <div>
                <h3 class="text-xl font-heading font-bold text-white mb-2">Адрес</h3>
                <p class="text-white/70">{{ BARBERSHOP_INFO.address.full }}</p>
                <p class="text-gold-500 text-sm mt-2">{{ BARBERSHOP_INFO.address.metro }}</p>
              </div>
            </div>
          </div>

          <!-- Phone -->
          <div class="card-premium p-8">
            <div class="flex items-start gap-4">
              <div class="text-4xl">📞</div>
              <div class="flex-1">
                <h3 class="text-xl font-heading font-bold text-white mb-2">Телефон</h3>
                <a
                  :href="BARBERSHOP_INFO.contact.phoneLink"
                  class="text-2xl font-bold text-gold-500 hover:text-gold-400 transition-colors"
                >
                  {{ BARBERSHOP_INFO.contact.phoneDisplay }}
                </a>
                <p class="text-white/50 text-sm mt-2">Звоните или пишите в WhatsApp</p>
              </div>
            </div>
          </div>

          <!-- Working Hours -->
          <div class="card-premium p-8">
            <div class="flex items-start gap-4">
              <div class="text-4xl">⏰</div>
              <div>
                <h3 class="text-xl font-heading font-bold text-white mb-2">Режим работы</h3>
                <p class="text-white/70">{{ BARBERSHOP_INFO.workingHours.display }}</p>
                <p class="text-gold-500 text-sm mt-2">Работаем без выходных</p>
              </div>
            </div>
          </div>

          <!-- Social -->
          <div class="card-premium p-8">
            <div class="flex items-start gap-4">
              <div class="text-4xl">💬</div>
              <div class="flex-1">
                <h3 class="text-xl font-heading font-bold text-white mb-4">Социальные сети</h3>
                <div class="flex gap-4">
                  <a
                    :href="BARBERSHOP_INFO.social.instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 text-gold-500 rounded-lg hover:bg-gold-500 hover:text-dark transition-all"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                    </svg>
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <BaseButton
            variant="primary"
            size="lg"
            class="w-full"
            @click="openBooking"
          >
            Записаться онлайн
          </BaseButton>
        </div>

        <!-- Map -->
        <div class="card-premium p-4 h-[600px]">
          <div class="w-full h-full rounded-lg overflow-hidden">
            <!-- Yandex Maps Embed -->
            <iframe
              :src="`https://yandex.uz/map-widget/v1/?ll=${BARBERSHOP_INFO.address.coordinates.lng}%2C${BARBERSHOP_INFO.address.coordinates.lat}&z=16&l=map&pt=${BARBERSHOP_INFO.address.coordinates.lng},${BARBERSHOP_INFO.address.coordinates.lat},pm2rdm`"
              width="100%"
              height="100%"
              frameborder="0"
              allowfullscreen
              style="position:relative;"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores'
import BaseButton from '@/components/ui/BaseButton.vue'
import { BARBERSHOP_INFO } from '@/data/m19-data'

const appStore = useAppStore()

const openBooking = () => {
  appStore.openBookingModal()
}
</script>

