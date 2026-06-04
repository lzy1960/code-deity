import { createPayloadModal } from './createModal'
import type { Paradigm } from '~/types/paradigms'

const _modal = createPayloadModal<Paradigm>()

export function useParadigmPurchaseModal() {
  const m = _modal()
  return {
    isRevealed: m.isRevealed,
    paradigmToPurchase: m.payload,
    show: m.show,
    hide: m.hide,
    confirm: m.confirm,
  }
}
