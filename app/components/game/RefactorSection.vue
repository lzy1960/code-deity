<template>
  <div class="flex-grow flex flex-col items-center justify-center text-center p-4 md:p-8">
    
    <div class="mb-6">
      <p class="text-base text-gray-300/80">You will gain from this refactor:</p>
      <h1 class="text-6xl md:text-7xl font-bold text-green-400 pulse-animation my-2">+{{ formatNumber(potentialRpGain) }}</h1>
      <p class="text-2xl font-semibold text-green-400/90">Refactor Points (RP)</p>
    </div>

    <p class="text-base text-gray-400/80 mb-8">Current Bonus: <span class="font-bold text-green-300">+{{ currentRpBonus.minus(1).times(100).toFixed(2) }}%</span> to all production</p>
    
    <div class="w-full max-w-sm mx-auto">
      <button
        class="w-full rounded-xl h-16 text-xl font-bold text-white transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        :class="canRefactor ? 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-100' : 'bg-gray-700'"
        :disabled="!canRefactor"
        @click="$emit('refactor')"
      >
        [ Confirm Refactor ]
      </button>
      <p v-if="!canRefactor" class="text-sm text-gray-400 mt-3">
        You need at least {{ unlockRequirement }} AI Cores to refactor.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type Decimal from 'break_infinity.js';
import { formatNumber } from '~/utils/format';

defineProps<{
  potentialRpGain: number;
  canRefactor: boolean;
  currentRpBonus: Decimal;
  unlockRequirement: number;
}>();

defineEmits(['refactor']);
</script>

<style scoped>
@keyframes pulse {
    0%,
    100% {
        transform: scale(1);
        text-shadow: 0 0 8px rgba(74, 222, 128, 0.4), 0 0 12px rgba(74, 222, 128, 0.3);
    }
    50% {
        transform: scale(1.03);
        text-shadow: 0 0 12px rgba(74, 222, 128, 0.6), 0 0 20px rgba(74, 222, 128, 0.4);
    }
}
.pulse-animation {
    animation: pulse 2.5s infinite ease-in-out;
}
</style>
