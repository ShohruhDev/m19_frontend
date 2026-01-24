/**
 * App Store
 * Глобальное состояние приложения
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  // State
  const isMobileMenuOpen = ref(false)
  const isBookingModalOpen = ref(false)
  const scrollProgress = ref(0)
  const isScrolled = ref(false)

  // Actions
  function toggleMobileMenu() {
    isMobileMenuOpen.value = !isMobileMenuOpen.value

    // Блокируем скролл при открытии меню
    if (isMobileMenuOpen.value) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }

  function closeMobileMenu() {
    isMobileMenuOpen.value = false
    document.body.style.overflow = ''
  }

  function openBookingModal() {
    isBookingModalOpen.value = true
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden' // Force scroll lock on root
  }

  function closeBookingModal() {
    isBookingModalOpen.value = false
    document.body.style.overflow = ''
    document.documentElement.style.overflow = ''
  }

  function updateScrollProgress(progress: number) {
    scrollProgress.value = progress
  }

  function setScrolled(scrolled: boolean) {
    isScrolled.value = scrolled
  }

  // Cart
  const isCartOpen = ref(false)
  const openCart = () => {
    isCartOpen.value = true
    document.body.style.overflow = 'hidden'
  }
  const closeCart = () => {
    isCartOpen.value = false
    document.body.style.overflow = ''
  }
  const toggleCart = () => {
    if (isCartOpen.value) closeCart()
    else openCart()
  }

  return {
    // State
    isMobileMenuOpen,
    isBookingModalOpen,
    scrollProgress,
    isScrolled,
    isCartOpen, // New

    // Actions
    toggleMobileMenu,
    closeMobileMenu,
    openBookingModal,
    closeBookingModal,
    updateScrollProgress,
    setScrolled,
    openCart, // New
    closeCart, // New
    toggleCart // New
  }
})

