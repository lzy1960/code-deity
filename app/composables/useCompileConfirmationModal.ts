import type Decimal from 'break_infinity.js'
import { createPayloadModal } from './createModal'

interface CompilePreview {
  currentVersion: number
  nextVersion: number
  currentRefactorPoints: Decimal
  remainingRefactorPoints: Decimal
  currentRpBonus: Decimal
  projectedRpBonus: Decimal
  readinessBefore: number
  readinessAfter: number
  unlockAutomation: boolean
  unlockChallenges: boolean
}

const _modal = createPayloadModal<CompilePreview>()

export function useCompileConfirmationModal() {
  const m = _modal()
  return {
    isRevealed: m.isRevealed,
    preview: m.payload,
    show: m.show,
    hide: m.hide,
    confirm: m.confirm,
  }
}
