<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="relative z-[9999]">
        <!-- Backdrop -->
        <div 
          class="fixed inset-0 bg-black/90 backdrop-blur-sm transition-opacity" 
          @click="handleBackdropClick"
        ></div>

        <!-- Scrollable Container -->
        <div class="fixed inset-0 z-10 w-screen overflow-y-auto scrollbar-custom overscroll-contain" @click.self="handleBackdropClick">
          <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <!-- Modal Content -->
            <div
              ref="modalRef"
              :class="[
                'relative transform bg-dark border border-white/10 w-full text-left shadow-xl transition-all sm:my-8',
                sizeClasses,
              ]"
              @click.stop
            >
              <!-- Close Button -->
              <button
                v-if="showClose"
                class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center
                       text-white/50 hover:text-gold-500 transition-colors duration-300"
                @click="close"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <!-- Header -->
              <div v-if="$slots.header" class="p-6 sm:p-8 border-b border-white/10">
                <slot name="header"></slot>
              </div>

              <!-- Body -->
              <div class="p-6 sm:p-8">
                <slot></slot>
              </div>

              <!-- Footer -->
              <div v-if="$slots.footer" class="p-6 sm:p-8 border-t border-white/10">
                <slot name="footer"></slot>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'

interface Props {
  isOpen: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showClose?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showClose: true,
  closeOnBackdrop: true,
})

const emit = defineEmits<{
  close: []
}>()

// const modalRef = ref<HTMLElement | null>(null)

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-full max-w-md',
    md: 'w-full max-w-2xl',
    lg: 'w-full max-w-4xl',
    xl: 'w-full max-w-6xl',
    full: 'w-full h-full max-w-full',
  }
  return sizes[props.size]
})

const close = () => {
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}

// Блокировка скролла при открытии модала
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)

// Закрытие по ESC
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    close()
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
</script>

<style scoped>

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from > div:last-child {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}

.modal-leave-to > div:last-child {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}
</style>

