<template>
  <Transition name="modal-bounce">
    <div v-if="modal.isRevealed.value" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="modal.hide()">
      <div class="relative m-4 w-full max-w-md rounded-2xl bg-transparent p-0 shadow-2xl shadow-purple-500/20 overflow-hidden border border-purple-500/20">
        <div class="animated-border"></div>
        <div class="relative z-10 rounded-[14px] bg-gray-900 m-[2px] p-6">
          <h2 class="mb-3 text-center text-2xl font-bold text-purple-300">
            <Icon name="mdi:creation" class="mr-2" />
            {{ $t('singularity.confirmTitle') }}
          </h2>
          <p class="mb-6 text-center text-base text-gray-300">
            <i18n-t keypath="singularity.description" tag="span">
              <template #keep><b class="text-green-400">{{ $t('singularity.keepText') }}</b></template>
              <template #sp><span class="font-bold text-green-400">{{ $t('singularity.spText') }}</span></template>
            </i18n-t>
          </p>
          <p class="mb-6 text-center font-bold text-yellow-400">
            {{ $t('singularity.irreversible') }}
          </p>
          <div class="flex flex-col gap-3">
            <button
              v-if="isNative"
              @click="handleAdSingularity"
              :disabled="isLoading"
              class="w-full rounded-lg bg-yellow-500 text-black font-bold py-3 px-6 hover:bg-opacity-90 transition-all text-lg shadow-lg shadow-yellow-500/30 transform hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed group animate-shake"
            >
              <template v-if="isLoading">
                <Icon name="mdi:loading" class="animate-spin" />
                <span>加载中...</span>
              </template>
              <template v-else>
                <Icon name="mdi:movie-play" class="transition-transform duration-200 group-hover:scale-110" />
                <span>奇点跃迁 (x2 SP)</span>
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
                class="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-bold text-white shadow-lg shadow-purple-600/30 transition-colors hover:bg-purple-700 disabled:opacity-50"
                @click="modal.confirm()"
                :disabled="isLoading"
              >
                确认
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
import { useSingularityModal } from '~/composables/useSingularityModal'
import { useIsNative } from '~/utils/platform';
import { showRewardVideoAd } from '~/services/admob';
import { useToast } from '~/composables/useToast';

const modal = useSingularityModal()
const isNative = useIsNative();
const toast = useToast();
const isLoading = ref(false);

const handleAdSingularity = async () => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;
    await showRewardVideoAd('singularityBonus');
    // The global watcher in app.vue will handle the reward and singularity logic.
    modal.hide();
  } catch (error) {
    console.error('Error showing singularity reward ad:', error);
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
    rgba(192, 132, 252, 0.7), /* purple-300 */
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
