<template>
  <div id="app" class="min-h-screen bg-dark text-white">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>

    <!-- Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useSmoothScroll } from '@/composables'
import ToastContainer from '@/components/ui/ToastContainer.vue'

// Инициализация smooth scroll
useSmoothScroll()

onMounted(() => {
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

