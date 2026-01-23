/**
 * Alteg API Types
 * Типизация для интеграции с Alteg booking system
 */

export interface AltegService {
  id: number | string
  title: string
  description?: string
  price_min: number
  price_max: number
  duration: number // в минутах
  category_id?: number
  image_url?: string
  popularity?: number
}

export interface AltegServiceCategory {
  id: number
  title: string
  services: AltegService[]
}

export interface AltegStaff {
  id: number | string
  name: string
  specialization?: string
  avatar_url?: string
  avatar?: string
  avatar_big?: string
  rating?: number
  reviews_count?: number
  experience_years?: number
  description?: string
  information?: string
  services?: number[] // ID услуг, которые выполняет
  next_slots?: { time: string; date: string }[] // Quick availability slots
}

export interface AltegScheduleSlot {
  time: string // HH:mm format
  datetime: string // ISO 8601
  available: boolean
  staff_id: number | string
}

export interface AltegAvailableDate {
  date: string // YYYY-MM-DD
  slots_count: number
}

export interface AltegBookingPayload {
  service_id: number | string
  staff_id: number | string
  datetime: string // ISO 8601
  client: {
    name: string
    phone: string
    email?: string
    comment?: string
  }
}

export interface AltegBookingResponse {
  id: number | string
  status: 'confirmed' | 'pending' | 'cancelled'
  service: AltegService
  staff: AltegStaff
  datetime: string
  client: {
    name: string
    phone: string
  }
  code?: string // код для отмены
}

export interface AltegApiError {
  error: string
  error_code?: string
  message: string
  status?: number
}

