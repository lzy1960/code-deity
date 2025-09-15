<template>
  <div class="flex-grow flex flex-col items-center justify-center text-center p-4 md:p-8">

    <div class="mb-6">
      <p class="text-base text-gray-300/80">Compile & Release a new version:</p>
      <h1 class="text-6xl md:text-7xl font-bold text-teal-400 my-2">+1</h1>
      <p class="text-2xl font-semibold text-teal-400/90">Version</p>
    </div>

    <p class="text-base text-gray-400/80 mb-4">Current Version: <span class="font-bold text-white">{{ version }}</span></p>
    <p class="text-base text-gray-400/80 mb-8">Cost: <span class="font-bold text-red-400">{{ formatNumber(cost) }}</span> Refactor Points</p>
    
    <div class="w-full max-w-sm mx-auto">
      <button
        class="w-full rounded-xl h-16 text-xl font-bold text-white transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        :class="canCompile ? 'bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-600/30 hover:scale-105 active:scale-100' : 'bg-gray-700'"
        :disabled="!canCompile"
        @click="$emit('compileAndRelease')"
      >
        [ Compile & Release ]
      </button>
      <p v-if="!canCompile && version === 0" class="text-sm text-gray-400 mt-3">
        You need at least 25 Refactor Points to compile for the first time.
      </p>
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
