/**
 * Products Store
 * Pinia store для управления состоянием продуктов (косметики)
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { altegService } from '@/services/alteg.service'
import { formatErrorMessage } from '@/utils/errorHandler'
import { mockProducts, mockCategories } from '@/data/mockProducts'

// Interface based on Altegio Goods (Mixed: Category or Item)
export interface CatalogItem {
  id: number
  title: string
  is_category: boolean
  is_item: boolean // or !is_category
  price: number // 0 for category
  image_url?: string // from image
  description?: string
  parent_id: number
  category_id: number
  amount?: number // stock
  category_name?: string // Added for filtering
}

export const useProductsStore = defineStore('products', () => {
  // State
  const items = ref<CatalogItem[]>([]) // All items flattened
  const categories = ref<string[]>([]) // List of category names
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  // Only items (products), ignoring folders
  const products = computed(() => items.value.filter(i => i.is_item))

  // Actions
  async function fetchAllProducts() {
    loading.value = true
    error.value = null

    try {
      // Simulate API delay for realism
      await new Promise(resolve => setTimeout(resolve, 500))

      // Use mock data
      const allItems: CatalogItem[] = mockProducts.map(product => ({
        id: product.id,
        title: product.title,
        is_category: false,
        is_item: true,
        price: product.price,
        image_url: product.image_url,
        description: product.description,
        parent_id: 0,
        category_id: product.category_id,
        amount: product.amount,
        category_name: mockCategories.find(c => c.id === product.category_id)?.title || 'Прочее'
      }))

      const catNames = mockCategories.map(c => c.title)

      items.value = allItems
      categories.value = catNames
    } catch (err: any) {
      error.value = formatErrorMessage(err)
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  function mapToItem(g: any, categoryName: string): CatalogItem {
    return {
      id: g.id || g.category_id,
      title: g.title,
      is_category: false,
      is_item: true,
      price: g.price_min || g.price || 0,
      image_url: g.image || g.image_url || '',
      description: g.description || '',
      parent_id: g.parent_id || 0,
      category_id: g.category_id,
      amount: g.amount,
      category_name: categoryName
    }
  }

  function $reset() {
    items.value = []
    loading.value = false
    error.value = null
  }

  return {
    items,
    products,
    categories,
    loading,
    error,
    fetchAllProducts,
    $reset
  }
})
