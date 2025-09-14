<template>
  <div class="flex-grow flex flex-col items-center justify-center text-center p-8">
    <p class="text-base text-gray-300">Current Bonus: <span class="font-bold text-green-400">+{{ currentRpBonus.minus(1).times(100).toFixed(2) }}%</span></p>
    <h3 class="text-xl font-bold text-gray-400 my-4">You will gain from this refactor:</h3>
    <h1 class="text-5xl font-bold text-green-400 pulse-animation">+{{ potentialRpGain }}</h1>
    <p class="text-2xl font-bold text-green-400 mt-2">Refactor Points (RP)</p>
    
    <div class="w-full max-w-[480px] mx-auto mt-8">
      <button
        class="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-5 text-white text-lg font-bold leading-normal tracking-wider shadow-lg transition-all"
        :class="canRefactor ? 'bg-[#3899fa] hover:bg-[#2c88e8] shadow-[#3899fa]/30' : 'bg-gray-600 cursor-not-allowed opacity-50'"
        :disabled="!canRefactor"
        @click="$emit('refactor')"
      >
        <span class="truncate">[ Confirm Refactor ]</span>
      </button>
      <p v-if="!canRefactor" class="text-sm text-gray-400 mt-2">
        You need at least {{ unlockRequirement }} AI Cores to refactor.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type Decimal from 'break_infinity.js';

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
        text-shadow: 0 0 5px #4ade80, 0 0 10px #4ade80, 0 0 15px #4ade80;
    }
    50% {
        transform: scale(1.05);
        text-shadow: 0 0 20px #4ade80, 0 0 30px #4ade80, 0 0 40px #4ade80;
    }
}
.pulse-animation {
    animation: pulse 2s infinite;
}
</style>