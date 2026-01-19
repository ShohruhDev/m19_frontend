/**
 * Loading State Composable
 * Управление состоянием загрузки
 */

import { ref, computed } from 'vue'

export function useLoadingState() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<any>(null)

  const isEmpty = computed(() => {
    return !isLoading.value && !error.value && data.value === null
  })

  const hasData = computed(() => {
    return !isLoading.value && !error.value && data.value !== null
  })

  const hasError = computed(() => {
    return !isLoading.value && error.value !== null
  })

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
    if (loading) {
      error.value = null
    }
  }

  const setError = (err: string | Error | null) => {
    if (err === null) {
      error.value = null
    } else if (typeof err === 'string') {
      error.value = err
    } else {
      error.value = err.message
    }
    isLoading.value = false
  }

  const setData = (newData: any) => {
    data.value = newData
    isLoading.value = false
    error.value = null
  }

  const reset = () => {
    isLoading.value = false
    error.value = null
    data.value = null
  }

  return {
    isLoading,
    error,
    data,
    isEmpty,
    hasData,
    hasError,
    setLoading,
    setError,
    setData,
    reset,
  }
}

