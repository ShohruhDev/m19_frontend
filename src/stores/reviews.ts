/**
 * Reviews Store
 * Pinia store для управления состоянием отзывов
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Review, ReviewInsert, ReviewFilters } from '@/types/database.types'
import * as reviewsService from '@/services/reviews.service'
import { formatErrorMessage } from '@/utils/errorHandler'

export const useReviewsStore = defineStore('reviews', () => {
  // State
  const reviews = ref<Review[]>([])
  const currentReview = ref<Review | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const stats = ref({
    total: 0,
    approved: 0,
    pending: 0,
    averageRating: 0,
  })

  // Computed
  const approvedReviews = computed(() =>
    reviews.value.filter(r => r.approved)
  )

  const pendingReviews = computed(() =>
    reviews.value.filter(r => !r.approved)
  )

  const hasPendingReviews = computed(() => pendingReviews.value.length > 0)

  const averageRating = computed(() => {
    const approved = approvedReviews.value
    if (approved.length === 0) return 0
    const sum = approved.reduce((acc, r) => acc + r.rating, 0)
    return Math.round((sum / approved.length) * 10) / 10
  })

  // Actions
  async function fetchReviews(filters: ReviewFilters = {}) {
    loading.value = true
    error.value = null

    const response = await reviewsService.listReviews(filters)

    if (response.error) {
      error.value = formatErrorMessage(response.error)
      loading.value = false
      return
    }

    reviews.value = response.data || []
    loading.value = false
  }

  async function fetchReview(id: string) {
    loading.value = true
    error.value = null

    const response = await reviewsService.getReview(id)

    if (response.error) {
      error.value = formatErrorMessage(response.error)
      currentReview.value = null
      loading.value = false
      return
    }

    currentReview.value = response.data
    loading.value = false
  }

  async function createReview(reviewData: ReviewInsert) {
    loading.value = true
    error.value = null

    const response = await reviewsService.createReview(reviewData)

    if (response.error) {
      error.value = formatErrorMessage(response.error)
      loading.value = false
      return null
    }

    // Добавляем в список (с approved: false)
    if (response.data) {
      reviews.value.unshift(response.data)
      stats.value.total++
      stats.value.pending++
    }

    loading.value = false
    return response.data
  }

  async function approveReview(id: string, approved: boolean) {
    loading.value = true
    error.value = null

    // Optimistic UI
    const index = reviews.value.findIndex(r => r.id === id)
    const originalApproved = index >= 0 ? reviews.value[index].approved : null

    if (index >= 0) {
      reviews.value[index].approved = approved
    }

    const response = await reviewsService.approveReview(id, approved)

    if (response.error) {
      // Откатываем при ошибке
      if (originalApproved !== null && index >= 0) {
        reviews.value[index].approved = originalApproved
      }
      error.value = formatErrorMessage(response.error)
      loading.value = false
      return null
    }

    // Обновляем с сервера
    if (response.data && index >= 0) {
      reviews.value[index] = response.data
    }

    // Обновляем статистику
    await fetchStats()

    loading.value = false
    return response.data
  }

  async function deleteReview(id: string) {
    loading.value = true
    error.value = null

    const response = await reviewsService.deleteReview(id)

    if (response.error) {
      error.value = formatErrorMessage(response.error)
      loading.value = false
      return false
    }

    // Удаляем из списка
    const index = reviews.value.findIndex(r => r.id === id)
    if (index >= 0) {
      reviews.value.splice(index, 1)
    }

    // Обновляем статистику
    await fetchStats()

    loading.value = false
    return true
  }

  async function fetchApprovedReviews() {
    loading.value = true
    error.value = null

    const response = await reviewsService.getApprovedReviews()

    if (response.error) {
      error.value = formatErrorMessage(response.error)
      loading.value = false
      return []
    }

    loading.value = false
    return response.data || []
  }

  async function fetchPendingReviews() {
    loading.value = true
    error.value = null

    const response = await reviewsService.getPendingReviews()

    if (response.error) {
      error.value = formatErrorMessage(response.error)
      loading.value = false
      return []
    }

    loading.value = false
    return response.data || []
  }

  async function fetchStats() {
    const response = await reviewsService.getReviewStats()

    if (response.error) {
      console.error('Failed to fetch review stats:', response.error)
      return
    }

    if (response.data) {
      stats.value = response.data
    }
  }

  function clearError() {
    error.value = null
  }

  async function refresh() {
    await Promise.all([
      fetchReviews(),
      fetchStats(),
    ])
  }

  function $reset() {
    reviews.value = []
    currentReview.value = null
    loading.value = false
    error.value = null
    stats.value = {
      total: 0,
      approved: 0,
      pending: 0,
      averageRating: 0,
    }
  }

  return {
    // State
    reviews,
    currentReview,
    loading,
    error,
    stats,

    // Computed
    approvedReviews,
    pendingReviews,
    hasPendingReviews,
    averageRating,

    // Actions
    fetchReviews,
    fetchReview,
    createReview,
    approveReview,
    deleteReview,
    fetchApprovedReviews,
    fetchPendingReviews,
    fetchStats,
    clearError,
    refresh,
    $reset,
  }
})

