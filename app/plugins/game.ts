import { defineNuxtPlugin } from '#app'
import { useGameStore } from '~/store/game'
import { useAuthStore } from '~/store/auth'
import { saveManager } from '~~/services/saveManager'
import { useAutoSaveNotifier } from '~/composables/useAutoSaveNotifier'

export default defineNuxtPlugin((nuxtApp) => {
  const gameStore = useGameStore()
  const authStore = useAuthStore()
  const supabase = useSupabaseClient()
  const autoSaveNotifier = useAutoSaveNotifier()
  const { $i18n } = useNuxtApp()

  const saveGameLocal = async () => {
    await saveManager.save(gameStore.toJSON(), authStore.user, supabase, { cloud: false })
    autoSaveNotifier.show($i18n.t('toast.autoSaveSuccess'))
    console.log('Game saved locally!')
  }

  const saveGameCloud = async () => {
    await saveManager.save(gameStore.toJSON(), authStore.user, supabase, { cloud: true })
    if (authStore.user) {
      gameStore.setLastCloudSync(Date.now())
    }
  }

  const loadGame = async () => {
    const { data: loadedState, source } = await saveManager.load(authStore.user, supabase)
    
    if (loadedState) {
      gameStore.hydrate(loadedState)

      // If loaded from cloud, immediately save it back to local storage
      if (source === 'cloud') {
        await saveGameLocal()
      }
    }
  }

  const wipeData = async () => {
    await saveManager.wipeData(authStore.user, supabase)
    // By calling the store's own hardReset action, we ensure all state is
    // cleared consistently and the logic is centralized within the store.
    gameStore.hardReset()
  }

  return {
    provide: {
      saveGameLocal,
      saveGameCloud,
      loadGame,
      wipeData
    }
  }
})
