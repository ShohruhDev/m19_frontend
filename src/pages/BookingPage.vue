<template>
  <div class="booking-page min-h-screen bg-dark">
    <AppHeader />

    <main class="pt-32 pb-20">
      <div class="container-custom h-full py-8">
        <div class="text-center mb-8">
          <h1 class="text-display-md font-heading font-bold text-gradient mb-4">
            Онлайн-запись
          </h1>
        </div>
      
        <div class="booking-container bg-card rounded-xl border border-border overflow-hidden flex flex-col h-[600px] sm:h-[calc(100vh-14rem)] min-h-[500px]">
          <!-- Embed AltegioWidget directly -->
          <AltegioWidget />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import AltegioWidget from '@/components/booking/AltegioWidget.vue'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Онлайн-запись - M19 Barbershop',
  meta: [
    {
      name: 'description',
      content: 'Записаться на стрижку в M19 Barbershop онлайн. Выберите мастера, услугу и удобное время за пару кликов.'
    },
    { property: 'og:title', content: 'Онлайн-запись - M19 Barbershop' },
    { property: 'og:description', content: 'Быстрая онлайн-запись на стрижку в Ташкенте.' },
    { property: 'og:image', content: 'https://m19barbershop.uz/barbershop-3.png' },
    { property: 'og:url', content: 'https://m19barbershop.uz/booking' }
  ]
})
</script>
