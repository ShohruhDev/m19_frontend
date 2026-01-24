/**
 * Products Store
 * Pinia store для управления состоянием продуктов (косметики)
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { altegService } from '@/services/alteg.service'
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
    const allItems: CatalogItem[] = []
    const catNames = new Set<string>()

    try {
      // 1. Fetch Root
      const rootGoods = await altegService.fetchGoods({ parent_id: 0 })

      // Process Root
      for (const node of rootGoods) {
        // Correctly handle is_category flag (string/bool/int)
        const isCat = node.is_category === true || node.is_category === 'true' || node.is_category === 1

        if (isCat) {
          // It is a Folder/Brand. Add to categories list.
          catNames.add(node.title)

          try {
            // 2. Fetch Children (One level deep recursion for now)
            // If we need deeper, we'd need a recursive function.
            // Usually cosmetics catalog is Brand -> Product.
            const children = await altegService.fetchGoods({ parent_id: node.category_id || node.id })

            children.forEach((child: any) => {
              const isChildCat = child.is_category === true || child.is_category === 'true' || child.is_category === 1
              if (!isChildCat) {
                allItems.push(mapToItem(child, node.title))
              }
            })
          } catch (e) {
            console.error(`Failed to fetch children for ${node.title}`, e)
          }
        } else {
          // Root level product
          allItems.push(mapToItem(node, 'Прочее'))
        }
      }

      items.value = allItems
      categories.value = Array.from(catNames)
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
