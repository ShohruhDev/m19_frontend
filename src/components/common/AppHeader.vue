<template>
  <header
    :class="[
      'fixed top-0 left-0 right-0 z-40 transition-all duration-500',
      isScrolled ? 'bg-dark/95 backdrop-blur-xl border-b border-white/10 shadow-2xl' : 'bg-transparent',
    ]"
  >
    <div class="container-custom">
      <div class="flex items-center justify-between h-20 md:h-24">
        <!-- Logo -->
        <RouterLink
          to="/"
          class="text-2xl md:text-3xl font-heading font-bold text-gradient hover:scale-105 transition-transform duration-300"
        >
          M19
        </RouterLink>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center gap-8">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="text-white/70 hover:text-gold-500 font-heading font-medium uppercase tracking-wider
                   transition-colors duration-300 relative group"
          >
            {{ item.name }}
            <span
              class="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-500 group-hover:w-full transition-all duration-300"
            ></span>
          </RouterLink>
        </nav>

        <!-- CTA Button + Mobile Menu -->
        <div class="flex items-center gap-4">
          <BaseButton
            variant="primary"
            size="md"
            class="hidden md:block"
            @click="openBooking"
          >
            Записаться
          </BaseButton>

          <!-- Mobile menu button -->
          <button
            class="lg:hidden w-10 h-10 flex items-center justify-center text-white"
            @click="toggleMobileMenu"
          >
            <svg
              v-if="!isMobileMenuOpen"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition name="mobile-menu">
      <div
        v-if="isMobileMenuOpen"
        class="lg:hidden bg-dark border-t border-white/10"
      >
        <nav class="container-custom py-6 space-y-4">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="block text-lg font-heading font-medium text-white/70 hover:text-gold-500
                   transition-colors duration-300 py-2"
            @click="closeMobileMenu"
          >
            {{ item.name }}
          </RouterLink>

          <BaseButton
            variant="primary"
            size="lg"
            class="w-full mt-6"
            @click="openBookingMobile"
          >
            Записаться онлайн
          </BaseButton>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '@/stores'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/ui/BaseButton.vue'

const appStore = useAppStore()
const { isMobileMenuOpen } = storeToRefs(appStore)
const { toggleMobileMenu, closeMobileMenu, openBookingModal } = appStore

const isScrolled = ref(false)

const navItems = [
  { name: 'Главная', path: '/' },
  { name: 'Услуги', path: '/services' },
  { name: 'Мастера', path: '/staff' },
  { name: 'Косметика', path: '/products' },
  { name: 'Отзывы', path: '/reviews' },
]

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const openBooking = () => {
  openBookingModal()
}

const openBookingMobile = () => {
  closeMobileMenu()
  openBookingModal()
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

