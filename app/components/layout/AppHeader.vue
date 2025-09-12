<template>
  <header class="sticky top-0 z-10 bg-[#101a23]/80 backdrop-blur-sm">
    <div class="flex items-center p-4 pb-2 justify-between">
      <div class="w-12"></div>
      <h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">{{ title }}</h2>
      <div class="flex w-12 items-center justify-end">
        <button @click="$router.push('/settings')" class="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0 hover:bg-white/10 transition-colors">
          <Icon name="mdi:cog" class="text-2xl" />
        </button>
      </div>
    </div>
    <div class="flex flex-col gap-2 bg-[#101a23] px-4 py-3 border-b border-[#21364a]">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-white text-2xl font-bold leading-tight tracking-tighter">{{ formatNumber(gameStore.currency) }} <span class="text-[#8eadcc] text-lg">CP</span></p>
          <p class="text-green-400 text-sm font-medium leading-normal">+ {{ formatNumber(gameStore.cps) }} CP/s</p>
        </div>
        <!-- The BuyMultiplierSelector will be placed here via a slot -->
        <slot name="actions"></slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useGameStore } from '~/store/game';
import { formatNumber } from '~/utils/format';

defineProps<{
  title: string;
}>();

const gameStore = useGameStore();
</script>