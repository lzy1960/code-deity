<template>
  <div class="flex-grow flex flex-col items-center justify-center text-center p-8">
    <h3 class="text-xl font-bold text-gray-400 mb-4">Compile & Release a new version</h3>
    <h1 class="text-5xl font-bold text-teal-400">+1</h1>
    <p class="text-2xl font-bold text-teal-400 mt-2">Version</p>
    <p class="text-sm text-gray-300 mt-4">Current Version: {{ version }}. Each version boosts RP effectiveness by 20%.</p>
    <p class="text-sm text-gray-300 mt-2">Cost: <span class="font-bold text-red-400">{{ formatNumber(cost) }}</span> Refactor Points</p>
    
    <div class="w-full max-w-[480px] mx-auto mt-8">
      <button
        class="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-5 text-white text-lg font-bold leading-normal tracking-wider shadow-lg transition-all"
        :class="canCompile ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/30' : 'bg-gray-600 cursor-not-allowed opacity-50'"
        :disabled="!canCompile"
        @click="$emit('compileAndRelease')"
      >
        <span class="truncate">[ Compile & Release ]</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type Decimal from 'break_infinity.js';
import { formatNumber } from '~/utils/format';

defineProps<{
  version: number;
  cost: Decimal;
  canCompile: boolean;
}>();

defineEmits(['compileAndRelease']);
</script>
