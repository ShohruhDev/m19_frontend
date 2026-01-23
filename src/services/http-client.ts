/**
 * HTTP Client Configuration
 * Настроенный Axios instance с interceptors и retry logic
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

interface RetryConfig extends AxiosRequestConfig {
  _retry?: number
  _retryDelay?: number
}

class HttpClient {
  private client: AxiosInstance
  private readonly maxRetries = 3
  private readonly retryDelay = 1000

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Можно добавить auth token, если понадобится
        // config.headers.Authorization = `Bearer ${token}`
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as RetryConfig

        if (!config) {
          return Promise.reject(error)
        }

        // Retry logic
        config._retry = config._retry ?? 0

        if (this.shouldRetry(error) && config._retry < this.maxRetries) {
          config._retry += 1

          // Exponential backoff
          const delay = this.retryDelay * Math.pow(2, config._retry - 1)
          await this.sleep(delay)

          return this.client(config)
        }

        return Promise.reject(this.normalizeError(error))
      }
    )
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry на network errors и 5xx errors
    if (!error.response) {
      return true
    }

    const status = error.response.status
    return status >= 500 && status <= 599
  }

  private normalizeError(error: AxiosError): Error {
    if (error.response) {
      const data = error.response.data as any
      const message = data?.message || data?.error || 'Произошла ошибка при выполнении запроса'
      return new Error(message)
    }

    if (error.request) {
      return new Error('Не удалось связаться с сервером. Проверьте подключение к интернету.')
    }

    return new Error(error.message || 'Произошла неизвестная ошибка')
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Public methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config)
    return response.data
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config)
    return response.data
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config)
    return response.data
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config)
    return response.data
  }
}

// API endpoints configuration
const API_CONFIG = {
  // В production это должен быть URL вашего backend API
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
}

export const httpClient = new HttpClient(API_CONFIG.baseURL)

