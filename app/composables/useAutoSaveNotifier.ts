import { ref, readonly } from 'vue'
import { createSharedComposable } from '@vueuse/core'

export const useAutoSaveNotifier = createSharedComposable(() => {
  const isVisible = ref(false)
  const message = ref('')
  let timeoutId: NodeJS.Timeout | null = null

  const show = (msg: string, duration: number = 2000) => {
    message.value = msg
    isVisible.value = true

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      isVisible.value = false
    }, duration)
  }

  return {
    isVisible: readonly(isVisible),
    message: readonly(message),
    show,
  }
})
