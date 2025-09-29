<template>
  <header class="sticky top-0 z-10 bg-[#101a23]/80 backdrop-blur-sm transition-all duration-500" :class="{ 'shadow-[0_0_15px_rgba(192,132,252,0.5)] border-b border-purple-400/50': canSingularity }">
    <div class="flex items-center p-4 pb-2 justify-between">
      <div class="w-auto">
        <button v-if="canSingularity" @click="$emit('singularityClick')" class="px-3 h-10 rounded-lg bg-purple-600 text-white font-bold text-sm animate-pulse shadow-lg shadow-purple-500/50 flex items-center justify-center gap-2">
          <Icon name="mdi:creation" class="text-xl" />
          <span>{{ $t('common.singularity') }}</span>
        </button>
      </div>
      <h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">{{ title }}</h2>
      <div class="flex w-auto items-center justify-end gap-1">
        <button @click="genesisLogModal.show()" class="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 w-8 bg-transparent text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0 hover:bg-white/10 transition-colors">
          <Icon name="mdi:console-line" class="text-2xl" />
        </button>
        <button @click="helpModal.show()" class="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 w-8 bg-transparent text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0 hover:bg-white/10 transition-colors">
          <Icon name="mdi:help-circle-outline" class="text-2xl" />
        </button>
        <NuxtLink to="/settings" class="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 w-8 bg-transparent text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0 hover:bg-white/10 transition-colors">
          <Icon name="mdi:cog" class="text-2xl" />
        </NuxtLink>
      </div>
    </div>
    <div class="flex flex-col gap-2 bg-[#101a23] px-4 py-2 border-b border-[#21364a]">
      <!-- Row 1: Main Currencies -->
      <div class="flex justify-between items-center">
        <div class="flex items-baseline gap-4">
          <p class="text-white text-lg font-bold leading-tight tracking-tighter">{{ formatNumber(gameStore.currency) }} <span class="text-[#8eadcc] text-sm">{{ $t('common.computingPowerShort') }}</span></p>
          <div v-if="gameStore.refactorCount > 0 || gameStore.refactorPoints.gt(0)">
            <p class="font-bold leading-tight tracking-tighter text-green-400 text-base">{{ formatNumber(gameStore.refactorPoints) }} <span class="text-xs text-green-400/80">{{ $t('common.refactorPointsShort') }}</span></p>
          </div>
        </div>
      </div>
      <!-- Row 2: Production Info & Actions -->
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <p class="text-green-400 text-xs font-medium leading-normal">+ {{ formatNumber(gameStore.cps) }} {{ $t('common.cpsShort') }}</p>
          <div v-if="gameStore.architecturalOverheadPenalty < 1" class="flex items-center gap-1 text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full text-xs font-bold pulse-animation-slow" :title="$t('common.architecturalOverheadHint')">
            <Icon name="mdi:alert-circle-outline" />
            <span>{{ $t('common.efficiency') }} {{ (gameStore.architecturalOverheadPenalty * 100).toFixed(1) }}%</span>
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
import { formatNumber } from '~/utils/format';
import { useHelpModal } from '~/composables/useHelpModal';
import { useGenesisLogModal } from '~/composables/useGenesisLogModal';

defineProps<{
  title: string;
  canSingularity: boolean;
}>();

defineEmits(['singularityClick']);

const gameStore = useGameStore();
const helpModal = useHelpModal();
const genesisLogModal = useGenesisLogModal();
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
