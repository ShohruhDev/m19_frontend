/**
 * Common Application Types
 */

export interface Review {
  id: number | string
  author: string
  avatar_url?: string
  rating: number
  text: string
  date: string
  staff_name?: string
}

export interface Product {
  id: number | string
  title: string
  brand: string
  description: string
  price: number
  image_url: string
  category: string
  in_stock: boolean
}

export interface ContactInfo {
  address: string
  phone: string
  email: string
  instagram?: string
  telegram?: string
  working_hours: {
    weekdays: string
    weekend: string
  }
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface NavigationItem {
  name: string
  path: string
  icon?: string
}

export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface LoadingState {
  isLoading: boolean
  error: string | null
  isEmpty: boolean
}

