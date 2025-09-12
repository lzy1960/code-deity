import { defineNuxtPlugin } from '#app'
import { useGameStore } from '~/store/game'
import { saveManager } from '~~/services/saveManager'

export default defineNuxtPlugin(() => {
  const gameStore = useGameStore()

  const saveGame = async () => {
    await saveManager.save(gameStore.$state)
  }

  const loadGame = async () => {
    const loadedState = await saveManager.load()
    if (loadedState) {
      gameStore.$patch(loadedState)
    }
  }

  const wipeData = async () => {
    await saveManager.wipeData()
    // Replace the current history entry and navigate to the home page.
    // This prevents the user from using the "back" button to return to the settings page.
    window.location.replace('/')
  }

  return {
    provide: {
      saveGame,
      loadGame,
      wipeData
    }
  }
})
