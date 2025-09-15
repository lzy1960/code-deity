import { ref } from 'vue'
import { App } from '@capacitor/app'

// A reactive state to control the visibility of the modal
const isVisible = ref(false)

// A simple event bus using mitt or a similar library could be used here,
// but for a single global modal, a simple ref and functions are sufficient.
let confirmCallback: (() => void) | null = null

export function useExitConfirmationModal() {
  const show = () => {
    // The actual exit logic is now handled by the Capacitor plugin,
    // which will call this show function.
    // We set up the confirm callback to be App.exitApp().
    confirmCallback = () => {
      App.exitApp()
    }
    isVisible.value = true
  }

  const hide = () => {
    isVisible.value = false
    confirmCallback = null
  }

  const confirm = () => {
    if (confirmCallback) {
      confirmCallback()
    }
    hide()
  }

  return {
    isVisible,
    show,
    hide,
    confirm,
  }
}
