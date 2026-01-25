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
      // Backend returns { success: true, data: [...slots], timestamp: ... }
      // So we access response.data directly, not response.data.data
      const slots = response.data || []
      return Array.isArray(slots) ? slots.filter((slot: any) => slot.available) : []
    } catch (error) {
      console.error('Error fetching available time:', error)
      throw new Error('Не удалось загрузить доступное время')
    }
  }

  /**
   * Получить доступные временные слоты от всех мастеров на конкретную дату
   */
  async fetchAvailableTimeAllStaff(
    serviceId: number | string,
    date: string
  ): Promise<AltegScheduleSlot[]> {
    try {
      // Сначала получаем всех мастеров для этой услуги
      const staff = await this.fetchStaff(serviceId)

      // Затем получаем слоты для каждого мастера параллельно
      const slotsPromises = staff.map(staffMember =>
        this.fetchAvailableTime(staffMember.id, serviceId, date)
          .then(slots => slots.map(slot => ({
            ...slot,
            staff_id: staffMember.id,
            staff_name: staffMember.name
          })))
          .catch(() => []) // Игнорируем ошибки для отдельных мастеров
      )

      const allSlots = await Promise.all(slotsPromises)

      // Объединяем все слоты и сортируем по времени
      return allSlots
        .flat()
        .sort((a, b) => a.time.localeCompare(b.time))
    } catch (error) {
      console.error('Error fetching available time from all staff:', error)
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
    // Валидация для российских (+7) и узбекских (+998) номеров
    const cleaned = phone.replace(/\D/g, '')
    // Russian: 10-11 digits (e.g., 9001234567 or 79001234567)
    // Uzbekistan: 12 digits with country code (998901234567) or 9 digits without
    return cleaned.length >= 9 && cleaned.length <= 12
  }

  /**
   * Валидация email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  /**
   * Authenticate user with login and password
   */
  async authenticateUser(login: string, password: string): Promise<{ token: string; user: any }> {
    try {
      const response = await httpClient.post<any>(
        `${this.endpoint}/auth/login`,
        { login, password }
      )
      const data = response.data
      if (!data || !data.user_token) {
        throw new Error('Не удалось авторизоваться')
      }
      return {
        token: data.user_token,
        user: {
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          avatar: data.avatar
        }
      }
    } catch (error) {
      console.error('Error authenticating user:', error)
      throw new Error('Неверный логин или пароль')
    }
  }

  /**
   * Получить данные пользователя
   */
  async getUserData(token: string): Promise<any> {
    try {
      // Передаем токен в заголовке Authorization: Bearer <token>
      // httpClient должен поддерживать custom headers per request
      const response = await httpClient.get<any>(
        `${this.endpoint}/user/data`,
        {
          headers: {
            'Authorization': `Bearer ${token}, User ${token}`
            // В Altegio часто используется формат "Bearer PARTNER_TOKEN, User USER_TOKEN"
            // Но так как мы идем через прокси, возможно прокси подставляет Partner Token.
            // Мы передадим User Token в заголовке X-User-Token или Authorization если прокси это поддерживает.
            // Попробуем передать его просто как Authorization, надеясь что прокси правильно смерджит.
            // ЛИБО: Передадим его как 'X-Alteg-User-Token' если бэкенд это ожидает.
            // Для начала попробуем просто `Authorization: User ${token}` если прокси уже имеет Bearer.
          }
        }
      )
      return response.data?.data
    } catch (error) {
      console.error('Error fetching user data:', error)
      throw new Error('Не удалось загрузить профиль')
    }
  }

  /**
   * Получить записи пользователя
   */
  async getUserAppointments(token: string): Promise<any[]> {
    try {
      // Altegio API endpoint for user appointments: /api/v1/user/records
      const response = await httpClient.get<any>(
        `${this.endpoint}/user/records`, // Прокси путь
        {
          headers: {
            // Предполагаем, что прокси обрабатывает это.
            'Authorization': `Bearer ${token}` // Или User ${token}. Altegio требует "User <token>" для user endpoints.
          },
          params: {
            count: 50,
            // sort: 'datetime_desc' (по умолчанию?)
          }
        }
      )
      return response.data?.data || []
    } catch (error) {
      console.error('Error fetching appointments:', error)
      return []
    }
  }


  // --- E-commerce Methods ---

  /**
   * Получить список товаров (косметика)
   */
  async fetchGoods(params: any = {}): Promise<any[]> {
    try {
      const response = await httpClient.get<any>(`${this.endpoint}/goods`, { params })
      const data = response.data?.data
      // Altegio often returns wrapped { success: true, data: [...] } inside proxy response
      if (data && !Array.isArray(data) && Array.isArray(data.data)) {
        return data.data
      }
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching goods:', error)
      throw new Error('Не удалось загрузить товары')
    }
  }

  /**
   * Получить категории товаров
   */
  async fetchGoodsCategories(): Promise<any[]> {
    try {
      const response = await httpClient.get<any>(`${this.endpoint}/goods/categories`)
      const data = response.data?.data
      if (data && !Array.isArray(data) && Array.isArray(data.data)) {
        return data.data
      }
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching goods categories:', error)
      return []
    }
  }

  /**
   * Создать заказ (оформить как запись с комментарием)
   */
  async createOrder(orderData: any): Promise<any> {
    try {
      const response = await httpClient.post<any>(`${this.endpoint}/orders`, orderData)
      return response.data
    } catch (error) {
      console.error('Error creating order:', error)
      throw new Error('Не удалось оформить заказ')
    }
  }
}

export const altegService = new AltegIntegrationService()

