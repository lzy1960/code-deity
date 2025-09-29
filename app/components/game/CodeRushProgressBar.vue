<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '~/store/game';
import { useNow } from '@vueuse/core';

const gameStore = useGameStore();
const now = useNow({ interval: 1000 }); // Update every second

const progress = computed(() => gameStore.codeRushProgress);
const isReady = computed(() => gameStore.isCodeRushReady);
const isActive = computed(() => gameStore.isCodeRushActive);

const timeRemaining = computed(() => {
  if (isActive.value) {
    return Math.max(0, Math.floor((gameStore.codeRushActiveExpiry! - now.value.getTime()) / 1000));
  }
  return 0;
});

const progressBarClass = computed(() => {
  if (isReady.value) {
    return 'bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse'; // Added pulse for ready state
  } else if (isActive.value) {
    return 'bg-gradient-to-r from-red-500 to-orange-600 animate-code-rush-active'; // Enhanced active animation
  }
  return 'bg-gradient-to-r from-blue-400 to-cyan-500';
});

const progressText = computed(() => {
  if (isReady.value) {
    return 'Ready!';
  } else if (isActive.value) {
    return `Active: ${formatNumber(timeRemaining.value)}`;
  }
  return `Charging: ${progress.value.toFixed(0)}%`;
});
</script>

<template>
  <div class="w-full bg-gray-800 rounded-full h-4 mb-2 overflow-hidden relative">
    <div
      class="h-full rounded-full transition-all duration-1000 ease-linear"
      :class="progressBarClass"
      :style="{ width: `${progress}%` }"
    ></div>
    <div class="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
      {{ progressText }}
    </div>
  </div>
</template>

<style scoped>
@keyframes code-rush-active {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.animate-code-rush-active {
  background-size: 200% 200%;
  animation: code-rush-active 1.5s ease infinite;
}
</style>
