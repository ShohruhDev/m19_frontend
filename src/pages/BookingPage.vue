<template>
  <div class="booking-page min-h-screen bg-dark">
    <AppHeader />

    <main class="pt-32 pb-20">
      <div class="container-custom max-w-5xl">
        <div class="text-center mb-12">
          <h1 class="text-display-md font-heading font-bold text-gradient mb-4">
            Онлайн-запись
          </h1>
          <p class="text-xl text-white/70">
            Выберите удобное время и запишитесь к нашим мастерам
          </p>
        </div>

        <BookingFlow :is-open="true" @close="$router.push('/')" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import BookingFlow from '@/components/booking/BookingFlow.vue'
</script>

