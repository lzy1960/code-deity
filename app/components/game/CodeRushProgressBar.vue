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
  <div class="rush-progress">
    <div
      class="rush-fill"
      :class="{ ready: isReady, active: isActive }"
      :style="{ width: `${progress}%` }"
    ></div>
    <div class="rush-label">
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

.rush-progress {
  position: relative;
  width: 100%;
  height: 1rem;
  overflow: hidden;
  border: 1px solid rgba(76, 165, 255, 0.28);
  border-radius: 999px;
  background: rgba(8, 15, 24, 0.76);
}

.rush-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(76, 165, 255, 0.72), rgba(154, 247, 189, 0.58));
  transition: width 1s linear;
}

.rush-fill.ready {
  background: linear-gradient(90deg, rgba(154, 247, 189, 0.84), rgba(76, 165, 255, 0.72));
  animation: pulse 1s ease-in-out infinite alternate;
}

.rush-fill.active {
  background: linear-gradient(90deg, rgba(76, 165, 255, 0.86), rgba(154, 247, 189, 0.78));
  background-size: 200% 200%;
  animation: code-rush-active 1.5s ease infinite;
}

.rush-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 900;
}

@keyframes pulse {
  from { filter: brightness(1); }
  to { filter: brightness(1.22); }
}
</style>
