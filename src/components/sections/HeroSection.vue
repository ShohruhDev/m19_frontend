<template>
  <div class="hero-section relative min-h-screen flex items-center justify-center overflow-hidden">
    <!-- Video Background -->
    <div class="absolute inset-0 w-full h-full overflow-hidden">
      <video
        autoplay
        loop
        muted
        playsinline
        class="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
      >
        <source src="/barbershop-hero-v2.mp4" type="video/mp4" />
      </video>
      <!-- Dark overlay for text readability -->
      <div class="absolute inset-0 bg-black/60"></div>
    </div>

    <!-- Animated background elements -->
    <div class="absolute inset-0 opacity-20">
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
      <div class="max-w-4xl mx-auto text-center space-y-6">
        <!-- Main title -->
        <h1
          ref="titleRef"
          class="opacity-0 space-y-3"
        >
          <!-- Top line -->
          <span class="block hero-top-line">
            ПРИДИТЕ С ФЛАЕРОМ
          </span>

          <!-- Big discount line with brush -->
          <span class="block hero-discount-row">
            <span class="hero-percent">-20%</span>
            <span class="hero-brush-badge">СКИДКА</span>
          </span>
        </h1>

        <!-- Subtitle -->
        <p
          ref="subtitleRef"
          class="text-base md:text-lg text-white/60 font-sans max-w-xl mx-auto opacity-0 uppercase tracking-widest"
        >
          Один из лучших барбершопов в центре Ташкента с рейтингом 5.0 ⭐
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
import BaseButton from '@/components/ui/BaseButton.vue'

const appStore = useAppStore()

const titleRef = ref<HTMLElement | null>(null)
const subtitleRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)
const scrollIndicator = ref<HTMLElement | null>(null)
const circle1 = ref<HTMLElement | null>(null)
const circle2 = ref<HTMLElement | null>(null)

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



</script>

<style scoped>
@keyframes kenBurns {
  0% {
    transform: scale(1) translate(0, 0);
  }
  50% {
    transform: scale(1.1) translate(-2%, -2%);
  }
  100% {
    transform: scale(1) translate(0, 0);
  }
}

.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.duration-2000 {
  transition-duration: 2000ms;
}

/* ── Hero top line ── */
.hero-top-line {
  font-family: var(--font-family-heading);
  font-size: clamp(0.85rem, 3vw, 1.15rem);
  font-weight: 600;
  letter-spacing: 0.35em;
  color: rgba(255, 255, 255, 0.75);
  text-transform: uppercase;
  margin-bottom: 4px;
}

/* ── Discount row ── */
.hero-discount-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-percent {
  font-family: var(--font-family-heading);
  font-size: clamp(4rem, 16vw, 9rem);
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
  letter-spacing: -0.03em;
  text-shadow:
    0 0 60px rgba(255,255,255,0.15),
    2px 2px 0 rgba(0,0,0,0.5);
}

/* ── Brush badge ── */
.hero-brush-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-family-heading);
  font-size: clamp(1.8rem, 7vw, 4.5rem);
  font-weight: 900;
  color: #111;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 8px 28px 12px;
  z-index: 1;
}

.hero-brush-badge::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #ffffff;
  clip-path: polygon(
    0% 15%,
    3% 0%,
    97% 5%,
    100% 20%,
    98% 80%,
    100% 100%,
    2% 95%,
    0% 80%
  );
  z-index: -1;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4));
}
</style>
