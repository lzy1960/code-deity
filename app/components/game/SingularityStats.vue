<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-gray-800 rounded-lg p-4 text-center">
      <p class="text-sm text-gray-400">奇点</p>
      <p class="text-2xl font-bold text-purple-400">{{ formatNumber(gameStore.singularityCount) }}</p>
    </div>
    <div class="bg-gray-800 rounded-lg p-4 text-center">
      <p class="text-sm text-gray-400">奇点算力 (SP)</p>
      <p class="text-2xl font-bold text-green-400">{{ formatNumber(gameStore.singularityPower) }}</p>
    </div>
    <div class="bg-gray-800 rounded-lg p-4 text-center">
      <p class="text-sm text-gray-400">代码优雅度 (RP)</p>
      <p class="text-2xl font-bold text-cyan-400">{{ formatNumber(gameStore.refactorPoints) }}</p>
    </div>
    <div class="bg-gray-800 rounded-lg p-4 text-center">
      <p class="text-sm text-gray-400">当前版本</p>
      <p class="text-2xl font-bold text-orange-400">v1.{{ gameStore.version }}.0</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/store/game'
import { formatNumber } from '~/utils/format'

const gameStore = useGameStore()
</script>
