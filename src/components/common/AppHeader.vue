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
          class="flex items-center gap-2 hover:scale-105 transition-transform duration-300"
        >
          <img src="@/assets/logo.png" alt="M19 Logo" class="h-12 w-auto object-contain" />
          <!-- Optional: Keep text if logo is icon-only, but usually logo replaces text. -->
        </RouterLink>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center gap-8">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            custom
            v-slot="{ navigate, href, isActive, isExactActive }"
          >
            <a
              :href="href"
              @click="navigate"
              class="font-heading font-medium uppercase tracking-wider transition-colors duration-300 relative group"
              :class="[
                isActive || (item.path === '/' && isExactActive) 
                  ? 'text-gold-500' 
                  : 'text-white/70 hover:text-gold-500'
              ]"
            >
              {{ item.name }}
              <span
                class="absolute -bottom-1 left-0 h-0.5 bg-gold-500 transition-all duration-300"
                :class="[
                   isActive || (item.path === '/' && isExactActive)
                     ? 'w-full' 
                     : 'w-0 group-hover:w-full'
                ]"
              ></span>
            </a>
          </RouterLink>
        </nav>

        <!-- CTA Button + Mobile Menu -->
        <div class="flex items-center gap-4">
          <!-- Auth Links (Desktop) -->
          <div class="hidden lg:flex items-center gap-4 mr-2">
            <template v-if="isAuthenticated">
              <RouterLink to="/profile" class="text-white/80 hover:text-gold-500 font-medium transition-colors">
                Кабинет
              </RouterLink>
            </template>
            <template v-else>
               <RouterLink to="/login" class="text-white/80 hover:text-gold-500 font-medium transition-colors">
                 Войти
               </RouterLink>
            </template>

          </div>

          <!-- Cart Button -->
          <button 
            @click="appStore.openCart()"
            class="hidden md:flex relative p-2 text-white/80 hover:text-gold-500 transition-colors mr-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span 
              v-if="cartStore.totalItems > 0"
              class="absolute -top-1 -right-1 bg-m19-gold text-dark text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
            >
              {{ cartStore.totalItems }}
            </span>
          </button>

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
            custom
            v-slot="{ navigate, href, isActive, isExactActive }"
          >
            <a
              :href="href"
              class="block text-lg font-heading font-medium transition-colors duration-300 py-2 border-l-2 pl-4"
              :class="[
                 isActive || (item.path === '/' && isExactActive)
                   ? 'text-gold-500 border-gold-500 bg-white/5' 
                   : 'text-white/70 hover:text-gold-500 border-transparent hover:border-gold-500/50'
              ]"
              @click="(e) => { navigate(e); closeMobileMenu(); }"
            >
              {{ item.name }}
            </a>
          </RouterLink>
          
          <!-- Mobile Auth Link -->
          <div class="py-2 border-l-2 pl-4 border-transparent">
             <template v-if="isAuthenticated">
                <RouterLink to="/profile" class="block text-lg font-heading font-medium text-white/70 hover:text-gold-500" @click="closeMobileMenu">
                  Личный кабинет
                </RouterLink>
             </template>
             <template v-else>
                <RouterLink to="/login" class="block text-lg font-heading font-medium text-white/70 hover:text-gold-500" @click="closeMobileMenu">
                  Войти
                </RouterLink>
             </template>
          </div>

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
import { useAppStore, useAuthStore, useCartStore } from '@/stores'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/ui/BaseButton.vue'

const appStore = useAppStore()
const authStore = useAuthStore()
const cartStore = useCartStore()
const { isMobileMenuOpen } = storeToRefs(appStore)
const { isAuthenticated } = storeToRefs(authStore)
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

