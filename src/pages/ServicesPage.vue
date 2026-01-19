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

        <div class="space-y-12">
          <div v-for="category in serviceCategories" :key="category.name" class="space-y-6">
            <h2 class="text-3xl font-heading font-bold text-gold-500">
              {{ category.name }}
            </h2>

            <div class="grid gap-4">
              <div
                v-for="service in category.services"
                :key="service.title"
                class="card-premium p-6 flex items-center justify-between group"
              >
                <div class="flex-1">
                  <h3 class="text-xl font-heading font-semibold text-white mb-2">
                    {{ service.title }}
                  </h3>
                  <p class="text-white/70 text-sm mb-3">{{ service.description }}</p>
                  <div class="flex items-center gap-4 text-sm text-white/50">
                    <span class="flex items-center gap-1">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ service.duration }} мин
                    </span>
                  </div>
                </div>
                <div class="text-right ml-6">
                  <div class="text-2xl font-bold text-gold-500">{{ service.price }}</div>
                  <BaseButton
                    variant="secondary"
                    size="sm"
                    class="mt-3"
                    @click="bookService(service)"
                  >
                    Записаться
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <BookingFlow :is-open="isBookingOpen" @close="isBookingOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import BookingFlow from '@/components/booking/BookingFlow.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { SERVICES } from '@/data/m19-data'

const isBookingOpen = ref(false)

// Конвертируем данные в нужный формат
const serviceCategories = SERVICES.map(category => ({
  name: category.category,
  services: category.items.map(item => ({
    title: item.title,
    description: item.description,
    price: `${(item.price / 1000).toFixed(0)} 000 сўм`,
    duration: item.duration,
  })),
}))

const bookService = (service: any) => {
  isBookingOpen.value = true
}
</script>

