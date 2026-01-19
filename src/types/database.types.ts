/**
 * Supabase Database Types
 * Типы для всех таблиц базы данных
 */

// Product Types
export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  stock: number
  active: boolean
  category?: string
  brand?: string
  created_at: string
  updated_at?: string
}

export interface ProductInsert {
  name: string
  description: string
  price: number
  image_url?: string | null
  stock: number
  active?: boolean
  category?: string
  brand?: string
}

export interface ProductUpdate {
  name?: string
  description?: string
  price?: number
  image_url?: string | null
  stock?: number
  active?: boolean
  category?: string
  brand?: string
}

// Order Types
export type OrderStatus = 'new' | 'processing' | 'done' | 'canceled'

export interface Order {
  id: string
  product_id: string
  product?: Product
  client_name: string
  client_phone: string
  comment: string | null
  status: OrderStatus
  quantity: number
  total_price: number
  created_at: string
  updated_at?: string
}

export interface OrderInsert {
  product_id: string
  client_name: string
  client_phone: string
  comment?: string | null
  status?: OrderStatus
  quantity?: number
  total_price: number
}

export interface OrderUpdate {
  status?: OrderStatus
  comment?: string | null
}

// Review Types
export interface Review {
  id: string
  author: string
  rating: number
  text: string
  approved: boolean
  service?: string | null
  master?: string | null
  created_at: string
  updated_at?: string
}

export interface ReviewInsert {
  author: string
  rating: number
  text: string
  approved?: boolean
  service?: string | null
  master?: string | null
}

export interface ReviewUpdate {
  approved?: boolean
  text?: string
  rating?: number
}

// Query Filter Types
export interface ProductFilters {
  activeOnly?: boolean
  category?: string
  search?: string
  limit?: number
  offset?: number
}

export interface OrderFilters {
  status?: OrderStatus
  productId?: string
  limit?: number
  offset?: number
}

export interface ReviewFilters {
  approvedOnly?: boolean
  minRating?: number
  limit?: number
  offset?: number
}

// Response Types
export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

// Database Tables Enum
export enum Tables {
  Products = 'products',
  Orders = 'orders',
  Reviews = 'reviews',
}

