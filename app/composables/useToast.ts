import { ref, readonly } from 'vue'
import { createSharedComposable } from '@vueuse/core'

export interface Toast {
  id: number
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration?: number
}

// Using createSharedComposable ensures that the state is singleton across the app
export const useToast = createSharedComposable(() => {
  const toasts = ref<Toast[]>([])

  const addToast = (message: string, type: Toast['type'] = 'info', duration: number = 3000) => {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, message, type, duration })

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }

  return {
    toasts: readonly(toasts),
    addToast,
  }
})
