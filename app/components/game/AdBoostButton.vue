<template>
  <div v-if="isAdMobInitialized" class="fixed bottom-24 right-4 z-50">
    <button
      @click="handleClick"
      class="flex items-center justify-center w-16 h-16 rounded-full text-white shadow-lg transition-all transform hover:scale-110 active:scale-100"
      :class="buttonClass"
    >
      <div v-if="isAnyBoostActive" class="text-center">
        <p class="text-xs font-bold">
          <Icon name="mdi:flash" />
        </p>
        <p class="text-sm font-mono">Active</p>
      </div>
      <Icon v-else name="mdi:rocket-launch" class="text-3xl" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '~/store/game';
import { isAdMobInitialized } from '~/services/admob';
import { useNow } from '@vueuse/core';
import { useAdBoostModal } from '~/composables/useAdBoostModal';

const gameStore = useGameStore();
const adBoostModal = useAdBoostModal();
const now = useNow({ interval: 1000 });

const isQuantumComputingActive = computed(() => {
  return gameStore.quantumComputingExpiry !== null && gameStore.quantumComputingExpiry > now.value.getTime();
});

const isSupplyChainActive = computed(() => {
  return gameStore.supplyChainOptimizationExpiry !== null && gameStore.supplyChainOptimizationExpiry > now.value.getTime();
});

const isAnyBoostActive = computed(() => {
  return isQuantumComputingActive.value || isSupplyChainActive.value;
});

const buttonClass = computed(() => {
  if (isAnyBoostActive.value) {
    return 'bg-gradient-to-br from-green-400 to-cyan-500';
  }
  return 'bg-gradient-to-br from-purple-600 to-blue-500 animate-pulse';
});

function handleClick() {
  adBoostModal.show();
}
</script>
