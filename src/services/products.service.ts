/**
 * Products Service
 * Управление продуктами (косметикой) в базе данных
 */

import { supabase } from '@/lib/supabaseClient'
import type {
  Product,
  ProductInsert,
  ProductUpdate,
  ProductFilters,
  ApiResponse,
} from '@/types/database.types'
import { normalizeError, logError } from '@/utils/errorHandler'

/**
 * Получить список продуктов с фильтрацией
 */
export async function listProducts(
  filters: ProductFilters = {}
): Promise<ApiResponse<Product[]>> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    // Фильтр: только активные
    if (filters.activeOnly) {
      query = query.eq('active', true)
    }

    // Фильтр: по категории
    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    // Фильтр: поиск по названию
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
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
      logError('listProducts', error)
      return { data: null, error: normalizeError(error) }
    }

    return { data: data || [], error: null }
  } catch (err) {
    logError('listProducts', err)
    return { data: null, error: normalizeError(err) }
  }
}

/**
 * Получить один продукт по ID
 */
export async function getProduct(id: string): Promise<ApiResponse<Product>> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      logError('getProduct', error)
      return { data: null, error: normalizeError(error) }
    }

    return { data, error: null }
  } catch (err) {
    logError('getProduct', err)
    return { data: null, error: normalizeError(err) }
  }
}

/**
 * Создать новый продукт
 */
export async function createProduct(
  productData: ProductInsert
): Promise<ApiResponse<Product>> {
  try {
    // Валидация
    if (!productData.name || !productData.description) {
      return {
        data: null,
        error: {
          message: 'Название и описание обязательны',
          code: 'VALIDATION_ERROR',
        },
      }
    }

    if (productData.price <= 0) {
      return {
        data: null,
        error: {
          message: 'Цена должна быть больше нуля',
          code: 'VALIDATION_ERROR',
        },
      }
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        ...productData,
        active: productData.active ?? true,
        stock: productData.stock || 0,
      })
      .select()
      .single()

    if (error) {
      logError('createProduct', error)
      return { data: null, error: normalizeError(error) }
    }

    return { data, error: null }
  } catch (err) {
    logError('createProduct', err)
    return { data: null, error: normalizeError(err) }
  }
}

/**
 * Обновить продукт
 */
export async function updateProduct(
  id: string,
  updates: ProductUpdate
): Promise<ApiResponse<Product>> {
  try {
    // Валидация
    if (updates.price !== undefined && updates.price <= 0) {
      return {
        data: null,
        error: {
          message: 'Цена должна быть больше нуля',
          code: 'VALIDATION_ERROR',
        },
      }
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logError('updateProduct', error)
      return { data: null, error: normalizeError(error) }
    }

    return { data, error: null }
  } catch (err) {
    logError('updateProduct', err)
    return { data: null, error: normalizeError(err) }
  }
}

/**
 * Удалить продукт (мягкое удаление - деактивация)
 */
export async function deleteProduct(id: string): Promise<ApiResponse<boolean>> {
  try {
    // Мягкое удаление - просто деактивируем
    const { error } = await supabase
      .from('products')
      .update({ active: false })
      .eq('id', id)

    if (error) {
      logError('deleteProduct', error)
      return { data: null, error: normalizeError(error) }
    }

    return { data: true, error: null }
  } catch (err) {
    logError('deleteProduct', err)
    return { data: null, error: normalizeError(err) }
  }
}

/**
 * Жесткое удаление продукта (используйте с осторожностью!)
 */
export async function hardDeleteProduct(id: string): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      logError('hardDeleteProduct', error)
      return { data: null, error: normalizeError(error) }
    }

    return { data: true, error: null }
  } catch (err) {
    logError('hardDeleteProduct', err)
    return { data: null, error: normalizeError(err) }
  }
}

/**
 * Обновить остаток товара на складе
 */
export async function updateStock(
  id: string,
  quantity: number
): Promise<ApiResponse<Product>> {
  try {
    if (quantity < 0) {
      return {
        data: null,
        error: {
          message: 'Количество не может быть отрицательным',
          code: 'VALIDATION_ERROR',
        },
      }
    }

    const { data, error } = await supabase
      .from('products')
      .update({ stock: quantity })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logError('updateStock', error)
      return { data: null, error: normalizeError(error) }
    }

    return { data, error: null }
  } catch (err) {
    logError('updateStock', err)
    return { data: null, error: normalizeError(err) }
  }
}

/**
 * Получить продукты по категории
 */
export async function getProductsByCategory(
  category: string
): Promise<ApiResponse<Product[]>> {
  return listProducts({ category, activeOnly: true })
}

/**
 * Поиск продуктов
 */
export async function searchProducts(
  searchTerm: string
): Promise<ApiResponse<Product[]>> {
  return listProducts({ search: searchTerm, activeOnly: true })
}

