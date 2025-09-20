<template>
  <Transition name="panel-bounce">
    <div v-if="gameStore.activeRefactoring" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div class="relative w-full max-w-lg m-4 rounded-2xl bg-transparent p-0 shadow-2xl shadow-red-500/20 overflow-hidden border border-red-500/20">
        <div class="animated-border"></div>
        <div class="relative z-10 rounded-[14px] bg-gray-900 m-[2px] p-5">
          <h3 class="text-xl font-bold text-red-300 text-center mb-3">
            <Icon name="mdi:alert-octagon" />
            {{ $t('common.technicalDebtRepayment') }}
          </h3>
          
          <div class="bg-black/30 p-4 rounded-lg text-center">
            <p class="text-sm text-gray-300">
              {{ $t('common.refactoringInProgress') }} <span class="font-bold text-white">{{ paradigmName }}</span>
            </p>
            <p class="mt-2 text-sm text-gray-400">
              {{ $t('common.willRefund') }} <span class="font-bold text-green-400">{{ formatNumber(gameStore.activeRefactoring.frozenSP) }}</span> SP
            </p>
            <p class="mt-1 text-sm text-gray-400">
              {{ $t('common.needsRepayment') }} <span class="font-bold text-red-400">{{ formatNumber(gameStore.activeRefactoring.cpCost) }}</span> CP
            </p>
            <div class="mt-1 text-xs text-yellow-400/80">
              {{ $t('common.globalCpPenalty') }}
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-4">
            <button @click="gameStore.cancelParadigmRefactor" class="px-4 py-2 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-500 transition-colors">
              {{ $t('common.cancel') }}
            </button>
            <button 
              @click="gameStore.confirmParadigmRefactor" 
              :disabled="!canConfirm"
              class="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition-colors disabled:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ $t('common.confirmRepayment') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '~/store/game';
import { paradigmConfigs } from '~~/game/paradigms.configs';
import { formatNumber } from '~/utils/format';

const gameStore = useGameStore();

const paradigmName = computed(() => {
  if (!gameStore.activeRefactoring) return '';
  return $t('paradigms.' + gameStore.activeRefactoring!.paradigmId + '.name') || $t('common.unknownSkill');
});

const canConfirm = computed(() => {
  if (!gameStore.activeRefactoring) return false;
  return gameStore.currency.gte(gameStore.activeRefactoring.cpCost);
});
</script>

<style scoped>
.panel-bounce-enter-active,
.panel-bounce-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.panel-bounce-enter-from,
.panel-bounce-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.animated-border {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    transparent,
    rgba(239, 68, 68, 0.7), /* red-500 */
    transparent 35%
  );
  transform: translate(-50%, -50%);
  animation: rotate 3s cubic-bezier(0.65, -0.5, 0.25, 1.5) infinite;
  z-index: 0;
}

@keyframes rotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate(-50%, -50%) rotate(180deg) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg) scale(1);
    opacity: 0.7;
  }
}
</style>
