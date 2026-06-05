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
  const timers = new Map<number, ReturnType<typeof setTimeout>>()
  const DEFAULT_DURATION = 2200
  const MIN_DURATION = 1200
  const MAX_DURATION = 3500

  const removeToast = (id: number) => {
    const timer = timers.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.delete(id)
    }
    toasts.value = toasts.value.filter(toast => toast.id !== id)
  }

  const addToast = (message: string, type: Toast['type'] = 'info', duration: number = DEFAULT_DURATION) => {
    const id = Date.now() + Math.random()
    const normalizedDuration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, duration))
    toasts.value.push({ id, message, type, duration: normalizedDuration })

    const timer = setTimeout(() => {
      removeToast(id)
    }, normalizedDuration)
    timers.set(id, timer)
  }

  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
  }
})
