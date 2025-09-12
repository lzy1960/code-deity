<template>
  <div class="space-y-4">
    <h2 class="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">Statistics</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-[#191933] p-4 rounded-lg">
        <p class="text-gray-400">Total Refactors</p>
        <p class="text-2xl font-bold">{{ formatNumber(gameStore.refactorCount) }}</p>
      </div>
      <div class="bg-[#191933] p-4 rounded-lg">
        <p class="text-gray-400">Total Refactor Points (RP)</p>
        <p class="text-2xl font-bold">{{ formatNumber(gameStore.refactorPoints) }}</p>
      </div>
      <div class="bg-[#191933] p-4 rounded-lg">
        <p class="text-gray-400">Current Version</p>
        <p class="text-2xl font-bold">{{ formatNumber(gameStore.version) }}</p>
      </div>
      <div class="bg-[#191933] p-4 rounded-lg">
        <p class="text-gray-400">Code Power per second (CPS)</p>
        <p class="text-2xl font-bold">{{ formatNumber(gameStore.cps) }}</p>
      </div>
      <div class="bg-gradient-to-br from-purple-600 to-blue-500 p-4 rounded-lg col-span-1 md:col-span-2 text-center">
        <p class="text-white/90">Total Production Bonus from RP & Version</p>
        <p class="text-3xl font-bold text-white">+{{ formatNumber(gameStore.rpBonus.minus(1).times(100)) }}%</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/store/game';
import { formatNumber } from '~/utils/format';

const gameStore = useGameStore();
</script>