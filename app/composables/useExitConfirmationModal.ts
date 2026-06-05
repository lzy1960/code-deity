import { App } from '@capacitor/app'
import { createConfirmModal } from './createModal'

const _modal = createConfirmModal()

export function useExitConfirmationModal() {
  const m = _modal()
  return {
    isVisible: m.isRevealed,
    isRevealed: m.isRevealed,
    show: () => m.show(() => App.exitApp()),
    hide: m.hide,
    confirm: m.confirm,
  }
}
