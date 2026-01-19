/**
 * Booking Store
 * Управление состоянием процесса онлайн-записи
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { altegService } from '@/services'
import type {
  BookingStep,
  BookingState,
  AltegService,
  AltegStaff,
  AltegScheduleSlot,
  AltegAvailableDate,
  ClientInfo,
  AltegBookingResponse,
} from '@/types'

export const useBookingStore = defineStore('booking', () => {
  // State
  const currentStep = ref<BookingStep>('service')
  const selectedService = ref<AltegService | null>(null)
  const selectedStaff = ref<AltegStaff | null>(null)
  const selectedDate = ref<string | null>(null)
  const selectedTime = ref<AltegScheduleSlot | null>(null)
  const clientInfo = ref<ClientInfo | null>(null)

  const services = ref<AltegService[]>([])
  const staff = ref<AltegStaff[]>([])
  const availableDates = ref<AltegAvailableDate[]>([])
  const availableSlots = ref<AltegScheduleSlot[]>([])

  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const bookingResult = ref<AltegBookingResponse | null>(null)

  // Computed
  const canGoNext = computed(() => {
    switch (currentStep.value) {
      case 'service':
        return selectedService.value !== null
      case 'staff':
        return selectedStaff.value !== null
      case 'date':
        return selectedDate.value !== null
      case 'time':
        return selectedTime.value !== null
      case 'confirmation':
        return false
      default:
        return false
    }
  })

  const canGoBack = computed(() => {
    return currentStep.value !== 'service'
  })

  const stepIndex = computed(() => {
    const steps: BookingStep[] = ['service', 'staff', 'date', 'time', 'confirmation']
    return steps.indexOf(currentStep.value)
  })

  const totalSteps = computed(() => 5)

  const progress = computed(() => {
    return ((stepIndex.value + 1) / totalSteps.value) * 100
  })

  // Actions
  async function loadServices() {
    isLoading.value = true
    error.value = null

    try {
      services.value = await altegService.fetchServices()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки услуг'
      console.error('Failed to load services:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function loadStaff() {
    if (!selectedService.value) return

    isLoading.value = true
    error.value = null

    try {
      staff.value = await altegService.fetchStaff(selectedService.value.id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки мастеров'
      console.error('Failed to load staff:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function loadAvailableDates() {
    if (!selectedService.value || !selectedStaff.value) return

    isLoading.value = true
    error.value = null

    try {
      const today = new Date().toISOString().split('T')[0]
      availableDates.value = await altegService.fetchAvailableDates(
        selectedStaff.value.id,
        selectedService.value.id,
        today
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки дат'
      console.error('Failed to load available dates:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function loadAvailableSlots() {
    if (!selectedService.value || !selectedStaff.value || !selectedDate.value) return

    isLoading.value = true
    error.value = null

    try {
      availableSlots.value = await altegService.fetchAvailableTime(
        selectedStaff.value.id,
        selectedService.value.id,
        selectedDate.value
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки времени'
      console.error('Failed to load available slots:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function createBooking() {
    if (!selectedService.value || !selectedStaff.value || !selectedTime.value || !clientInfo.value) {
      error.value = 'Заполните все поля'
      return false
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await altegService.createBooking({
        service_id: selectedService.value.id,
        staff_id: selectedStaff.value.id,
        datetime: selectedTime.value.datetime,
        client: clientInfo.value,
      })

      bookingResult.value = result
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка создания записи'
      console.error('Failed to create booking:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  function selectService(service: AltegService) {
    selectedService.value = service
    // Сброс последующих выборов
    selectedStaff.value = null
    selectedDate.value = null
    selectedTime.value = null
    staff.value = []
    availableDates.value = []
    availableSlots.value = []
  }

  function selectStaff(staffMember: AltegStaff) {
    selectedStaff.value = staffMember
    // Сброс последующих выборов
    selectedDate.value = null
    selectedTime.value = null
    availableDates.value = []
    availableSlots.value = []
  }

  function selectDate(date: string) {
    selectedDate.value = date
    // Сброс времени
    selectedTime.value = null
    availableSlots.value = []
  }

  function selectTime(slot: AltegScheduleSlot) {
    selectedTime.value = slot
  }

  function setClientInfo(info: ClientInfo) {
    clientInfo.value = info
  }

  function nextStep() {
    const steps: BookingStep[] = ['service', 'staff', 'date', 'time', 'confirmation']
    const currentIndex = steps.indexOf(currentStep.value)

    if (currentIndex < steps.length - 1 && canGoNext.value) {
      currentStep.value = steps[currentIndex + 1]

      // Автозагрузка данных при переходе на следующий шаг
      switch (currentStep.value) {
        case 'staff':
          loadStaff()
          break
        case 'date':
          loadAvailableDates()
          break
        case 'time':
          loadAvailableSlots()
          break
      }
    }
  }

  function prevStep() {
    const steps: BookingStep[] = ['service', 'staff', 'date', 'time', 'confirmation']
    const currentIndex = steps.indexOf(currentStep.value)

    if (currentIndex > 0) {
      currentStep.value = steps[currentIndex - 1]
    }
  }

  function goToStep(step: BookingStep) {
    currentStep.value = step
  }

  function resetBooking() {
    currentStep.value = 'service'
    selectedService.value = null
    selectedStaff.value = null
    selectedDate.value = null
    selectedTime.value = null
    clientInfo.value = null
    services.value = []
    staff.value = []
    availableDates.value = []
    availableSlots.value = []
    error.value = null
    bookingResult.value = null
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    currentStep,
    selectedService,
    selectedStaff,
    selectedDate,
    selectedTime,
    clientInfo,
    services,
    staff,
    availableDates,
    availableSlots,
    isLoading,
    error,
    bookingResult,

    // Computed
    canGoNext,
    canGoBack,
    stepIndex,
    totalSteps,
    progress,

    // Actions
    loadServices,
    loadStaff,
    loadAvailableDates,
    loadAvailableSlots,
    createBooking,
    selectService,
    selectStaff,
    selectDate,
    selectTime,
    setClientInfo,
    nextStep,
    prevStep,
    goToStep,
    resetBooking,
    clearError,
  }
})

