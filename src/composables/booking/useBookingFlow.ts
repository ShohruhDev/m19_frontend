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
    error, bookingResult, canGoNext, canGoBack, stepIndex, totalSteps, progress,
    showAllStaff
  } = storeToRefs(bookingStore)

  const {
    loadServices, loadStaff, loadAvailableSlots,
    createBooking, selectService, selectStaff, selectDate, selectTime,
    setClientInfo, nextStep, prevStep, goToStep, resetBooking, clearError,
    toggleShowAllStaff, initializeBooking, setNotifyBySms
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
    const service = bookingStore.selectedService
    if (!service) return 0

    // Определяем ID мастера (выбранный или из слота времени)
    let staffId = bookingStore.selectedStaff?.id
    if (!staffId && bookingStore.selectedTime?.staff_id) {
      staffId = Number(bookingStore.selectedTime.staff_id)
    }

    // Если мастер известен, ищем его длительность в списке staff у сервиса
    if (staffId && service.staff) {
      const staffInfo = service.staff.find(s => s.id === staffId)
      if (staffInfo) return staffInfo.seance_length
    }

    // Fallback: берем длительность первого мастера
    if (service.staff && service.staff.length > 0) {
      return service.staff[0].seance_length
    }

    // Fallback 2: если есть общая длительность в минутах -> переводим в секунды
    return service.duration ? service.duration * 60 : 0
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
        return bookingStore.selectedService !== null
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
    currentStep, selectedService, selectedStaff, selectedDate, selectedTime,
    clientInfo, services, staff, availableDates, availableSlots, isLoading,
    error, bookingResult, canGoNext, canGoBack, stepIndex, totalSteps, progress,
    showAllStaff,

    // Local Computed
    stepConfig,
    formattedDateTime,
    totalPrice,
    estimatedDuration,

    // Actions
    loadServices, loadStaff, loadAvailableSlots,
    createBooking, selectService, selectStaff, selectDate, selectTime,
    setClientInfo, nextStep, prevStep, goToStep, resetBooking, clearError,
    toggleShowAllStaff, initializeBooking, setNotifyBySms,

    // Methods
    isStepComplete,
  }
}

