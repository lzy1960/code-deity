<template>
  <Transition name="modal-bounce">
    <div v-if="modal.isRevealed.value && modal.gains.value" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="modal.hide()">
      <div class="relative m-4 w-full max-w-md rounded-2xl bg-transparent p-0 shadow-2xl shadow-blue-500/20 overflow-hidden border border-blue-500/20">
        <div class="animated-border"></div>
        <div class="relative z-10 rounded-[14px] bg-gray-900 m-[2px] p-6">
          <h2 class="mb-4 text-center text-2xl font-bold text-blue-300">
            <Icon name="mdi:rocket-launch" class="mr-2" />
            确认代码重构?
          </h2>
          <p class="mb-6 text-center text-base text-gray-300">
            这将重置你当前的CP和生成器，以换取能永久提升生产力的重构点 (RP)。
          </p>
          
          <div class="space-y-3 rounded-lg bg-black/30 p-4 text-center">
            <div>
              <p class="text-sm text-gray-400">本次获得</p>
              <p class="text-2xl font-bold text-green-400">+{{ formatNumber(modal.gains.value.potentialRpGain) }} RP</p>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-400">RP 总量</p>
                <p class="font-mono"><span class="text-gray-500">{{ formatNumber(modal.gains.value.currentRefactorPoints) }}</span> -> <span class="font-bold text-white">{{ formatNumber(modal.gains.value.currentRefactorPoints.plus(modal.gains.value.potentialRpGain)) }}</span></p>
              </div>
              <div>
                <p class="text-gray-400">生产力加成</p>
                <p class="font-mono"><span class="text-gray-500">+{{ modal.gains.value.currentRpBonus.minus(1).times(100).toFixed(0) }}%</span> -> <span class="font-bold text-white">+{{ modal.gains.value.projectedRpBonus.minus(1).times(100).toFixed(0) }}%</span></p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex flex-col gap-3">
            <button
              v-if="isNative"
              @click="handleAdRefactor"
              :disabled="isLoading"
              class="w-full rounded-lg bg-yellow-500 text-black font-bold py-3 px-6 hover:bg-opacity-90 transition-all text-lg shadow-lg shadow-yellow-500/30 transform hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed group animate-shake"
            >
              <template v-if="isLoading">
                <Icon name="mdi:loading" class="animate-spin" />
                <span>加载中...</span>
              </template>
              <template v-else>
                <Icon name="mdi:movie-play" class="transition-transform duration-200 group-hover:scale-110" />
                <span>代码优化 (x2 RP)</span>
              </template>
            </button>
            <div class="flex justify-between gap-3">
              <button
                class="flex-1 rounded-lg border border-gray-600 px-6 py-3 font-bold text-gray-300 transition-colors hover:border-gray-400 hover:bg-gray-700 disabled:opacity-50"
                @click="modal.hide()"
                :disabled="isLoading"
              >
                取消
              </button>
              <button
                class="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:opacity-50"
                @click="modal.confirm()"
                :disabled="isLoading"
              >
                确认重构
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRefactorConfirmationModal } from '~/composables/useRefactorConfirmationModal';
import { formatNumber } from '~/utils/format';
import { showRewardVideoAd } from '~/services/admob';
import { useToast } from '~/composables/useToast';
import { useIsNative } from '~/utils/platform';

const modal = useRefactorConfirmationModal();
const toast = useToast();
const isLoading = ref(false);
const isNative = useIsNative();

const handleAdRefactor = async () => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;
    await showRewardVideoAd('refactorBonus');
    // The global watcher in app.vue will handle the reward and refactor logic.
    // We can close the modal optimistically here.
    modal.hide();
  } catch (error) {
    console.error('Error showing refactor reward ad:', error);
    toast.addToast('广告加载失败，请稍后再试', 'error');
  } finally {
    isLoading.value = false;
  }
};
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
    rgba(59, 130, 246, 0.7), /* blue-500 */
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

@keyframes shake {
  0%, 100% { transform: translateX(0) rotate(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px) rotate(-2deg); }
  20%, 40%, 60%, 80% { transform: translateX(2px) rotate(2deg); }
}

.animate-shake {
  animation: shake 1.5s infinite;
}

.group:hover .animate-shake {
  animation-play-state: paused;
}
</style>
