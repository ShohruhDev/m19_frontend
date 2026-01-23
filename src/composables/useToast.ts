/**
 * Toast Composable using Sonner (Shadcn UI)
 */

import { ref } from 'vue'
import { toast } from 'vue-sonner'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

// Deprecated: Sonner manages its own state.
// We keep this empty or as a dummy to avoid breaking TS if some component reads it, 
// though they shouldn't anymore as ToastContainer is updated.
const toasts = ref<Toast[]>([])

export function useToast() {
  const show = (message: string, type: ToastType = 'info', duration = 3000) => {
    // Sonner doesn't return an ID in the same way, but it handles display.
    // We map 'type' to sonner methods.
    const options = { duration }
    let id: string | number = ''
    
    switch (type) {
      case 'success':
        id = toast.success(message, options)
        break
      case 'error':
        id = toast.error(message, options)
        break
      case 'warning':
        id = toast.warning(message, options)
        break
      case 'info':
      default:
        id = toast.info(message, options)
        break
    }
    
    return String(id)
  }

  const success = (message: string, duration?: number) => {
    return show(message, 'success', duration)
  }

  const error = (message: string, duration?: number) => {
    return show(message, 'error', duration || 5000)
  }

  const warning = (message: string, duration?: number) => {
    return show(message, 'warning', duration)
  }

  const info = (message: string, duration?: number) => {
    return show(message, 'info', duration)
  }

  const remove = (id: string) => {
    toast.dismiss(id)
  }

  const clear = () => {
    toast.dismiss()
  }

  return {
    toasts, // Legacy support, empty
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear,
  }
}

