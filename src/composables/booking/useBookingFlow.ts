/**
 * Booking Flow Composable
 * Бизнес-логика для процесса онлайн-записи
 */

import { computed } from 'vue'
import { useBookingStore } from '@/stores'
import type { BookingStep, BookingStepConfig, AltegService } from '@/types'

import { storeToRefs } from 'pinia'

export function useBookingFlow() {
  const bookingStore = useBookingStore()
  const {
    currentStep, selectedServices, selectedStaff, selectedDate, selectedTime,
    clientInfo, services, staff, availableDates, availableSlots, isLoading,
    error, bookingResult, canGoNext, canGoBack, stepIndex, totalSteps, progress
  } = storeToRefs(bookingStore)

  const {
    loadServices, loadStaff, loadAvailableSlots,
    createBooking, toggleService, selectStaff, selectDate, selectTime,
    setClientInfo, nextStep, prevStep, goToStep, resetBooking, clearError,
    initializeBooking, setNotifyBySms
  } = bookingStore

  const stepConfig = computed<BookingStepConfig>(() => {
    const configs: Record<BookingStep, Omit<BookingStepConfig, 'step'>> = {
      service: {
        title: 'Выберите услугу',
        subtitle: 'Какую услугу вы хотите получить?',
        isValid: bookingStore.selectedServices.length > 0,
        canGoNext: bookingStore.selectedServices.length > 0,
        canGoBack: false,
      },
      staff: {
        title: 'Выберите мастера',
        subtitle: 'К кому вы хотите записаться?',
        isValid: bookingStore.selectedStaff !== null,
        canGoNext: bookingStore.selectedStaff !== null,
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
    if (bookingStore.selectedServices.length === 0) return 0
    return bookingStore.selectedServices.reduce((sum: number, service: AltegService) => sum + service.price_min, 0)
  })

  const estimatedDuration = computed(() => {
    if (bookingStore.selectedServices.length === 0) return 0

    // Sum up durations of all selected services
    return bookingStore.selectedServices.reduce((total: number, service: AltegService) => {
      // Determine duration for THIS service
      // Note: Staff specific duration usually depends on the specific staff for THIS service
      // But we selecting ONE staff for ALL services (usually) or Any.

      let serviceDuration = 0
      let staffId = bookingStore.selectedStaff?.id
      if (!staffId && bookingStore.selectedTime?.staff_id) {
        staffId = Number(bookingStore.selectedTime.staff_id)
      }

      if (staffId && service.staff) {
        const staffInfo = service.staff.find(s => s.id === staffId)
        if (staffInfo) {
          serviceDuration = staffInfo.seance_length
        }
      }

      if (serviceDuration === 0 && service.staff && service.staff.length > 0) {
        serviceDuration = service.staff[0].seance_length
      }

      if (serviceDuration === 0) {
        serviceDuration = service.duration ? service.duration * 60 : 0
      }

      return total + serviceDuration
    }, 0)
  })

  const isStepComplete = (step: BookingStep): boolean => {
    // implementation remains same as it uses store internally or we can pass it
    // For simplicity, reusing logic but accessing store directly is fine
    // Copying logic here for completeness or referencing method if moved to store?
    // The original code defined it here.
    const stepOrder: BookingStep[] = ['service', 'staff', 'time', 'confirmation']
    const currentIndex = stepOrder.indexOf(bookingStore.currentStep)
    const targetIndex = stepOrder.indexOf(step)

    if (targetIndex > currentIndex) return false

    switch (step) {
      case 'service':
        return bookingStore.selectedServices.length > 0
      case 'staff':
        return bookingStore.selectedStaff !== null
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
    currentStep, selectedServices, selectedStaff, selectedDate, selectedTime,
    clientInfo, services, staff, availableDates, availableSlots, isLoading,
    error, bookingResult, canGoNext, canGoBack, stepIndex, totalSteps, progress,

    // Local Computed
    stepConfig,
    formattedDateTime,
    totalPrice,
    estimatedDuration,

    // Actions
    loadServices, loadStaff, loadAvailableSlots,
    createBooking, toggleService, selectStaff, selectDate, selectTime,
    setClientInfo, nextStep, prevStep, goToStep, resetBooking, clearError,
    initializeBooking, setNotifyBySms,

    // Methods
    isStepComplete,
  }
}

