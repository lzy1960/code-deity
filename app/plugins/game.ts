import { defineNuxtPlugin } from '#app'
import { useGameStore } from '~/store/game'
import { saveManager } from '~~/services/saveManager'
import { useAutoSaveNotifier } from '~/composables/useAutoSaveNotifier'

export default defineNuxtPlugin((nuxtApp) => {
  const gameStore = useGameStore()

  const autoSaveNotifier = useAutoSaveNotifier()
  const { $i18n } = useNuxtApp()

  const saveGameLocal = async () => {
    await saveManager.save(gameStore.toJSON())
    autoSaveNotifier.show($i18n.t('toast.autoSaveSuccess'))
    console.log('Game saved locally!')
  }

  const loadGame = async () => {
    const { data: loadedState, source } = await saveManager.load()
    
    if (loadedState) {
      gameStore.hydrate(loadedState)
    }
  }

  const wipeData = async () => {
    await saveManager.wipeData()
    // By calling the store's own hardReset action, we ensure all state is
    // cleared consistently and the logic is centralized within the store.
    gameStore.hardReset()
  }

  return {
    provide: {
      saveGameLocal,
      loadGame,
      wipeData
    }
  }
})
