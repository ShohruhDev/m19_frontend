/**
 * Reviews Service
 * Управление отзывами клиентов
 */

import { supabase } from '@/lib/supabaseClient'
import type {
  Review,
  ReviewInsert,
  ReviewUpdate,
  ReviewFilters,
  ApiResponse,
} from '@/types/database.types'
import { normalizeError, logError } from '@/utils/errorHandler'

/**
 * Получить список отзывов с фильтрацией
 */
export async function listReviews(
  filters: ReviewFilters = {}
): Promise<ApiResponse<Review[]>> {
  try {
    let query = supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    // Фильтр: только одобренные
    if (filters.approvedOnly) {
      query = query.eq('approved', true)
    }

    // Фильтр: минимальный рейтинг
    if (filters.minRating) {
      query = query.gte('rating', filters.minRating)
    }

    // Пагинация
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      logError('listReviews', error)
      return { data: null, error: normalizeError(error) }
    }

    return { data: data || [], error: null }
  } catch (err) {
    logError('listReviews', err)
    return { data: null, error: normalizeError(err) }
  }
}

/**
 * Получить один отзыв по ID
 */
export async function getReview(id: string): Promise<ApiResponse<Review>> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      logError('getReview', error)
      return { data: null, error: normalizeError(error) }
    }

    return { data, error: null }
  } catch (err) {
    logError('getReview', err)
    return { data: null, error: normalizeError(err) }
  }
}

/**
 * Создать новый отзыв
 */
export async function createReview(
  reviewData: ReviewInsert
): Promise<ApiResponse<Review>> {
  try {
    // Валидация
    if (!reviewData.author || !reviewData.text) {
      return {
        data: null,
        error: {
          message: 'Укажите имя и текст отзыва',
          code: 'VALIDATION_ERROR',
        },
      }
    }

    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return {
        data: null,
        error: {
          message: 'Рейтинг должен быть от 1 до 5',
          code: 'VALIDATION_ERROR',
        },
      }
    }

    if (reviewData.text.length < 10) {
      return {
        data: null,
        error: {
          message: 'Отзыв должен быть не менее 10 символов',
          code: 'VALIDATION_ERROR',
        },
      }
    }

    if (reviewData.text.length > 1000) {
      return {
        data: null,
        error: {
          message: 'Отзыв должен быть не более 1000 символов',
          code: 'VALIDATION_ERROR',
        },
      }
    }

    // Новые отзывы требуют модерации
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        ...reviewData,
        approved: false, // Всегда false для новых отзывов
      })
      .select()
      .single()

    if (error) {
      logError('createReview', error)
      return { data: null, error: normalizeError(error) }
    }

    return { data, error: null }
  } catch (err) {
    logError('createReview', err)
    return { data: null, error: normalizeError(err) }
  }
}

/**
 * Одобрить/отклонить отзыв (модерация)
 */
export async function approveReview(
  id: string,
  approved: boolean
): Promise<ApiResponse<Review>> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({ approved, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logError('approveReview', error)
      return { data: null, error: normalizeError(error) }
    }

    return { data, error: null }
  } catch (err) {
    logError('approveReview', err)
    return { data: null, error: normalizeError(err) }
  }
}

/**
 * Обновить отзыв
 */
export async function updateReview(
  id: string,
  updates: ReviewUpdate
): Promise<ApiResponse<Review>> {
  try {
    // Валидация рейтинга
    if (updates.rating !== undefined) {
      if (updates.rating < 1 || updates.rating > 5) {
        return {
          data: null,
          error: {
            message: 'Рейтинг должен быть от 1 до 5',
            code: 'VALIDATION_ERROR',
          },
        }
      }
    }

    // Валидация текста
    if (updates.text !== undefined) {
      if (updates.text.length < 10) {
        return {
          data: null,
          error: {
            message: 'Отзыв должен быть не менее 10 символов',
            code: 'VALIDATION_ERROR',
          },
        }
      }
      if (updates.text.length > 1000) {
        return {
          data: null,
          error: {
            message: 'Отзыв должен быть не более 1000 символов',
            code: 'VALIDATION_ERROR',
          },
        }
      }
    }

    const { data, error } = await supabase
      .from('reviews')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logError('updateReview', error)
      return { data: null, error: normalizeError(error) }
    }

    return { data, error: null }
  } catch (err) {
    logError('updateReview', err)
    return { data: null, error: normalizeError(err) }
  }
}

/**
 * Удалить отзыв
 */
export async function deleteReview(id: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) {
      logError('deleteReview', error)
      return { data: null, error: normalizeError(error) }
    }

    return { data: true, error: null }
  } catch (err) {
    logError('deleteReview', err)
    return { data: null, error: normalizeError(err) }
  }
}

/**
 * Получить одобренные отзывы
 */
export async function getApprovedReviews(): Promise<ApiResponse<Review[]>> {
  return listReviews({ approvedOnly: true })
}

/**
 * Получить отзывы на модерации
 */
export async function getPendingReviews(): Promise<ApiResponse<Review[]>> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: false })

    if (error) {
      logError('getPendingReviews', error)
      return { data: null, error: normalizeError(error) }
    }

    return { data: data || [], error: null }
  } catch (err) {
    logError('getPendingReviews', err)
    return { data: null, error: normalizeError(err) }
  }
}

/**
 * Получить статистику отзывов
 */
export async function getReviewStats(): Promise<ApiResponse<{
  total: number
  approved: number
  pending: number
  averageRating: number
}>> {
  try {
    const { count: total } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })

    const { count: approved } = await supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('approved', true)

    const { data: allReviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('approved', true)

    const averageRating = allReviews && allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0

    return {
      data: {
        total: total || 0,
        approved: approved || 0,
        pending: (total || 0) - (approved || 0),
        averageRating: Math.round(averageRating * 10) / 10,
      },
      error: null,
    }
  } catch (err) {
    logError('getReviewStats', err)
    return { data: null, error: normalizeError(err) }
  }
}

