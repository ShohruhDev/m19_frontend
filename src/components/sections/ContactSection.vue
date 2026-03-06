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

      <div class="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- Contact Info -->
        <div class="space-y-6 lg:space-y-8 order-2 lg:order-1">
          <!-- Address -->
          <a
            href="https://yandex.uz/maps/?text=M19+Barbershop+%D0%A2%D0%B0%D1%88%D0%BA%D0%B5%D0%BD%D1%82+%D0%90%D0%B2%D0%BB%D0%B8%D1%91-%D0%9E%D1%82%D0%B0+36"
            target="_blank"
            rel="noopener noreferrer"
            class="card-premium p-6 lg:p-8 block hover:border-gold-500/60 transition-colors cursor-pointer"
          >
            <div class="flex items-start gap-4">
              <div class="text-3xl lg:text-4xl">📍</div>
              <div>
                <h3 class="text-lg lg:text-xl font-heading font-bold text-white mb-2">Адрес</h3>
                <p class="text-white/70">{{ BARBERSHOP_INFO.address.full }}</p>
                <p class="text-gold-500 text-sm mt-2">{{ BARBERSHOP_INFO.address.metro }}</p>
              </div>
            </div>
          </a>

          <!-- Phone -->
          <div class="card-premium p-6 lg:p-8">
            <div class="flex items-start gap-4">
              <div class="text-3xl lg:text-4xl">📞</div>
              <div class="flex-1">
                <h3 class="text-lg lg:text-xl font-heading font-bold text-white mb-2">Телефон</h3>
                <a
                  :href="BARBERSHOP_INFO.contact.phoneLink"
                  class="text-xl lg:text-2xl font-bold text-gold-500 hover:text-gold-400 transition-colors"
                >
                  {{ BARBERSHOP_INFO.contact.phoneDisplay }}
                </a>
                <p class="text-white/50 text-sm mt-2">Звоните или пишите в Telegram</p>
              </div>
            </div>
          </div>

          <!-- Working Hours -->
          <div class="card-premium p-6 lg:p-8">
            <div class="flex items-start gap-4">
              <div class="text-3xl lg:text-4xl">⏰</div>
              <div>
                <h3 class="text-lg lg:text-xl font-heading font-bold text-white mb-2">Режим работы</h3>
                <p class="text-white/70">{{ BARBERSHOP_INFO.workingHours.display }}</p>
                <p class="text-gold-500 text-sm mt-2">Работаем без выходных</p>
              </div>
            </div>
          </div>

          <!-- Social -->
          <div class="card-premium p-6 lg:p-8">
            <div class="flex items-start gap-4">
              <div class="text-3xl lg:text-4xl">💬</div>
              <div class="flex-1">
                <h3 class="text-lg lg:text-xl font-heading font-bold text-white mb-4">Социальные сети</h3>
                <div class="flex flex-wrap gap-4">
                  <a
                    :href="BARBERSHOP_INFO.social.instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 px-4 py-2 bg-gold-500/10 border border-gold-500/30 text-gold-500 rounded-lg hover:bg-gold-500 hover:text-dark transition-all"
                  >
                    <Instagram class="w-5 h-5" />
                    Instagram
                  </a>
                  <a
                    :href="BARBERSHOP_INFO.social.telegram"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                  >
                    <Send class="w-5 h-5" />
                    Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Map -->
        <div class="card-premium p-2 lg:p-4 h-[400px] lg:h-[600px] order-1 lg:order-2">
          <div class="w-full h-full rounded-lg overflow-hidden bg-dark-50">
            <!-- Yandex Maps Embed -->
            <iframe
              :src="`https://yandex.uz/map-widget/v1/?ll=${BARBERSHOP_INFO.address.coordinates.lng}%2C${BARBERSHOP_INFO.address.coordinates.lat}&z=16&l=map&pt=${BARBERSHOP_INFO.address.coordinates.lng},${BARBERSHOP_INFO.address.coordinates.lat},pm2rdm`"
              width="100%"
              height="100%"
              frameborder="0"
              allowfullscreen
              style="position:relative;"
              class="w-full h-full"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Instagram, Send } from 'lucide-vue-next'
import { BARBERSHOP_INFO } from '@/data/m19-data'
</script>

