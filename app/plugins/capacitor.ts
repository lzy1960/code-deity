import { App } from '@capacitor/app'
import { useExitConfirmationModal } from '~/composables/useExitConfirmationModal'

export default defineNuxtPlugin((nuxtApp) => {
  // This plugin should only run on the client side, where Capacitor is available.
  if (process.server) {
    return
  }

  const { $saveGameLocal } = useNuxtApp()
  const { show: showExitModal } = useExitConfirmationModal()
  const router = useRouter()

  App.addListener('backButton', async () => {
    // We don't use the `canGoBack` property from the event,
    // as it doesn't reliably track Vue Router's history.
    // Instead, we rely solely on the router's current path.

    const isAtRoot = router.current.value.path === '/'

    if (isAtRoot) {
      // If on the root page, show our custom confirmation modal.
      // The modal itself will handle the App.exitApp() call.
      await $saveGameLocal() // Save progress before showing the modal
      showExitModal()
    } else {
      // If not on the root page, simply go back.
      // Vue Router will handle the navigation history.
      router.back()
    }
  })
})
