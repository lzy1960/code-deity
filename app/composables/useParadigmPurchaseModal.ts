import { ref, shallowRef } from 'vue'
import { createSharedComposable } from '@vueuse/core'
import type { Paradigm } from '~~/game/paradigms.configs'

export const useParadigmPurchaseModal = createSharedComposable(() => {
  const isRevealed = ref(false)
  const paradigmToPurchase = shallowRef<Paradigm | null>(null)
  
  let onConfirmCallback: (() => void) | null = null

  const show = (paradigm: Paradigm, onConfirmAction: () => void) => {
    paradigmToPurchase.value = paradigm
    onConfirmCallback = onConfirmAction
    isRevealed.value = true
  }

  const hide = () => {
    isRevealed.value = false
    paradigmToPurchase.value = null
    onConfirmCallback = null // Clear callback on hide
  }

  const confirm = () => {
    if (onConfirmCallback) {
      onConfirmCallback()
    }
    hide()
  }

  return {
    isRevealed,
    paradigmToPurchase,
    show,
    hide,
    confirm,
  }
})
