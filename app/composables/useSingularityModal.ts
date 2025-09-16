import { ref } from 'vue'
import { createSharedComposable } from '@vueuse/core'

export const useSingularityModal = createSharedComposable(() => {
  const isRevealed = ref(false)
  let onConfirmCallback: (() => void) | null = null

  const show = (onConfirmAction: () => void) => {
    onConfirmCallback = onConfirmAction
    isRevealed.value = true
  }

  const hide = () => {
    isRevealed.value = false
    onConfirmCallback = null
  }

  const confirm = () => {
    if (onConfirmCallback) {
      onConfirmCallback()
    }
    hide()
  }

  return {
    isRevealed,
    show,
    hide,
    confirm,
  }
})
