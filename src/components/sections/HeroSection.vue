<template>
  <div class="hero-section relative min-h-screen flex items-center justify-center overflow-hidden">
    <!-- Background gradient -->
    <div class="absolute inset-0 bg-premium-dark"></div>

    <!-- Animated background elements -->
    <div class="absolute inset-0 opacity-30">
      <div
        ref="circle1"
        class="absolute w-96 h-96 rounded-full bg-gold-500/10 blur-3xl"
        style="top: -10%; right: -10%"
      ></div>
      <div
        ref="circle2"
        class="absolute w-96 h-96 rounded-full bg-gold-500/10 blur-3xl"
        style="bottom: -10%; left: -10%"
      ></div>
    </div>

    <!-- Content -->
    <div class="container-custom relative z-10">
      <div class="max-w-4xl mx-auto text-center space-y-8">
        <!-- Main title -->
        <h1
          ref="titleRef"
          class="text-display-xl font-display font-bold text-white leading-none opacity-0"
        >
          Стиль,
          <span class="text-gradient">который говорит</span>
          за вас
        </h1>

        <!-- Subtitle -->
        <p
          ref="subtitleRef"
          class="text-xl md:text-2xl text-white/70 font-sans max-w-2xl mx-auto opacity-0"
        >
          Премиум барбершоп в центре Ташкента с рейтингом 5.0 ⭐
        </p>

        <!-- CTA Buttons -->
        <div
          ref="ctaRef"
          class="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0"
        >
          <BaseButton
            variant="primary"
            size="lg"
            @click="openBooking"
          >
            Записаться онлайн
          </BaseButton>
          <BaseButton variant="ghost" size="lg" @click="scrollToServices">
            Наши услуги
          </BaseButton>
        </div>

        <!-- Stats -->
        <div
          ref="statsRef"
          class="grid grid-cols-3 gap-8 pt-16 opacity-0"
        >
          <div class="text-center">
            <div ref="stat1" class="text-4xl md:text-5xl font-bold text-gold-500 mb-2">0</div>
            <div class="text-sm md:text-base text-white/50 uppercase tracking-wider">Лет опыта</div>
          </div>
          <div class="text-center">
            <div ref="stat2" class="text-4xl md:text-5xl font-bold text-gold-500 mb-2">0</div>
            <div class="text-sm md:text-base text-white/50 uppercase tracking-wider">Отзывов</div>
          </div>
          <div class="text-center">
            <div ref="stat3" class="text-4xl md:text-5xl font-bold text-gold-500 mb-2">0</div>
            <div class="text-sm md:text-base text-white/50 uppercase tracking-wider">Мастеров</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div
      ref="scrollIndicator"
      class="absolute bottom-10 left-1/2 transform -translate-x-1/2 opacity-0"
    >
      <div class="flex flex-col items-center gap-2 text-white/50 animate-bounce">
        <span class="text-sm uppercase tracking-wider">Листайте вниз</span>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import gsap from 'gsap'
import { useAppStore } from '@/stores'
import { useCounterAnimation } from '@/composables'
import BaseButton from '@/components/ui/BaseButton.vue'

const appStore = useAppStore()

const titleRef = ref<HTMLElement | null>(null)
const subtitleRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)
const statsRef = ref<HTMLElement | null>(null)
const scrollIndicator = ref<HTMLElement | null>(null)
const circle1 = ref<HTMLElement | null>(null)
const circle2 = ref<HTMLElement | null>(null)

const stat1 = ref<HTMLElement | null>(null)
const stat2 = ref<HTMLElement | null>(null)
const stat3 = ref<HTMLElement | null>(null)

// Counter animations
useCounterAnimation(stat1, 8, { duration: 2.5, delay: 1.5 })
useCounterAnimation(stat2, 160, { duration: 2.5, delay: 1.5 })
useCounterAnimation(stat3, 3, { duration: 2.5, delay: 1.5 })


onMounted(() => {
  // Hero entrance animation
  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
  })

  tl.to(titleRef.value, {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.3,
  })
    .to(
      subtitleRef.value,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
      },
      '-=0.5'
    )
    .to(
      ctaRef.value,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
      },
      '-=0.4'
    )
    .to(
      statsRef.value,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
      },
      '-=0.4'
    )
    .to(
      scrollIndicator.value,
      {
        opacity: 1,
        duration: 0.6,
      },
      '-=0.2'
    )

  // Floating circles animation
  if (circle1.value) {
    gsap.to(circle1.value, {
      y: 30,
      x: -20,
      duration: 4,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    })
  }

  if (circle2.value) {
    gsap.to(circle2.value, {
      y: -30,
      x: 20,
      duration: 5,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    })
  }
})

const openBooking = () => {
  appStore.openBookingModal()
}

const scrollToServices = () => {
  const servicesSection = document.getElementById('services')
  if (servicesSection) {
    servicesSection.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

