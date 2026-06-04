import type Decimal from 'break_infinity.js'
import { createPayloadModal } from './createModal'

interface RefactorGains {
  potentialRpGain: Decimal
  currentRpBonus: Decimal
  projectedRpBonus: Decimal
  currentRefactorPoints: Decimal
}

const _modal = createPayloadModal<RefactorGains>()

export function useRefactorConfirmationModal() {
  const m = _modal()
  return {
    isRevealed: m.isRevealed,
    gains: m.payload,
    show: m.show,
    hide: m.hide,
    confirm: m.confirm,
  }
}
