<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore } from '~/store/game';
import { useNow, useDraggable, useWindowSize } from '@vueuse/core';
import { useAdBoostModal } from '~/composables/useAdBoostModal';
import { useIsNative } from '~/utils/platform';
import Guidance from '~/components/layout/Guidance.vue';

const gameStore = useGameStore();
const adBoostModal = useAdBoostModal();
const now = useNow({ interval: 1000 });
const isNative = useIsNative();

// --- Guidance Logic ---
const guidanceShown = ref(false);
const shouldShowGuidance = computed(() => {
  // The v-if on the root element already checks for isNative
  return gameStore.isAdBoostUnlocked && !guidanceShown.value;
});

// --- Draggable Logic ---
const el = ref<HTMLElement | null>(null);
const { width: windowWidth } = useWindowSize();

const { x, y, style, isDragging } = useDraggable(el, {
  initialValue: { x: window.innerWidth - 80, y: window.innerHeight - 180 },
  preventDefault: true,
  onEnd: () => {
    // Snap to the nearest edge (left or right)
    if (x.value < windowWidth.value / 2) {
      x.value = 16; // Snap to left with some padding
    } else {
      x.value = windowWidth.value - el.value!.offsetWidth - 16; // Snap to right
    }
  }
});

// --- Boost State Logic ---
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
  // Prevent click from triggering if it was a drag
  if (isDragging.value) return;
  adBoostModal.show();
}
</script>

<template>
  <div
    v-if="isNative && gameStore.isAdBoostUnlocked"
    ref="el"
    :style="style"
    style="position: fixed; touch-action: none;"
    class="z-50"
    :class="{ 'transition-all duration-300 ease-in-out': !isDragging }"
  >
    <button
      @click="handleClick"
      class="flex items-center justify-center p-3 rounded-full text-white shadow-lg transition-all transform active:scale-95"
      :class="[buttonClass, { 'scale-110 opacity-80': isDragging }]"
    >
      <div v-if="isAnyBoostActive" class="text-center">
        <p class="text-xs font-bold">
          <Icon name="mdi:flash" />
        </p>
        <p class="text-sm font-mono">Active</p>
      </div>
      <Icon v-else name="mdi:rocket-launch" class="text-2xl" />
    </button>

    <Guidance
      :show="shouldShowGuidance"
      :target="el"
      title="解锁增益功能！"
      text="点击这里，通过观看广告获得强大的临时增益，加速你的发展！"
      placement="top"
      @dismiss="guidanceShown = true"
    />
  </div>
</template>
