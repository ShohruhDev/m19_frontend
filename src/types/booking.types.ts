/**
 * Booking Flow Types
 * Типы для процесса онлайн-записи
 */

export type BookingStep = 'service' | 'staff' | 'time' | 'confirmation'

export interface BookingState {
  currentStep: BookingStep
  selectedService: number | string | null
  selectedStaff: number | string | null
  selectedDate: string | null // YYYY-MM-DD
  selectedTime: string | null // HH:mm
  clientInfo: ClientInfo | null
  isLoading: boolean
  error: string | null
}

export interface ClientInfo {
  name: string
  phone: string
  email?: string
  comment?: string
}

export interface BookingStepConfig {
  step: BookingStep
  title: string
  subtitle: string
  isValid: boolean
  canGoNext: boolean
  canGoBack: boolean
}

