import { ref } from 'vue'
import { createSharedComposable } from '@vueuse/core'

export const useAdBoostModal = createSharedComposable(() => {
  const isRevealed = ref(false)

  const show = () => {
    isRevealed.value = true
  }

  const hide = () => {
    isRevealed.value = false
  }

  return {
    isRevealed,
    show,
    hide,
  }
})
