<script setup lang="ts">
import { onMounted } from 'vue'
import { useGameStore } from '~/store/game'

const gameStore = useGameStore()
const { $saveGame, $loadGame } = useNuxtApp() as any

onMounted(() => {
  // 自动加载游戏
  $loadGame()
  // 启动游戏主循环 (50ms)
  gameStore.startGameLoop()
  // 启动自动存档循环 (15s)
  setInterval(() => {
    $saveGame()
  }, 15000)
})
</script>

<template>
  <NuxtPage />
</template>
