<script setup lang="ts">
import { onMounted } from 'vue'
import { useGameStore, type Generator } from '../store/game' // 导入 Generator 类型
import { saveManager } from '../services/saveManager'

const gameStore = useGameStore()

const saveGame = async () => {
  await saveManager.save(gameStore.$state)
}

const loadGame = async () => {
  const loadedState = await saveManager.load()
  if (loadedState) {
    gameStore.$patch(loadedState) // 使用 $patch 更新整个 store
  }
}

const gameLoop = () => {
  const now = Date.now()
  const diff = (now - gameStore.lastUpdateTime) / 1000 // 秒
  gameStore.lastUpdateTime = now

  // Tier 1 反时间欺骗
  const effectiveDiff = Math.min(diff, 3600) // 最多计算1小时离线收益

  // 假设每个生成器每秒产生一定量的货币
  gameStore.generators.forEach((generator: Generator) => {
    // 产出 = 数量 * 乘数 * 基础产出 * 有效时间
    const production = generator.amount.times(generator.multiplier).times(generator.baseProduction).times(effectiveDiff)
    gameStore.currency = gameStore.currency.plus(production)
  })
}

onMounted(() => {
  // 自动加载存档
  loadGame()
  setInterval(gameLoop, 1000) // 每秒运行一次游戏循环
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <h1>代码神祇</h1>
    <p>货币: {{ gameStore.currency.toFixed(2) }}</p>
    <div>
      <button @click="saveGame">保存游戏</button>
      <button @click="loadGame">加载游戏</button>
    </div>
    <div>
      <h2>生成器</h2>
      <ul>
        <li v-for="generator in gameStore.generators" :key="generator.id">
          {{ generator.name }}: {{ generator.amount.toFixed(0) }} (x{{ generator.multiplier.toFixed(2) }})
          <button @click="gameStore.buyGenerator(generator.id)">
            购买 ({{ generator.baseCost.times(generator.costMultiplier.pow(generator.bought)).toFixed(2) }} 货币)
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>
