<template>
  <div id="app" class="min-h-screen bg-dark text-white">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>

    <!-- Splash Screen -->
    <SplashScreen :is-visible="isLoading" />

    <!-- Booking Modal (Global) -->
    <BookingFlow :is-open="appStore.isBookingModalOpen" @close="appStore.closeBookingModal()" />
    
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useSmoothScroll } from '@/composables'
import { useAppStore } from '@/stores'

import SplashScreen from '@/components/ui/SplashScreen.vue'
import BookingFlow from '@/components/booking/BookingFlow.vue'
import AppFooter from '@/components/common/AppFooter.vue'

// Инициализация smooth scroll
useSmoothScroll()

const appStore = useAppStore()
const isLoading = ref(true)

onMounted(() => {
  // Show splash screen for minimum time for branding effect
  setTimeout(() => {
    isLoading.value = false
  }, 1000)

  console.log('🚀 M19 Barbershop - Enterprise App Started')
  console.log('🔌 Supabase Integration: Active')
})
</script>

<style scoped>

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>

