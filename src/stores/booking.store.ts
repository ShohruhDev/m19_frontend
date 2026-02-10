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
  const selectedServices = ref<AltegService[]>([])
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
  const notifyBySms = ref<number>(0)

  // Computed
  const canGoNext = computed(() => {
    switch (currentStep.value) {
      case 'service':
        return selectedServices.value.length > 0
      case 'staff':
        return selectedStaff.value !== null
      case 'time':
        return selectedTime.value !== null
      case 'confirmation':
        return false
      default:
        return false
    }
  })

  const canGoBack = computed(() => {
    return currentStep.value !== 'service' && currentStep.value !== 'confirmation'
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
    if (selectedServices.value.length === 0) return

    isLoading.value = true
    error.value = null

    try {
      // Use the first selected service to filter staff
      // Ideal implementation would find intersection of staff who can do ALL services
      const primaryService = selectedServices.value[0]
      const staffList = await altegService.fetchStaff(primaryService.id, true)
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
    if (selectedServices.value.length === 0 || !selectedDate.value || !selectedStaff.value) return
    const primaryService = selectedServices.value[0]

    isLoading.value = true
    error.value = null

    try {
      let slots: AltegScheduleSlot[] = []

      // Если выбран "Любой мастер" (id === 0), загружаем слоты всех мастеров
      if (selectedStaff.value.id === 0) {
        slots = await altegService.fetchAvailableTimeAllStaff(
          primaryService.id,
          selectedDate.value
        )
      } else {
        // Иначе загружаем слоты конкретного мастера
        slots = await altegService.fetchAvailableTime(
          selectedStaff.value.id,
          primaryService.id,
          selectedDate.value
        )
      }

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



  function setNotifyBySms(hours: number) {
    notifyBySms.value = hours
  }

  async function createBooking() {
    if (selectedServices.value.length === 0 || !selectedTime.value || !clientInfo.value) {
      return false
    }

    isLoading.value = true
    error.value = null

    // Если выбран "Любой мастер", берем ID мастера из выбранного слота
    let staffId = selectedStaff.value?.id
    if (staffId === 0 && selectedTime.value.staff_id) {
      staffId = Number(selectedTime.value.staff_id)
    }

    if (!staffId) {
      error.value = 'Не удалось определить мастера'
      return false
    }

    try {
      const primaryService = selectedServices.value[0]
      const serviceIds = selectedServices.value.map(s => s.id)

      const result = await altegService.createBooking({
        service_id: primaryService.id,
        service_ids: serviceIds,
        staff_id: staffId,
        datetime: selectedTime.value.datetime,
        notify_by_sms: notifyBySms.value || undefined, // Send only if set
        client: clientInfo.value,
      })

      // Сформировать ответ для отображения (приводим к типу AltegBookingResponse)
      // result is already the unwraped data from altegService
      const recordData: any = result

      // Определяем мастера для отображения в подтверждении
      let finalStaff = selectedStaff.value
      // Если был "Любой мастер", нужно найти реального мастера из services.staff или по ID
      if (!finalStaff || finalStaff.id === 0) {
        // Попробуем найти в списке загруженных мастеров
        const found = staff.value.find(s => s.id === staffId)
        if (found) {
          finalStaff = found
        } else {
          // Fallback
          finalStaff = {
            id: staffId,
            name: selectedTime.value.staff_name || 'Мастер',
            avatar: undefined,
            avatar_big: undefined,
            specialization: 'Barber'
          }
        }
      }

      const finalResult: AltegBookingResponse = {
        id: recordData.record_id || Date.now(),
        status: 'confirmed',
        service: primaryService, // API response structure might differ, using primary for now
        staff: finalStaff,
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

  function toggleService(service: AltegService) {
    const index = selectedServices.value.findIndex(s => s.id === service.id)
    if (index === -1) {
      selectedServices.value.push(service)
    } else {
      selectedServices.value.splice(index, 1)
    }

    // Очистить ошибку при выборе
    error.value = null
    // Сброс последующих выборов
    selectedDate.value = null
    selectedTime.value = null
    availableDates.value = []
    availableSlots.value = []
    // Reset staff selection if services change
    selectedStaff.value = null
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
      selectedServices.value = [options.service]
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
          if (selectedServices.value.length === 0) {
            currentStep.value = 'service'
            return
          }
          break
        case 'staff':
          if (!selectedStaff.value) {
            currentStep.value = 'staff'
            // Загрузить мастеров для выбранной услуги
            if (selectedServices.value.length > 0) {
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
    selectedServices.value = []
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
    selectedServices,
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
    toggleService,
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
  }
})

