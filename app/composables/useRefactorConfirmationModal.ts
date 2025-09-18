import { ref, shallowRef } from 'vue'
import { createSharedComposable } from '@vueuse/core'
import type Decimal from 'break_infinity.js'

interface RefactorGains {
  potentialRpGain: Decimal;
  currentRpBonus: Decimal;
  projectedRpBonus: Decimal;
  currentRefactorPoints: Decimal;
}

export const useRefactorConfirmationModal = createSharedComposable(() => {
  const isRevealed = ref(false)
  const gains = shallowRef<RefactorGains | null>(null)
  let onConfirmCallback: (() => void) | null = null

  const show = (gainsData: RefactorGains, onConfirmAction: () => void) => {
    gains.value = gainsData
    onConfirmCallback = onConfirmAction
    isRevealed.value = true
  }

  const hide = () => {
    isRevealed.value = false
    gains.value = null
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
    gains,
    show,
    hide,
    confirm,
  }
})
