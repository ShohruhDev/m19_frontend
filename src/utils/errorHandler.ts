/**
 * Error Handling Utilities
 * Единая обработка ошибок для всех сервисов
 */

import type { PostgrestError } from '@supabase/supabase-js'
import type { ApiError } from '@/types/database.types'

/**
 * Нормализует ошибки из разных источников в единый формат
 */
export function normalizeError(error: unknown): ApiError {
  // Supabase PostgrestError
  if (isPostgrestError(error)) {
    return {
      message: error.message || 'Database error occurred',
      code: error.code,
      details: error.details,
    }
  }

  // JavaScript Error
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'JS_ERROR',
    }
  }

  // String error
  if (typeof error === 'string') {
    return {
      message: error,
      code: 'UNKNOWN_ERROR',
    }
  }

  // Unknown error
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    details: error,
  }
}

/**
 * Type guard для PostgrestError
 */
function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'code' in error
  )
}

/**
 * Проверяет является ли ошибка ошибкой сети
 */
export function isNetworkError(error: ApiError): boolean {
  return (
    error.code === 'PGRST301' || // Network error
    error.message.toLowerCase().includes('network') ||
    error.message.toLowerCase().includes('fetch')
  )
}

/**
 * Проверяет является ли ошибка ошибкой доступа
 */
export function isPermissionError(error: ApiError): boolean {
  return (
    error.code === 'PGRST301' ||
    error.code === '42501' || // insufficient_privilege
    error.message.toLowerCase().includes('permission') ||
    error.message.toLowerCase().includes('denied')
  )
}

/**
 * Проверяет является ли ошибка ошибкой валидации
 */
export function isValidationError(error: ApiError): boolean {
  return (
    error.code === '23505' || // unique_violation
    error.code === '23503' || // foreign_key_violation
    error.code === '23502' || // not_null_violation
    error.code === '23514'    // check_violation
  )
}

/**
 * Форматирует ошибку для пользователя (user-friendly message)
 */
export function formatErrorMessage(error: ApiError): string {
  // Network errors
  if (isNetworkError(error)) {
    return 'Проблема с подключением к серверу. Проверьте интернет-соединение.'
  }

  // Permission errors
  if (isPermissionError(error)) {
    return 'У вас нет прав для выполнения этой операции.'
  }

  // Validation errors
  if (isValidationError(error)) {
    if (error.code === '23505') {
      return 'Запись с такими данными уже существует.'
    }
    if (error.code === '23503') {
      return 'Невозможно выполнить операцию: связанные данные не найдены.'
    }
    if (error.code === '23502') {
      return 'Заполните все обязательные поля.'
    }
    return 'Проверьте правильность введенных данных.'
  }

  // Default message
  return error.message || 'Произошла ошибка при выполнении операции.'
}

/**
 * Логирует ошибку (только в dev режиме)
 */
export function logError(context: string, error: unknown): void {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error)
  }
}

