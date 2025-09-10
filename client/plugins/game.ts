import { defineNuxtPlugin } from '#app'
import { useGameStore } from '~/store/game'
import { saveManager } from '~/services/saveManager'
import type { Generator } from '~/store/game'

export default defineNuxtPlugin((nuxtApp) => {
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

  const gameLoop = () => {
    const now = Date.now()
    const diff = (now - gameStore.lastUpdateTime) / 1000
    gameStore.lastUpdateTime = now

    const effectiveDiff = Math.min(diff, 3600)

    gameStore.generators.forEach((generator: Generator) => {
      const production = generator.amount.times(generator.multiplier).times(generator.baseProduction).times(effectiveDiff)
      gameStore.currency = gameStore.currency.plus(production)
    })
    // TODO: Add logic for potentialRpGain update if it's dynamic
  }

  nuxtApp.hook('app:mounted', () => {
    loadGame()
    setInterval(gameLoop, 1000)
  })

  return {
    provide: {
      saveGame,
      loadGame
    }
  }
})