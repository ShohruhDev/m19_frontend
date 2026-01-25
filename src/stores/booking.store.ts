/**
 * Booking Store
 * Управление состоянием процесса онлайн-записи
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { altegService } from '@/services'
import type {
  BookingStep,
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
  const showAllStaff = ref(false) // Переключатель "Все специалисты"
  const notifyBySms = ref<number>(0)

  // Computed
  const canGoNext = computed(() => {
    switch (currentStep.value) {
      case 'service':
        return selectedService.value !== null
      case 'staff':
        return selectedStaff.value !== null || showAllStaff.value // Can go next if staff selected or 'show all staff' is active
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
    const steps: BookingStep[] = ['service', 'staff', 'time', 'confirmation']
    return steps.indexOf(currentStep.value)
  })

  const totalSteps = computed(() => 4)

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
      const staffList = await altegService.fetchStaff(selectedService.value.id, true)
      staff.value = staffList

      // Проверяем, может ли текущий выбранный мастер выполнять эту услугу
      if (selectedStaff.value) {
        const isStaffValid = staffList.some(s => s.id === selectedStaff.value?.id)
        if (!isStaffValid) {
          selectedStaff.value = null
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки мастеров'
      console.error('Failed to load staff:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function loadAvailableSlots() {
    if (!selectedService.value || !selectedDate.value) return

    // Если showAllStaff включен или мастер не выбран, загружаем слоты всех мастеров
    if (showAllStaff.value || !selectedStaff.value) {
      return loadAvailableSlotsAllStaff()
    }

    // Иначе загружаем слоты выбранного мастера
    // This check is now redundant due to the above condition: if we reach here, selectedStaff.value must be true.
    // if (!selectedStaff.value) return

    isLoading.value = true
    error.value = null

    try {
      const slots = await altegService.fetchAvailableTime(
        selectedStaff.value.id,
        selectedService.value.id,
        selectedDate.value
      )

      // Filter out past time slots if the selected date is today
      const today = new Date().toISOString().split('T')[0]
      const isToday = selectedDate.value === today

      if (isToday) {
        const now = new Date()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()

        availableSlots.value = slots.filter(slot => {
          const [slotHour, slotMinute] = slot.time.split(':').map(Number)
          // Keep slot if it's in the future (hour is greater, or same hour but minute is greater)
          return slotHour > currentHour || (slotHour === currentHour && slotMinute > currentMinute)
        })
      } else {
        availableSlots.value = slots
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки времени'
      console.error('Failed to load available slots:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function loadAvailableSlotsAllStaff() {
    if (!selectedService.value || !selectedDate.value) return

    isLoading.value = true
    error.value = null

    try {
      const slots = await altegService.fetchAvailableTimeAllStaff(
        selectedService.value.id,
        selectedDate.value
      )

      // Filter out past time slots if the selected date is today
      const today = new Date().toISOString().split('T')[0]
      const isToday = selectedDate.value === today

      if (isToday) {
        const now = new Date()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()

        availableSlots.value = slots.filter(slot => {
          const [slotHour, slotMinute] = slot.time.split(':').map(Number)
          return slotHour > currentHour || (slotHour === currentHour && slotMinute > currentMinute)
        })
      } else {
        availableSlots.value = slots
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки времени'
      console.error('Failed to load available slots from all staff:', err)
    } finally {
      isLoading.value = false
    }
  }

  function toggleShowAllStaff() {
    showAllStaff.value = !showAllStaff.value
    // Перезагрузить слоты при переключении
    if (selectedDate.value) {
      loadAvailableSlots()
    }
  }

  function setNotifyBySms(hours: number) {
    notifyBySms.value = hours
  }

  async function createBooking() {
    if (!selectedService.value || !selectedTime.value || !clientInfo.value) {
      return false
    }

    isLoading.value = true
    error.value = null

    // Determine staff ID (selected staff or from slot if 'All Specialists' mode)
    const staffId = showAllStaff.value && selectedTime.value.staff_id
      ? selectedTime.value.staff_id
      : selectedStaff.value?.id

    if (!staffId) {
      error.value = 'Не выбран мастер'
      return false
    }

    try {
      const result = await altegService.createBooking({
        service_id: selectedService.value.id,
        staff_id: staffId,
        datetime: selectedTime.value.datetime,
        notify_by_sms: notifyBySms.value || undefined, // Send only if set
        client: clientInfo.value,
      })

      // Сформировать ответ для отображения (приводим к типу AltegBookingResponse)
      const recordData = (result.data && result.data.data && result.data.data[0]) ? result.data.data[0] : {}

      // Определяем мастера (если был выбран "Любой", берем из слота)
      const staffDefault = {
        id: selectedTime.value.staff_id || 0,
        name: selectedTime.value.staff_name || 'Мастер',
        avatar_url: undefined,
        avatar: undefined,
        avatar_big: undefined
      }
      const staffData: AltegStaff = selectedStaff.value ? selectedStaff.value : staffDefault

      // Type assertion or manual mapping to satisfy AltegBookingResponse
      const finalResult: AltegBookingResponse = {
        id: recordData.record_id || Date.now(),
        status: 'confirmed',
        service: selectedService.value,
        staff: staffData,
        datetime: selectedTime.value.datetime,
        client: {
          name: clientInfo.value.name,
          phone: clientInfo.value.phone
        },
        code: recordData.record_id ? String(recordData.record_id) : undefined
      }

      bookingResult.value = finalResult
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
    // Очистить ошибку при выборе
    error.value = null
    // Сброс последующих выборов (кроме мастера - его валидируем в loadStaff)
    selectedDate.value = null
    selectedTime.value = null
    // staff.value = [] // Не очищаем список мастеров сразу, позволим loadStaff обновить его
    availableDates.value = []
    availableSlots.value = []
  }

  function selectStaff(staffMember: AltegStaff) {
    selectedStaff.value = staffMember
    // Очистить ошибку при выборе
    error.value = null
    // Сброс последующих выборов
    selectedDate.value = null
    selectedTime.value = null
    availableDates.value = []
    availableSlots.value = []
  }

  function selectDate(date: string) {
    selectedDate.value = date
    // Очистить ошибку при выборе
    error.value = null
    // Сброс времени
    selectedTime.value = null
    availableSlots.value = []
  }

  function selectTime(slot: AltegScheduleSlot) {
    selectedTime.value = slot
    // Очистить ошибку при выборе
    error.value = null
  }

  function setClientInfo(info: ClientInfo) {
    clientInfo.value = info
  }

  function nextStep() {
    const steps: BookingStep[] = ['service', 'staff', 'time', 'confirmation']
    const currentIndex = steps.indexOf(currentStep.value)

    if (currentIndex < steps.length - 1 && canGoNext.value) {
      // Очистить ошибку при переходе на следующий шаг
      error.value = null
      currentStep.value = steps[currentIndex + 1]

      // Автозагрузка данных при переходе на следующий шаг
      switch (currentStep.value) {
        case 'staff':
          loadStaff()
          break
        case 'time':
          // Time selection will handle loading slots based on selected date
          break
      }
    }
  }

  function prevStep() {
    const steps: BookingStep[] = ['service', 'staff', 'time', 'confirmation']
    const currentIndex = steps.indexOf(currentStep.value)

    if (currentIndex > 0) {
      // Очистить ошибку при возврате назад
      error.value = null
      currentStep.value = steps[currentIndex - 1]
    }
  }

  function goToStep(step: BookingStep) {
    // Очистить ошибку при переходе к конкретному шагу
    error.value = null
    currentStep.value = step
  }

  /**
   * Инициализация бронирования с предзаполненными данными
   * Автоматически переходит к первому незаполненному шагу
   */
  function initializeBooking(options?: {
    service?: AltegService
    staff?: AltegStaff
  }) {
    // Предзаполнить данные если переданы
    if (options?.service) {
      selectedService.value = options.service
    }
    if (options?.staff) {
      selectedStaff.value = options.staff
    }

    // Определить первый незаполненный шаг
    const steps: BookingStep[] = ['service', 'staff', 'time', 'confirmation']

    // Найти первый незаполненный шаг
    for (const step of steps) {
      switch (step) {
        case 'service':
          if (!selectedService.value) {
            currentStep.value = 'service'
            return
          }
          break
        case 'staff':
          if (!selectedStaff.value && !showAllStaff.value) {
            currentStep.value = 'staff'
            // Загрузить мастеров для выбранной услуги
            if (selectedService.value) {
              loadStaff()
            }
            return
          }
          break
        case 'time':
          if (!selectedTime.value) {
            currentStep.value = 'time'
            return
          }
          break
        case 'confirmation':
          currentStep.value = 'confirmation'
          return
      }
    }

    // Если все заполнено, идем на подтверждение
    currentStep.value = 'confirmation'
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
    showAllStaff,
    notifyBySms,

    // Computed
    canGoNext,
    canGoBack,
    stepIndex,
    totalSteps,
    progress,

    // Actions
    loadServices,
    loadStaff,
    loadAvailableSlots,
    createBooking,
    selectService,
    selectStaff,
    selectDate,
    selectTime,
    setClientInfo,
    setNotifyBySms,
    nextStep,
    prevStep,
    goToStep,
    initializeBooking,
    resetBooking,
    clearError,
    toggleShowAllStaff,
  }
})

