/**
 * Alteg Service Layer
 * Абстракция над Alteg API для онлайн-записи
 *
 * ВАЖНО: Все запросы идут через backend proxy API
 * Frontend НЕ должен знать Alteg token
 */

import { httpClient } from './http-client'
import type {
  AltegService,
  AltegServiceCategory,
  AltegStaff,
  AltegScheduleSlot,
  AltegAvailableDate,
  AltegBookingPayload,
  AltegBookingResponse,
} from '@/types'

class AltegIntegrationService {
  private readonly endpoint = '/alteg'

  /**
   * Получить список всех услуг
   */
  async fetchServices(): Promise<AltegService[]> {
    try {
      const response = await httpClient.get<any>(
        `${this.endpoint}/services`
      )
      // Backend returns { success: true, data: { success: true, data: [...], meta: ... } }
      return response.data?.data || []
    } catch (error) {
      console.error('Error fetching services:', error)
      throw new Error('Не удалось загрузить список услуг')
    }
  }

  /**
   * Получить услуги по категориям
   */
  async fetchServicesByCategory(): Promise<AltegServiceCategory[]> {
    try {
      const response = await httpClient.get<any>(
        `${this.endpoint}/services/categories`
      )
      return response.data?.data || []
    } catch (error) {
      console.error('Error fetching services by category:', error)
      throw new Error('Не удалось загрузить категории услуг')
    }
  }

  /**
   * Получить информацию о конкретной услуге
   */
  async fetchServiceById(serviceId: number | string): Promise<AltegService> {
    try {
      const response = await httpClient.get<any>(
        `${this.endpoint}/services/${serviceId}`
      )
      return response.data?.data
    } catch (error) {
      console.error('Error fetching service:', error)
      throw new Error('Не удалось загрузить информацию об услуге')
    }
  }

  /**
   * Получить список сотрудников (барберов)
   */
  async fetchStaff(serviceId?: number | string, withSlots: boolean = false): Promise<AltegStaff[]> {
    try {
      const params: any = {}
      if (serviceId) params.service_id = serviceId
      if (withSlots) params.with_slots = 'true'

      const response = await httpClient.get<any>(
        `${this.endpoint}/staff`,
        { params }
      )
      return response.data?.data || []
    } catch (error) {
      console.error('Error fetching staff:', error)
      throw new Error('Не удалось загрузить список мастеров')
    }
  }

  /**
   * Получить информацию о конкретном сотруднике
   */
  async fetchStaffById(staffId: number | string): Promise<AltegStaff> {
    try {
      const response = await httpClient.get<any>(
        `${this.endpoint}/staff/${staffId}`
      )
      return response.data?.data
    } catch (error) {
      console.error('Error fetching staff member:', error)
      throw new Error('Не удалось загрузить информацию о мастере')
    }
  }

  /**
   * Получить доступные даты для записи
   */
  async fetchAvailableDates(
    staffId: number | string,
    serviceId: number | string,
    fromDate?: string
  ): Promise<AltegAvailableDate[]> {
    try {
      const params: any = {
        staff_id: staffId,
        service_id: serviceId,
      }

      if (fromDate) {
        params.from_date = fromDate
      }

      const response = await httpClient.get<any>(
        `${this.endpoint}/schedule/dates`,
        { params }
      )
      return response.data?.data || []
    } catch (error) {
      console.error('Error fetching available dates:', error)
      throw new Error('Не удалось загрузить доступные даты')
    }
  }

  /**
   * Получить доступные временные слоты на конкретную дату
   */
  async fetchAvailableTime(
    staffId: number | string,
    serviceId: number | string,
    date: string
  ): Promise<AltegScheduleSlot[]> {
    try {
      const response = await httpClient.get<any>(
        `${this.endpoint}/schedule/slots`,
        {
          params: {
            staff_id: staffId,
            service_id: serviceId,
            date,
          },
        }
      )
      // Ensure we have an array before filtering
      const slots = response.data?.data || []
      return Array.isArray(slots) ? slots.filter((slot: any) => slot.available) : []
    } catch (error) {
      console.error('Error fetching available time:', error)
      throw new Error('Не удалось загрузить доступное время')
    }
  }

  /**
   * Создать новую запись
   */
  async createBooking(payload: AltegBookingPayload): Promise<AltegBookingResponse> {
    try {
      // Валидация данных
      this.validateBookingPayload(payload)

      const response = await httpClient.post<any>(
        `${this.endpoint}/bookings`,
        payload
      )

      return response.data?.data
    } catch (error) {
      console.error('Error creating booking:', error)

      if (error instanceof Error) {
        throw error
      }

      throw new Error('Не удалось создать запись. Попробуйте еще раз.')
    }
  }

  /**
   * Отменить запись по коду
   */
  async cancelBooking(bookingId: number | string, code: string): Promise<void> {
    try {
      await httpClient.post(`${this.endpoint}/bookings/${bookingId}/cancel`, {
        code,
      })
    } catch (error) {
      console.error('Error canceling booking:', error)
      throw new Error('Не удалось отменить запись')
    }
  }

  /**
   * Валидация данных записи
   */
  private validateBookingPayload(payload: AltegBookingPayload): void {
    const { service_id, staff_id, datetime, client } = payload

    if (!service_id) {
      throw new Error('Не выбрана услуга')
    }

    if (!staff_id) {
      throw new Error('Не выбран мастер')
    }

    if (!datetime) {
      throw new Error('Не выбрано время')
    }

    if (!client.name || client.name.trim().length < 2) {
      throw new Error('Укажите корректное имя')
    }

    if (!client.phone || !this.isValidPhone(client.phone)) {
      throw new Error('Укажите корректный номер телефона')
    }

    if (client.email && !this.isValidEmail(client.email)) {
      throw new Error('Укажите корректный email')
    }
  }

  /**
   * Валидация телефона
   */
  private isValidPhone(phone: string): boolean {
    // Простая валидация для российских номеров
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length >= 10 && cleaned.length <= 11
  }

  /**
   * Валидация email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

export const altegService = new AltegIntegrationService()

