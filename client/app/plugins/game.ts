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

  return {
    provide: {
      saveGame,
      loadGame
    }
  }
})
