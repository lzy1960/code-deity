<template>
  <Transition name="modal-bounce">
    <div v-if="modal.isRevealed.value" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="modal.hide()">
      <div class="relative w-full max-w-lg m-4 rounded-2xl bg-transparent p-0 shadow-2xl shadow-cyan-500/20 overflow-hidden border border-cyan-500/20">
        <div class="animated-border"></div>
        <div class="relative z-10 rounded-[14px] bg-gray-900 m-[2px] h-full overflow-hidden">
          <div class="p-6 h-full flex flex-col">
            <h2 class="mb-4 text-center text-2xl font-bold text-cyan-300 shrink-0">
              <Icon name="mdi:rocket-launch" class="mr-2" />
              广告增益中心
            </h2>
            
            <div class="flex-1 overflow-y-auto pr-2 space-y-4 text-gray-300">
              <!-- Quantum Computing -->
              <AdBoostOption
                title="量子计算"
                description="提供 x5 CPS 乘数，持续 10 分钟。"
                icon="mdi:atom"
                :views-left="5 - gameStore.adViewsToday.quantumComputing"
                :is-active="isQuantumComputingActive"
                :active-text="`剩余: ${quantumComputingTimeLeft}`"
                @trigger="activateBoost('quantumComputing')"
              />

              <!-- Supply Chain Optimization -->
              <AdBoostOption
                title="供应链优化"
                description="所有生成器购买成本降低 25%，持续 15 分钟。"
                icon="mdi:chart-line"
                :views-left="5 - gameStore.adViewsToday.supplyChainOptimization"
                :is-active="isSupplyChainActive"
                :active-text="`剩余: ${supplyChainTimeLeft}`"
                @trigger="activateBoost('supplyChainOptimization')"
              />

              <!-- Inspiration Burst -->
              <AdBoostOption
                title="灵感迸发"
                description="立即获得当前重构可产生 25% 的 RP。"
                icon="mdi:lightbulb-on"
                :views-left="5 - gameStore.adViewsToday.inspirationBurst"
                @trigger="activateBoost('inspirationBurst')"
              />

              <!-- Code Injection -->
              <AdBoostOption
                title="代码注入"
                description="立即获得相当于 1 小时产出的 CP。"
                icon="mdi:syringe"
                :views-left="5 - gameStore.adViewsToday.codeInjection"
                @trigger="activateBoost('codeInjection')"
              />
            </div>

            <div class="mt-6 text-center shrink-0">
              <button
                class="rounded-lg bg-cyan-600 px-8 py-3 font-bold text-white shadow-lg shadow-cyan-600/30 transition-colors hover:bg-cyan-700"
                @click="modal.hide()"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAdBoostModal } from '~/composables/useAdBoostModal';
import { useGameStore } from '~/store/game';
import { showRewardVideoAd } from '~/services/admob';
import { useNow } from '@vueuse/core';
import AdBoostOption from './AdBoostOption.vue'; // We will create this sub-component next

const modal = useAdBoostModal();
const gameStore = useGameStore();
const now = useNow({ interval: 1000 });

type BoostType = 'quantumComputing' | 'supplyChainOptimization' | 'inspirationBurst' | 'codeInjection';

const isQuantumComputingActive = computed(() => gameStore.quantumComputingExpiry && gameStore.quantumComputingExpiry > now.value.getTime());
const isSupplyChainActive = computed(() => gameStore.supplyChainOptimizationExpiry && gameStore.supplyChainOptimizationExpiry > now.value.getTime());

const formatTime = (expiry: number | null) => {
  if (!expiry) return '00:00';
  const remaining = Math.max(0, expiry - now.value.getTime());
  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

const quantumComputingTimeLeft = computed(() => formatTime(gameStore.quantumComputingExpiry));
const supplyChainTimeLeft = computed(() => formatTime(gameStore.supplyChainOptimizationExpiry));

async function activateBoost(type: BoostType) {
  if (gameStore.adViewsToday[type] >= 5) {
    // Optional: show a toast message
    return;
  }

  const success = await showRewardVideoAd();
  if (success) {
    switch (type) {
      case 'quantumComputing':
        gameStore.activateQuantumComputing();
        break;
      case 'supplyChainOptimization':
        gameStore.activateSupplyChainOptimization();
        break;
      case 'inspirationBurst':
        gameStore.applyInspirationBurst();
        break;
      case 'codeInjection':
        gameStore.applyCodeInjection();
        break;
    }
  }
}
</script>

<style scoped>
.modal-bounce-enter-active,
.modal-bounce-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.modal-bounce-enter-from,
.modal-bounce-leave-to {
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
    rgba(34, 211, 238, 0.7), /* cyan-400 */
    transparent 35%
  );
  transform: translate(-50%, -50%);
  animation: rotate 5s cubic-bezier(0.65, -0.5, 0.25, 1.5) infinite;
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
