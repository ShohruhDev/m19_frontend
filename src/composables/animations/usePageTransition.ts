/**
 * Page Transition Composable
 * Cinematic page transitions между роутами
 */

import { ref } from 'vue'
import gsap from 'gsap'

const isTransitioning = ref(false)

export function usePageTransition() {
  const transitionIn = async (element: HTMLElement) => {
    isTransitioning.value = true

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
    })

    // Создаем overlay для transition
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #0A0A0A;
      z-index: 9999;
      transform: scaleY(0);
      transform-origin: bottom;
    `
    document.body.appendChild(overlay)

    tl.to(overlay, {
      scaleY: 1,
      duration: 0.6,
    })
      .set(element, { opacity: 0 })
      .to(overlay, {
        scaleY: 0,
        transformOrigin: 'top',
        duration: 0.6,
      })
      .to(element, {
        opacity: 1,
        duration: 0.3,
      })
      .add(() => {
        document.body.removeChild(overlay)
        isTransitioning.value = false
      })

    return tl
  }

  const transitionOut = async (element: HTMLElement) => {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
    })

    tl.to(element, {
      opacity: 0,
      y: -50,
      duration: 0.4,
    })

    return tl
  }

  return {
    isTransitioning,
    transitionIn,
    transitionOut,
  }
}

