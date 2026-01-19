<template>
  <BaseModal
    :is-open="isOpen"
    size="lg"
    @close="handleClose"
  >
    <template #header>
      <div class="space-y-4">
        <h2 class="text-3xl font-heading font-bold text-gradient">Онлайн-запись</h2>

        <!-- Progress bar -->
        <div class="w-full h-2 bg-dark-50 rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 transition-all duration-500"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>

        <!-- Step indicator -->
        <div class="flex items-center justify-between text-sm">
          <span class="text-white/70">
            Шаг {{ stepIndex + 1 }} из {{ totalSteps }}
          </span>
          <span class="text-gold-500 font-semibold">
            {{ stepConfig.title }}
          </span>
        </div>
      </div>
    </template>

    <!-- Step content with transitions -->
    <div class="min-h-[400px]">
      <Transition :name="transitionName" mode="out-in">
        <div :key="currentStep" class="booking-step">
          <ServiceSelection v-if="currentStep === 'service'" />
          <StaffSelection v-else-if="currentStep === 'staff'" />
          <DateSelection v-else-if="currentStep === 'date'" />
          <TimeSelection v-else-if="currentStep === 'time'" />
          <BookingConfirmation
            v-else-if="currentStep === 'confirmation'"
            @back="prevStep"
            @success="handleSuccess"
          />
        </div>
      </Transition>

      <!-- Error message -->
      <div
        v-if="error"
        class="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded flex items-start gap-3"
      >
        <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="flex-1">
          <p class="text-red-500 text-sm">{{ error }}</p>
          <button
            class="mt-2 text-red-400 hover:text-red-300 text-sm underline"
            @click="clearError"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-4">
        <BaseButton
          v-if="canGoBack && currentStep !== 'confirmation'"
          variant="ghost"
          class="flex-1"
          @click="prevStep"
        >
          Назад
        </BaseButton>
        <BaseButton
          v-if="currentStep !== 'confirmation'"
          variant="primary"
          class="flex-1"
          :disabled="!canGoNext"
          @click="nextStep"
        >
          Далее
        </BaseButton>
      </div>
    </template>
  </BaseModal>

  <!-- Success Modal -->
  <BaseModal
    :is-open="showSuccessModal"
    size="md"
    @close="closeSuccessModal"
  >
    <div class="text-center py-8 space-y-6">
      <!-- Success Icon -->
      <div class="w-20 h-20 mx-auto bg-gold-500 rounded-full flex items-center justify-center">
        <svg class="w-10 h-10 text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div>
        <h2 class="text-2xl font-heading font-bold text-gold-500 mb-2">
          Запись успешно создана!
        </h2>
        <p class="text-white/70">
          Подтверждение отправлено на указанный номер телефона
        </p>
      </div>

      <div v-if="bookingResult" class="card-premium p-6 space-y-4 text-left">
        <div>
          <p class="text-sm text-white/50 mb-1">Услуга</p>
          <p class="text-lg font-semibold text-white">{{ bookingResult.service.title }}</p>
        </div>
        <div>
          <p class="text-sm text-white/50 mb-1">Мастер</p>
          <p class="text-lg font-semibold text-white">{{ bookingResult.staff.name }}</p>
        </div>
        <div>
          <p class="text-sm text-white/50 mb-1">Дата и время</p>
          <p class="text-lg font-semibold text-white">
            {{ formatDateTime(bookingResult.datetime) }}
          </p>
        </div>
        <div v-if="bookingResult.code" class="pt-4 border-t border-white/10">
          <p class="text-sm text-white/50 mb-1">Код для отмены</p>
          <p class="text-xl font-bold text-gold-500 font-mono">{{ bookingResult.code }}</p>
          <p class="text-xs text-white/50 mt-1">Сохраните этот код для отмены записи</p>
        </div>
      </div>

      <BaseButton variant="primary" class="w-full" @click="closeSuccessModal">
        Отлично!
      </BaseButton>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useBookingFlow } from '@/composables'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ServiceSelection from './ServiceSelection.vue'
import StaffSelection from './StaffSelection.vue'
import DateSelection from './DateSelection.vue'
import TimeSelection from './TimeSelection.vue'
import BookingConfirmation from './BookingConfirmation.vue'

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
  canGoNext,
  canGoBack,
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
const previousStep = ref<number>(stepIndex.value)

// Определяем направление анимации
watch(() => stepIndex.value, (newIndex: number, oldIndex: number) => {
  if (oldIndex !== undefined) {
    previousStep.value = oldIndex
  }
  transitionName.value = newIndex > (oldIndex || 0) ? 'slide-left' : 'slide-right'
})

// Загрузка услуг при открытии
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      loadServices()
    }
  }
)

const nextStep = () => {
  nextStepAction()
}

const prevStep = () => {
  prevStepAction()
}

const handleClose = () => {
  emit('close')
  // Небольшая задержка перед сбросом, чтобы анимация закрытия прошла
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

onMounted(() => {
  if (props.isOpen) {
    loadServices()
  }
})
</script>

<style scoped>
.booking-step {
  width: 100%;
}

/* Slide transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-100px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>

