<template>
  <div class="rounded-lg bg-gradient-to-br from-[#2a2a5f] to-[#1e1e48] p-4 text-center shadow-lg">
    <p class="text-base text-gray-300">Current Bonus: <span class="font-bold text-green-400">+{{ currentRpBonus.minus(1).times(100).toFixed(2) }}%</span></p>
    <p class="text-lg font-semibold mt-1">Potential RP Gain on Refactor: <span class="text-xl font-bold text-cyan-400">{{ potentialRpGain }}</span></p>
    <button
      class="mt-4 w-full items-center justify-center rounded-md px-6 py-3 text-base font-bold text-white shadow-md transition-all"
      :class="canRefactor ? 'bg-cyan-500 hover:scale-105 cursor-pointer' : 'bg-gray-600 cursor-not-allowed opacity-50'"
      :disabled="!canRefactor"
      @click="$emit('refactor')"
    >
      <span class="truncate">Refactor Code</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

import type Decimal from 'break_infinity.js';

defineProps<{
  potentialRpGain: number;
  canRefactor: boolean;
  currentRpBonus: Decimal;
}>();

defineEmits(['refactor']);
</script>