/**
 * Smooth Scroll Composable
 * Интеграция Lenis для плавного скролла
 */

import { onMounted, onUnmounted } from 'vue'
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

let lenis: Lenis | null = null

export function useSmoothScroll() {
  onMounted(() => {
    // Инициализация Lenis
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,

      touchMultiplier: 2,
      infinite: false,
    })

    // Синхронизация с GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis?.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)
  })

  onUnmounted(() => {
    lenis?.destroy()
    lenis = null
  })

  const scrollTo = (target: string | number, options?: { offset?: number; duration?: number }) => {
    lenis?.scrollTo(target, {
      offset: options?.offset || 0,
      duration: options?.duration,
    })
  }

  const stop = () => {
    lenis?.stop()
  }

  const start = () => {
    lenis?.start()
  }

  return {
    scrollTo,
    stop,
    start,
  }
}

