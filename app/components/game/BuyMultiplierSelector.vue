<template>
  <div class="flex items-center justify-center rounded-lg bg-[#191933] p-1 shadow-lg">
    <button
      v-for="multiplier in multipliers"
      :key="multiplier.value"
      class="flex-1 cursor-pointer rounded-md px-3 py-1 text-sm font-bold transition-colors"
      :class="isActive(multiplier.value) ? 'bg-[#4a4a8a] text-white' : 'text-[#9292c9] hover:bg-[#2a2a5f]'"
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