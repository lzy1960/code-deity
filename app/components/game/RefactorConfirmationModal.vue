<template>
  <Transition name="modal-bounce">
    <div v-if="modal.isRevealed.value && modal.gains.value" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="modal.hide()">
      <div class="relative m-4 w-full max-w-md rounded-2xl bg-transparent p-0 shadow-2xl shadow-blue-500/20 overflow-hidden border border-blue-500/20">
        <div class="animated-border"></div>
        <div class="relative z-10 rounded-[14px] bg-gray-900 m-[2px] p-6">
          <h2 class="mb-4 text-center text-2xl font-bold text-blue-300">
            <Icon name="mdi:rocket-launch" class="mr-2" />
            {{ $t('common.confirmRefactor') }}
          </h2>
          <p class="mb-6 text-center text-base text-gray-300">
            {{ $t('common.refactorEventDescription') }}
          </p>

          <div class="space-y-3 rounded-lg bg-black/30 p-4 text-center">
            <div>
              <p class="text-sm text-gray-400">{{ $t('common.gainFromRefactor') }}</p>
              <p class="text-2xl font-bold text-green-400">+{{ formatNumber(modal.gains.value.potentialRpGain) }} RP</p>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-400">{{ $t('common.totalRefactorPoints') }}</p>
                <p class="font-mono">
                  <span class="text-gray-500">{{ formatNumber(modal.gains.value.currentRefactorPoints) }}</span>
                  →
                  <span class="font-bold text-white">{{ formatNumber(modal.gains.value.currentRefactorPoints.plus(modal.gains.value.potentialRpGain)) }}</span>
                </p>
              </div>
              <div>
                <p class="text-gray-400">{{ $t('common.currentBonus') }}</p>
                <p class="font-mono">
                  <span class="text-gray-500">+{{ modal.gains.value.currentRpBonus.minus(1).times(100).toFixed(0) }}%</span>
                  →
                  <span class="font-bold text-white">+{{ modal.gains.value.projectedRpBonus.minus(1).times(100).toFixed(0) }}%</span>
                </p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-between gap-3">
            <button
              class="flex-1 rounded-lg border border-gray-600 px-6 py-3 font-bold text-gray-300 transition-colors hover:border-gray-400 hover:bg-gray-700"
              @click="modal.hide()"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              class="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-700"
              @click="modal.confirm()"
            >
              {{ $t('common.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useRefactorConfirmationModal } from '~/composables/useRefactorConfirmationModal';
import { formatNumber } from '~/utils/format';

const modal = useRefactorConfirmationModal();
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
    rgba(59, 130, 246, 0.7),
    transparent 35%
  );
  transform: translate(-50%, -50%);
  animation: rotate 5s cubic-bezier(0.65, -0.5, 0.25, 1.5) infinite;
  z-index: 0;
}

@keyframes rotate {
  0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); opacity: 0.7; }
  50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.1); opacity: 1; }
  100% { transform: translate(-50%, -50%) rotate(360deg) scale(1); opacity: 0.7; }
}
</style>
