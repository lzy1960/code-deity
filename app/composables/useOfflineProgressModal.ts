import { useConfirmDialog } from '@vueuse/core'

export const useOfflineProgressModal = () => {
  const { isRevealed, reveal, onConfirm, confirm } = useConfirmDialog()

  return {
    isRevealed,
    reveal,
    onConfirm,
    confirm
  }
}