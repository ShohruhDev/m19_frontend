/**
 * Orders Store
 * Pinia store для управления состоянием заказов
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Order, OrderInsert, OrderStatus, OrderFilters } from '@/types/database.types'
import * as ordersService from '@/services/orders.service'
import { formatErrorMessage } from '@/utils/errorHandler'

export const useOrdersStore = defineStore('orders', () => {
  // State
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const stats = ref({
    total: 0,
    new: 0,
    processing: 0,
    done: 0,
    canceled: 0,
  })

  // Computed
  const newOrders = computed(() =>
    orders.value.filter(o => o.status === 'new')
  )

  const processingOrders = computed(() =>
    orders.value.filter(o => o.status === 'processing')
  )

  const completedOrders = computed(() =>
    orders.value.filter(o => o.status === 'done')
  )

  const canceledOrders = computed(() =>
    orders.value.filter(o => o.status === 'canceled')
  )

  const hasNewOrders = computed(() => newOrders.value.length > 0)

  // Actions
  async function fetchOrders(filters: OrderFilters = {}) {
    loading.value = true
    error.value = null

    const response = await ordersService.listOrders(filters)

    if (response.error) {
      error.value = formatErrorMessage(response.error)
      loading.value = false
      return
    }

    orders.value = response.data || []
    loading.value = false
  }

  async function fetchOrder(id: string) {
    loading.value = true
    error.value = null

    const response = await ordersService.getOrder(id)

    if (response.error) {
      error.value = formatErrorMessage(response.error)
      currentOrder.value = null
      loading.value = false
      return
    }

    currentOrder.value = response.data
    loading.value = false
  }

  async function createOrder(orderData: OrderInsert) {
    loading.value = true
    error.value = null

    const response = await ordersService.createOrder(orderData)

    if (response.error) {
      error.value = formatErrorMessage(response.error)
      loading.value = false
      return null
    }

    // Optimistic UI - добавляем сразу
    if (response.data) {
      orders.value.unshift(response.data)
      stats.value.total++
      stats.value.new++
    }

    loading.value = false
    return response.data
  }

  async function updateOrderStatus(id: string, status: OrderStatus) {
    loading.value = true
    error.value = null

    // Optimistic UI
    const index = orders.value.findIndex(o => o.id === id)
    const originalStatus = index >= 0 ? orders.value[index].status : null

    if (index >= 0) {
      orders.value[index].status = status
    }

    const response = await ordersService.updateOrderStatus(id, status)

    if (response.error) {
      // Откатываем при ошибке
      if (originalStatus && index >= 0) {
        orders.value[index].status = originalStatus
      }
      error.value = formatErrorMessage(response.error)
      loading.value = false
      return null
    }

    // Обновляем с сервера
    if (response.data && index >= 0) {
      orders.value[index] = response.data
    }

    // Обновляем статистику
    await fetchStats()

    loading.value = false
    return response.data
  }

  async function cancelOrder(id: string) {
    loading.value = true
    error.value = null

    const response = await ordersService.cancelOrder(id)

    if (response.error) {
      error.value = formatErrorMessage(response.error)
      loading.value = false
      return null
    }

    // Обновляем в списке
    const index = orders.value.findIndex(o => o.id === id)
    if (index >= 0 && response.data) {
      orders.value[index] = response.data
    }

    // Обновляем статистику
    await fetchStats()

    loading.value = false
    return response.data
  }

  async function fetchStats() {
    const response = await ordersService.getOrderStats()

    if (response.error) {
      console.error('Failed to fetch order stats:', response.error)
      return
    }

    if (response.data) {
      stats.value = response.data
    }
  }

  async function fetchNewOrders() {
    const response = await ordersService.getNewOrders()

    if (response.error) {
      error.value = formatErrorMessage(response.error)
      return []
    }

    return response.data || []
  }

  function clearError() {
    error.value = null
  }

  async function refresh() {
    await Promise.all([
      fetchOrders(),
      fetchStats(),
    ])
  }

  function $reset() {
    orders.value = []
    currentOrder.value = null
    loading.value = false
    error.value = null
    stats.value = {
      total: 0,
      new: 0,
      processing: 0,
      done: 0,
      canceled: 0,
    }
  }

  return {
    // State
    orders,
    currentOrder,
    loading,
    error,
    stats,

    // Computed
    newOrders,
    processingOrders,
    completedOrders,
    canceledOrders,
    hasNewOrders,

    // Actions
    fetchOrders,
    fetchOrder,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    fetchStats,
    fetchNewOrders,
    clearError,
    refresh,
    $reset,
  }
})

