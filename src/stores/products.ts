/**
 * Products Store
 * Pinia store для управления состоянием продуктов (косметики)
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { formatErrorMessage } from '@/utils/errorHandler'

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

      // Fetch from Backend API
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://m19-backend.vercel.app/api'
      const response = await fetch(`${baseUrl}/products`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch products')
      }

      const productsFromApi = result.data || []

      // Map DB products to CatalogItem
      const allItems: CatalogItem[] = productsFromApi.map((p: any) => ({
        id: p.id,
        title: p.title,
        is_category: false,
        is_item: true,
        price: p.price,
        image_url: p.image_url,
        description: p.description,
        parent_id: 0,
        category_id: 0, // Simplified for now
        amount: 999,
        category_name: p.category || 'General'
      }))

      // Generate categories from data if needed, or use predefined
      const uniqueCategories = [...new Set(allItems.map(i => i.category_name))]
        .filter((c): c is string => !!c)


      items.value = allItems
      categories.value = uniqueCategories
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
