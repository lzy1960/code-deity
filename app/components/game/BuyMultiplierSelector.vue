<template>
  <div class="flex items-center bg-[#182635] rounded-full p-1 text-sm font-bold">
    <button
      v-for="multiplier in multipliers"
      :key="multiplier.value"
      class="px-3 py-1 rounded-full transition-colors"
      :class="isActive(multiplier.value) ? 'bg-[#3899fa] text-white' : 'text-gray-400 hover:text-white'"
      @click="setMultiplier(multiplier.value)"
    >
      {{ multiplier.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useGameStore, type BuyMultiplier } from '~/store/game'

const gameStore = useGameStore()

const multipliers: { label: string; value: BuyMultiplier }[] = [
  { label: 'x1', value: 'x1' },
  { label: 'x10', value: 'x10' },
  { label: 'x100', value: 'x100' },
  { label: 'Max', value: 'max' }
]

const isActive = (multiplier: BuyMultiplier) => {
  return gameStore.buyMultiplier === multiplier
}

const setMultiplier = (multiplier: BuyMultiplier) => {
  gameStore.setBuyMultiplier(multiplier)
}
</script>