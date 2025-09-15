<template>
  <header class="sticky top-0 z-10 bg-[#101a23]/80 backdrop-blur-sm">
    <div class="flex items-center p-4 pb-2 justify-between">
      <div class="w-12"></div>
      <h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">{{ title }}</h2>
      <div class="flex w-12 items-center justify-end gap-2">
        <NuxtLink to="/settings" class="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0 hover:bg-white/10 transition-colors">
          <Icon name="mdi:cog" class="text-3xl" />
        </NuxtLink>
      </div>
    </div>
    <div class="flex flex-col gap-2 bg-[#101a23] px-4 py-3 border-b border-[#21364a]">
      <div class="flex justify-between items-start">
        <div>
          <div class="flex items-end gap-4">
            <div>
              <p class="text-white text-2xl font-bold leading-tight tracking-tighter">{{ formatNumber(gameStore.currency) }} <span class="text-[#8eadcc] text-lg">CP</span></p>
            </div>
            <div v-if="gameStore.refactorCount > 0 || gameStore.refactorPoints.gt(0)" class="pb-0.5">
              <p class="font-bold leading-tight tracking-tighter text-green-400 text-xl">{{ formatNumber(gameStore.refactorPoints) }} <span class="text-base text-green-400/80">RP</span></p>
            </div>
          </div>
          <div class="flex items-center gap-2 mt-1">
            <p class="text-green-400 text-sm font-medium leading-normal">+ {{ formatNumber(gameStore.cps) }} CP/s</p>
            <div v-if="gameStore.architecturalOverheadPenalty < 1" class="flex items-center gap-1 text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full text-xs font-bold pulse-animation-slow" title="架构过载：拥有超过10个AI核心导致了效率惩罚">
              <Icon name="mdi:alert-circle-outline" />
              <span>效率: {{ (gameStore.architecturalOverheadPenalty * 100).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
        <!-- The BuyMultiplierSelector will be placed here via a slot -->
        <slot name="actions"></slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useGameStore } from '~/store/game';
import { useAuthStore } from '~/store/auth';
import { formatNumber } from '~/utils/format';

defineProps<{
  title: string;
}>();

const gameStore = useGameStore();
const authStore = useAuthStore();
</script>

<style scoped>
@keyframes pulse-slow {
    0%, 100% {
        transform: scale(1);
        opacity: 0.9;
    }
    50% {
        transform: scale(1.02);
        opacity: 1;
    }
}
.pulse-animation-slow {
    animation: pulse-slow 2.5s infinite;
}
</style>
