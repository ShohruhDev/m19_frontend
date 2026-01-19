/**
 * GSAP Animations Composable
 * Переиспользуемые GSAP анимации для enterprise-приложения
 */

import { onMounted, onUnmounted, type Ref } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export interface AnimationOptions {
  duration?: number
  delay?: number
  ease?: string
  stagger?: number
}

/**
 * Fade In анимация при появлении элемента
 */
export function useFadeIn(
  target: Ref<HTMLElement | null> | string,
  options: AnimationOptions = {}
) {
  let ctx: gsap.Context | null = null

  onMounted(() => {
    ctx = gsap.context(() => {
      const el = typeof target === 'string' ? target : target.value
      if (!el) return

      gsap.from(el, {
        opacity: 0,
        y: 50,
        duration: options.duration || 1,
        delay: options.delay || 0,
        ease: options.ease || 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
    })
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}

/**
 * Stagger анимация для списков элементов
 */
export function useStaggerAnimation(
  target: Ref<HTMLElement | null> | string,
  options: AnimationOptions = {}
) {
  let ctx: gsap.Context | null = null

  onMounted(() => {
    ctx = gsap.context(() => {
      const el = typeof target === 'string' ? target : target.value
      if (!el) return

      const children = gsap.utils.toArray<HTMLElement>(
        typeof target === 'string' ? `${target} > *` : `${el} > *`
      )

      gsap.from(children, {
        opacity: 0,
        y: 60,
        duration: options.duration || 0.8,
        stagger: options.stagger || 0.1,
        ease: options.ease || 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      })
    })
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}

/**
 * Parallax эффект для изображений
 */
export function useParallax(
  target: Ref<HTMLElement | null> | string,
  speed: number = 0.5
) {
  let ctx: gsap.Context | null = null

  onMounted(() => {
    ctx = gsap.context(() => {
      const el = typeof target === 'string' ? target : target.value
      if (!el) return

      gsap.to(el, {
        yPercent: 50 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    })
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}

/**
 * Scale In анимация для карточек
 */
export function useScaleIn(
  target: Ref<HTMLElement | null> | string,
  options: AnimationOptions = {}
) {
  let ctx: gsap.Context | null = null

  onMounted(() => {
    ctx = gsap.context(() => {
      const el = typeof target === 'string' ? target : target.value
      if (!el) return

      gsap.from(el, {
        scale: 0.8,
        opacity: 0,
        duration: options.duration || 1,
        delay: options.delay || 0,
        ease: options.ease || 'back.out(1.7)',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
    })
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}

/**
 * Slide From Left анимация
 */
export function useSlideFromLeft(
  target: Ref<HTMLElement | null> | string,
  options: AnimationOptions = {}
) {
  let ctx: gsap.Context | null = null

  onMounted(() => {
    ctx = gsap.context(() => {
      const el = typeof target === 'string' ? target : target.value
      if (!el) return

      gsap.from(el, {
        x: -100,
        opacity: 0,
        duration: options.duration || 1,
        delay: options.delay || 0,
        ease: options.ease || 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
    })
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}

/**
 * Slide From Right анимация
 */
export function useSlideFromRight(
  target: Ref<HTMLElement | null> | string,
  options: AnimationOptions = {}
) {
  let ctx: gsap.Context | null = null

  onMounted(() => {
    ctx = gsap.context(() => {
      const el = typeof target === 'string' ? target : target.value
      if (!el) return

      gsap.from(el, {
        x: 100,
        opacity: 0,
        duration: options.duration || 1,
        delay: options.delay || 0,
        ease: options.ease || 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
    })
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}

/**
 * Counter анимация для чисел
 */
export function useCounterAnimation(
  target: Ref<HTMLElement | null>,
  endValue: number,
  options: AnimationOptions = {}
) {
  let ctx: gsap.Context | null = null

  onMounted(() => {
    ctx = gsap.context(() => {
      if (!target.value) return

      const obj = { value: 0 }

      gsap.to(obj, {
        value: endValue,
        duration: options.duration || 2,
        delay: options.delay || 0,
        ease: options.ease || 'power2.out',
        onUpdate: () => {
          if (target.value) {
            target.value.textContent = Math.round(obj.value).toString()
          }
        },
        scrollTrigger: {
          trigger: target.value,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })
    })
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}

/**
 * Split Text анимация (появление текста по буквам)
 */
export function useSplitText(
  target: Ref<HTMLElement | null> | string,
  options: AnimationOptions = {}
) {
  let ctx: gsap.Context | null = null

  onMounted(() => {
    ctx = gsap.context(() => {
      const el = typeof target === 'string' ? target : target.value
      if (!el) return

      const text = typeof target === 'string'
        ? document.querySelector(target)?.textContent || ''
        : target.value?.textContent || ''

      const chars = text.split('')
      const element = typeof target === 'string' ? document.querySelector(target) : target.value

      if (!element) return

      element.innerHTML = chars.map(char =>
        `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`
      ).join('')

      const charElements = element.querySelectorAll('span')

      gsap.from(charElements, {
        opacity: 0,
        y: 50,
        duration: options.duration || 0.5,
        stagger: options.stagger || 0.03,
        ease: options.ease || 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
    })
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}

/**
 * Timeline для сложных анимаций
 */
export function useGSAPTimeline() {
  const timeline = gsap.timeline({
    defaults: { ease: 'power3.out' },
  })

  onUnmounted(() => {
    timeline.kill()
  })

  return timeline
}

/**
 * Reveal анимация с маской
 */
export function useRevealAnimation(
  target: Ref<HTMLElement | null> | string,
  options: AnimationOptions = {}
) {
  let ctx: gsap.Context | null = null

  onMounted(() => {
    ctx = gsap.context(() => {
      const el = typeof target === 'string' ? target : target.value
      if (!el) return

      gsap.from(el, {
        clipPath: 'inset(0 100% 0 0)',
        duration: options.duration || 1.5,
        delay: options.delay || 0,
        ease: options.ease || 'power3.inOut',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
    })
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}

/**
 * Magnetic hover effect для кнопок
 */
export function useMagneticHover(target: Ref<HTMLElement | null>) {
  let handleMouseMove: ((e: MouseEvent) => void) | null = null
  let handleMouseLeave: (() => void) | null = null

  onMounted(() => {
    if (!target.value) return

    const element = target.value

    handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      gsap.to(element, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      })
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)
  })

  onUnmounted(() => {
    if (target.value && handleMouseMove && handleMouseLeave) {
      target.value.removeEventListener('mousemove', handleMouseMove)
      target.value.removeEventListener('mouseleave', handleMouseLeave)
    }
  })
}

