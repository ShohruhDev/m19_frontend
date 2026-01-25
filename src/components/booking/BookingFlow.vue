<template>
  <Dialog :open="isOpen" @update:open="(val) => !val && handleClose()">
    <DialogContent class="sm:max-w-[700px] p-0 gap-0 overflow-hidden bg-background border-border">
      <!-- Header with Progress -->
      <DialogHeader class="p-6 border-b border-border bg-card">
        <div class="flex items-center justify-between mb-4">
          <DialogTitle class="text-2xl font-heading font-bold">Онлайн-запись</DialogTitle>
          <div class="text-sm font-medium text-muted-foreground pr-8">
            Шаг <span class="text-primary">{{ stepIndex + 1 }}</span> из {{ totalSteps }}
          </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            class="h-full bg-primary transition-all duration-500 ease-in-out"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        
        <div class="mt-2 text-sm font-medium text-foreground">
          {{ stepConfig.title }}
        </div>
      </DialogHeader>

      <!-- Main Content Area -->
      <div 
        class="p-6 min-h-[400px] max-h-[60vh] overflow-y-auto scrollbar-custom bg-background relative"
        @wheel.stop
      >
        <Transition :name="transitionName" mode="out-in">
          <div :key="currentStep" class="booking-step">
            <ServiceSelection v-if="currentStep === 'service'" />
            <StaffSelection v-else-if="currentStep === 'staff'" />
            <TimeSelection v-else-if="currentStep === 'time'" />
            <BookingConfirmation
              v-else-if="currentStep === 'confirmation'"
              @back="prevStep"
              @success="handleSuccess"
            />
          </div>
        </Transition>
        
        <!-- Error Alert -->
        <div v-if="error" class="mt-4 p-4 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-3">
          <svg class="w-5 h-5 text-destructive mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-destructive">{{ error }}</p>
            <button 
              class="text-xs text-destructive hover:underline mt-1"
              @click="clearError"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <!-- Footer Actions -->
      <BookingSummaryFooter
        @next="nextStep"
        @back="prevStep"
      />
    </DialogContent>
  </Dialog>

  <!-- Success Dialog -->
  <Dialog :open="showSuccessModal" @update:open="(val) => !val && closeSuccessModal()">
    <DialogContent class="sm:max-w-[425px] border-primary/20">
      <div class="flex flex-col items-center text-center py-6 space-y-4">
        <div class="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        
        <DialogTitle class="text-2xl font-bold">Вы записаны!</DialogTitle>
        <DialogDescription>
          Ваша запись успешно подтверждена. Мы отправим детали в SMS.
        </DialogDescription>
        
        <div v-if="bookingResult" class="w-full bg-muted p-4 rounded-lg text-left text-sm space-y-3 mt-4 border border-border">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Услуга:</span>
              <span class="font-medium text-foreground">{{ bookingResult.service.title }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Мастер:</span>
              <span class="font-medium text-foreground">{{ bookingResult.staff.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Время:</span>
              <span class="font-medium text-foreground">{{ formatDateTime(bookingResult.datetime) }}</span>
            </div>
            <div v-if="bookingResult.code" class="flex justify-between items-center border-t border-border/50 pt-2 mt-2">
              <span class="text-muted-foreground">Код отмены:</span>
              <span class="font-mono font-bold text-primary text-base">{{ bookingResult.code }}</span>
            </div>
        </div>
        
        <Button class="w-full mt-4" @click="closeSuccessModal">Отлично</Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useBookingFlow } from '@/composables'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import ServiceSelection from './ServiceSelection.vue'
import StaffSelection from './StaffSelection.vue'
import TimeSelection from './TimeSelection.vue'
import BookingConfirmation from './BookingConfirmation.vue'
import BookingSummaryFooter from './BookingSummaryFooter.vue'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const {
  currentStep,
  stepIndex,
  totalSteps,
  progress,
  stepConfig,
  error,
  bookingResult,
  nextStep: nextStepAction,
  prevStep: prevStepAction,
  resetBooking,
  clearError,
  loadServices,
} = useBookingFlow()

const transitionName = ref<string>('slide-left')
const showSuccessModal = ref(false)

// Watch step index for transition direction
watch(() => stepIndex.value, (newIndex: number, oldIndex: number | undefined) => {
  transitionName.value = newIndex > (oldIndex || 0) ? 'slide-left' : 'slide-right'
})

// Load services on open
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      loadServices()
    }
  }
)

const nextStep = () => nextStepAction()
const prevStep = () => prevStepAction()

const handleClose = () => {
  emit('close')
  setTimeout(() => {
    resetBooking()
  }, 300)
}

const handleSuccess = () => {
  showSuccessModal.value = true
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  handleClose()
}

const formatDateTime = (datetime: string) => {
  const date = new Date(datetime)
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Lock body scroll when modal is open
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
  { immediate: true }
)

// loadServices is handled by the watcher above
// onMounted(() => {
//   if (props.isOpen) {
//     loadServices()
//   }
// })

// Cleanup: restore body scroll on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.booking-step {
  width: 100%;
}

.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(50px);
}
.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style>

