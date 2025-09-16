<template>
  <div v-if="isAdMobInitialized" class="fixed bottom-24 right-4 z-50">
    <button
      @click="handleClick"
      :disabled="isDisabled"
      class="flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg transition-all transform hover:scale-110 active:scale-100 disabled:cursor-not-allowed disabled:opacity-60"
      :class="buttonClass"
    >
      <div v-if="isBoostActive" class="text-center">
        <p class="text-xs font-bold">x2</p>
        <p class="text-sm font-mono">{{ formattedTime }}</p>
      </div>
      <Icon v-else name="mdi:rocket-launch" class="text-3xl" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '~/store/game';
import { showRewardVideoAd, isAdMobInitialized } from '~/services/admob';
import { useNow, useIntervalFn } from '@vueuse/core';

const gameStore = useGameStore();
const now = useNow({ interval: 1000 });

const isBoostActive = computed(() => {
  return gameStore.adBoostExpiry !== null && gameStore.adBoostExpiry > now.value.getTime();
});

const isCooldownActive = computed(() => {
  return gameStore.adBoostCooldownExpiry !== null && gameStore.adBoostCooldownExpiry > now.value.getTime();
});

const isDisabled = computed(() => {
  return isBoostActive.value || isCooldownActive.value;
});

const remainingTime = computed(() => {
  if (!isBoostActive.value) return 0;
  return Math.max(0, gameStore.adBoostExpiry! - now.value.getTime());
});

const formattedTime = computed(() => {
  const totalSeconds = Math.floor(remainingTime.value / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
});

const buttonClass = computed(() => {
  if (isBoostActive.value) {
    return 'bg-gradient-to-br from-green-400 to-cyan-500';
  }
  if (isCooldownActive.value) {
    return 'bg-gray-600';
  }
  return 'bg-gradient-to-br from-purple-600 to-blue-500 animate-pulse';
});

async function handleClick() {
  if (isDisabled.value) return;

  const success = await showRewardVideoAd();
  if (success) {
    gameStore.activateAdBoost();
  }
}
</script>
