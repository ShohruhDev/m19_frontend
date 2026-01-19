/**
 * Booking Flow Composable
 * Бизнес-логика для процесса онлайн-записи
 */

import { computed } from 'vue'
import { useBookingStore } from '@/stores'
import type { BookingStep, BookingStepConfig } from '@/types'

import { storeToRefs } from 'pinia'

export function useBookingFlow() {
  const bookingStore = useBookingStore()
  const {
    currentStep, selectedService, selectedStaff, selectedDate, selectedTime,
    clientInfo, services, staff, availableDates, availableSlots, isLoading,
    error, bookingResult, canGoNext, canGoBack, stepIndex, totalSteps, progress
  } = storeToRefs(bookingStore)

  const {
    loadServices, loadStaff, loadAvailableDates, loadAvailableSlots,
    createBooking, selectService, selectStaff, selectDate, selectTime,
    setClientInfo, nextStep, prevStep, goToStep, resetBooking, clearError
  } = bookingStore

  const stepConfig = computed<BookingStepConfig>(() => {
    const configs: Record<BookingStep, Omit<BookingStepConfig, 'step'>> = {
      service: {
        title: 'Выберите услугу',
        subtitle: 'Какую услугу вы хотите получить?',
        isValid: bookingStore.selectedService !== null,
        canGoNext: bookingStore.selectedService !== null,
        canGoBack: false,
      },
      staff: {
        title: 'Выберите мастера',
        subtitle: 'К кому вы хотите записаться?',
        isValid: bookingStore.selectedStaff !== null,
        canGoNext: bookingStore.selectedStaff !== null,
        canGoBack: true,
      },
      date: {
        title: 'Выберите дату',
        subtitle: 'Когда вам удобно?',
        isValid: bookingStore.selectedDate !== null,
        canGoNext: bookingStore.selectedDate !== null,
        canGoBack: true,
      },
      time: {
        title: 'Выберите время',
        subtitle: 'Во сколько вам удобно?',
        isValid: bookingStore.selectedTime !== null,
        canGoNext: bookingStore.selectedTime !== null,
        canGoBack: true,
      },
      confirmation: {
        title: 'Подтверждение',
        subtitle: 'Проверьте данные записи',
        isValid: bookingStore.clientInfo !== null,
        canGoNext: false,
        canGoBack: true,
      },
    }

    return {
      step: bookingStore.currentStep,
      ...configs[bookingStore.currentStep],
    }
  })

  // ... rest of computed ...
  const formattedDateTime = computed(() => {
    if (!bookingStore.selectedDate || !bookingStore.selectedTime) {
      return null
    }

    const date = new Date(bookingStore.selectedDate)
    const [hours, minutes] = bookingStore.selectedTime.time.split(':')

    const dateOptions: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }

    return {
      date: date.toLocaleDateString('ru-RU', dateOptions),
      time: `${hours}:${minutes}`,
      full: `${date.toLocaleDateString('ru-RU', dateOptions)} в ${hours}:${minutes}`,
    }
  })

  const totalPrice = computed(() => {
    if (!bookingStore.selectedService) return 0
    return bookingStore.selectedService.price_min
  })

  const estimatedDuration = computed(() => {
    if (!bookingStore.selectedService) return 0
    return bookingStore.selectedService.duration
  })

  const isStepComplete = (step: BookingStep): boolean => {
    // implementation remains same as it uses store internally or we can pass it
    // For simplicity, reusing logic but accessing store directly is fine
    // Copying logic here for completeness or referencing method if moved to store?
    // The original code defined it here.
    const stepOrder: BookingStep[] = ['service', 'staff', 'date', 'time', 'confirmation']
    const currentIndex = stepOrder.indexOf(bookingStore.currentStep)
    const targetIndex = stepOrder.indexOf(step)

    if (targetIndex > currentIndex) return false

    switch (step) {
      case 'service':
        return bookingStore.selectedService !== null
      case 'staff':
        return bookingStore.selectedStaff !== null
      case 'date':
        return bookingStore.selectedDate !== null
      case 'time':
        return bookingStore.selectedTime !== null
      case 'confirmation':
        return bookingStore.clientInfo !== null
      default:
        return false
    }
  }

  return {
    // State & Computed (Refs)
    currentStep, selectedService, selectedStaff, selectedDate, selectedTime,
    clientInfo, services, staff, availableDates, availableSlots, isLoading,
    error, bookingResult, canGoNext, canGoBack, stepIndex, totalSteps, progress,

    // Local Computed
    stepConfig,
    formattedDateTime,
    totalPrice,
    estimatedDuration,

    // Actions
    loadServices, loadStaff, loadAvailableDates, loadAvailableSlots,
    createBooking, selectService, selectStaff, selectDate, selectTime,
    setClientInfo, nextStep, prevStep, goToStep, resetBooking, clearError,

    // Methods
    isStepComplete,
  }
}

