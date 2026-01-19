/**
 * Products Store
 * Pinia store для управления состоянием продуктов (косметики)
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, ProductInsert, ProductUpdate, ProductFilters } from '@/types/database.types'
import * as productsService from '@/services/products.service'
import { formatErrorMessage } from '@/utils/errorHandler'

export const useProductsStore = defineStore('products', () => {
  // State
  const products = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetch = ref<number>(0)

  // Cache duration (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000

  // Computed
  const activeProducts = computed(() =>
    products.value.filter(p => p.active)
  )

  const productsByCategory = computed(() => {
    const grouped: Record<string, Product[]> = {}
    products.value.forEach(product => {
      const category = product.category || 'Прочее'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(product)
    })
    return grouped
  })

  const isDataStale = computed(() => {
    return Date.now() - lastFetch.value > CACHE_DURATION
  })

  // Actions
  async function fetchProducts(filters: ProductFilters = {}, forceRefresh = false) {
    // Если данные свежие и не требуется принудительное обновление
    if (!forceRefresh && products.value.length > 0 && !isDataStale.value) {
      return
    }

    loading.value = true
    error.value = null

    const response = await productsService.listProducts(filters)

    if (response.error) {
      error.value = formatErrorMessage(response.error)
      loading.value = false
      return
    }

    products.value = response.data || []
    lastFetch.value = Date.now()
    loading.value = false
  }

  async function fetchProduct(id: string) {
    loading.value = true
    error.value = null

    const response = await productsService.getProduct(id)

    if (response.error) {
      error.value = formatErrorMessage(response.error)
      currentProduct.value = null
      loading.value = false
      return
    }

    currentProduct.value = response.data
    loading.value = false
  }

  async function createProduct(productData: ProductInsert) {
    loading.value = true
    error.value = null

    const response = await productsService.createProduct(productData)

    if (response.error) {
      error.value = formatErrorMessage(response.error)
      loading.value = false
      return null
    }

    // Optimistic UI - добавляем сразу в список
    if (response.data) {
      products.value.unshift(response.data)
    }

    loading.value = false
    return response.data
  }

  async function updateProduct(id: string, updates: ProductUpdate) {
    loading.value = true
    error.value = null

    // Optimistic UI - обновляем локально
    const index = products.value.findIndex(p => p.id === id)
    const originalProduct = index >= 0 ? { ...products.value[index] } : null

    if (index >= 0) {
      products.value[index] = { ...products.value[index], ...updates }
    }

    const response = await productsService.updateProduct(id, updates)

    if (response.error) {
      // Откатываем изменения при ошибке
      if (originalProduct && index >= 0) {
        products.value[index] = originalProduct
      }
      error.value = formatErrorMessage(response.error)
      loading.value = false
      return null
    }

    // Обновляем с данными с сервера
    if (response.data && index >= 0) {
      products.value[index] = response.data
    }

    loading.value = false
    return response.data
  }

  async function deleteProduct(id: string) {
    loading.value = true
    error.value = null

    const response = await productsService.deleteProduct(id)

    if (response.error) {
      error.value = formatErrorMessage(response.error)
      loading.value = false
      return false
    }

    // Удаляем из списка (или помечаем как неактивный)
    const index = products.value.findIndex(p => p.id === id)
    if (index >= 0) {
      products.value[index].active = false
    }

    loading.value = false
    return true
  }

  async function updateStock(id: string, quantity: number) {
    const response = await productsService.updateStock(id, quantity)

    if (response.error) {
      error.value = formatErrorMessage(response.error)
      return null
    }

    // Обновляем в списке
    const index = products.value.findIndex(p => p.id === id)
    if (index >= 0 && response.data) {
      products.value[index] = response.data
    }

    return response.data
  }

  async function searchProducts(searchTerm: string) {
    loading.value = true
    error.value = null

    const response = await productsService.searchProducts(searchTerm)

    if (response.error) {
      error.value = formatErrorMessage(response.error)
      loading.value = false
      return []
    }

    loading.value = false
    return response.data || []
  }

  function clearError() {
    error.value = null
  }

  async function refresh() {
    await fetchProducts({}, true)
  }

  function $reset() {
    products.value = []
    currentProduct.value = null
    loading.value = false
    error.value = null
    lastFetch.value = 0
  }

  return {
    // State
    products,
    currentProduct,
    loading,
    error,

    // Computed
    activeProducts,
    productsByCategory,
    isDataStale,

    // Actions
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    searchProducts,
    clearError,
    refresh,
    $reset,
  }
})

