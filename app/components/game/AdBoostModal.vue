<template>
  <Transition name="modal-bounce">
    <div v-if="modal.isRevealed.value" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="modal.hide()">
      <div class="relative w-full max-w-lg m-4 rounded-2xl bg-transparent p-0 shadow-2xl shadow-cyan-500/20 overflow-hidden border border-cyan-500/20">
        <div class="animated-border"></div>
        <div class="relative z-10 rounded-[14px] bg-gray-900 m-[2px] overflow-hidden h-[80vh]">
          <div class="p-6 h-full flex flex-col">
            <button @click="modal.hide()" class="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors z-20">
              <Icon name="mdi:close-circle-outline" class="text-3xl" />
            </button>
            <h2 class="mb-4 text-center text-2xl font-bold text-cyan-300 shrink-0">
              <Icon name="mdi:rocket-launch" class="mr-2" />
              {{ $t('common.adBoostCenter') }}
            </h2>
            
            <div class="flex-1 overflow-y-auto pr-2 space-y-4 text-gray-300">
              <!-- Quantum Computing -->
              <AdBoostOption
                title="量子计算"
                description="提供 x5 CPS 乘数，持续 10 分钟。"
                icon="mdi:atom"
                :views-left="5 - gameStore.adViewsToday.quantumComputing"
                :is-active="isQuantumComputingActive"
                :active-text="`${$t('common.remaining')}: ${quantumComputingTimeLeft}`"
                :is-loading="loadingBoost === 'quantumComputing'"
                @trigger="activateBoost('quantumComputing')"
              />

              <!-- Neural Boost -->
              <AdBoostOption
                title="神经超频"
                description="手动超频效果提升10倍 (5% -> 50%)，持续 2 分钟。"
                icon="mdi:brain"
                :views-left="5 - gameStore.adViewsToday.neuralBoost"
                :is-active="isNeuralBoostActive"
                :active-text="`${$t('common.remaining')}: ${neuralBoostTimeLeft}`"
                :is-loading="loadingBoost === 'neuralBoost'"
                @trigger="activateBoost('neuralBoost')"
              />

              <!-- Supply Chain Optimization -->
              <AdBoostOption
                title="供应链优化"
                description="所有生成器购买成本降低 25%，持续 15 分钟。"
                icon="mdi:chart-line"
                :views-left="5 - gameStore.adViewsToday.supplyChainOptimization"
                :is-active="isSupplyChainActive"
                :active-text="`${$t('common.remaining')}: ${supplyChainTimeLeft}`"
                :is-loading="loadingBoost === 'supplyChainOptimization'"
                @trigger="activateBoost('supplyChainOptimization')"
              />

              <!-- Algorithm Breakthrough -->
              <AdBoostOption
                title="算法突破"
                description="你的下一次购买任意生成器的行为，成本降低 90%。(一次性)"
                icon="mdi:lightbulb-on-outline"
                :views-left="5 - gameStore.adViewsToday.algorithmBreakthrough"
                :is-active="gameStore.isAlgorithmBreakthroughActive"
                :active-text="$t('common.activated')"
                :is-loading="loadingBoost === 'algorithmBreakthrough'"
                @trigger="activateBoost('algorithmBreakthrough')"
              />

              <!-- Code Injection -->
              <AdBoostOption
                title="代码注入"
                description="立即获得相当于 1 小时产出的 CP。"
                icon="mdi:syringe"
                :views-left="5 - gameStore.adViewsToday.codeInjection"
                :is-loading="loadingBoost === 'codeInjection'"
                @trigger="activateBoost('codeInjection')"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAdBoostModal } from '~/composables/useAdBoostModal';
import { useGameStore } from '~/store/game';
import { showRewardVideoAd } from '~/services/admob';
import { useNow } from '@vueuse/core';
import { useToast } from '~/composables/useToast';
import AdBoostOption from './AdBoostOption.vue';

const modal = useAdBoostModal();
const gameStore = useGameStore();
const toast = useToast();
const now = useNow({ interval: 1000 });

type BoostType = 'quantumComputing' | 'supplyChainOptimization' | 'algorithmBreakthrough' | 'codeInjection' | 'neuralBoost';

const loadingBoost = ref<BoostType | null>(null);

const isQuantumComputingActive = computed(() => !!gameStore.quantumComputingExpiry && gameStore.quantumComputingExpiry > now.value.getTime());
const isSupplyChainActive = computed(() => !!gameStore.supplyChainOptimizationExpiry && gameStore.supplyChainOptimizationExpiry > now.value.getTime());
const isNeuralBoostActive = computed(() => !!gameStore.neuralBoostExpiry && gameStore.neuralBoostExpiry > now.value.getTime());

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
const neuralBoostTimeLeft = computed(() => formatTime(gameStore.neuralBoostExpiry));

async function activateBoost(type: BoostType) {
  if (loadingBoost.value) return;

  if (gameStore.adViewsToday[type] >= 5) {
    toast.addToast('今日观看次数已用完', 'warning');
    return;
  }
  
  if (type === 'algorithmBreakthrough' && gameStore.isAlgorithmBreakthroughActive) {
    toast.addToast('已有一个“算法突破”正在等待使用', 'info');
    return;
  }

  try {
    loadingBoost.value = type;
    // Fire-and-forget the reward logic. The global watcher will handle applying the reward.
    // We still await here so the loading spinner stops when the ad is closed.
    await showRewardVideoAd(type as BoostType);
  } catch (error) {
    console.error('Error showing reward video ad:', error);
    toast.addToast('广告加载失败，请稍后再试', 'error');
  } finally {
    loadingBoost.value = null;
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
