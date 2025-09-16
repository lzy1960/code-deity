<template>
  <Transition name="modal-bounce">
    <div
      v-if="modal.isRevealed.value"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      @click.self="modal.hide()"
    >
      <div class="relative w-full max-w-md rounded-2xl bg-transparent shadow-2xl m-4 overflow-hidden border border-purple-500/20">
        <div class="animated-border"></div>
        <div class="relative z-10 rounded-[14px] bg-gray-800 m-[2px] p-6 text-center">
          <h2 class="text-2xl font-bold text-purple-300 mb-3">
            解锁新的范式？
          </h2>
          
          <div v-if="modal.paradigmToPurchase.value" class="my-5 p-4 bg-gray-900 rounded-lg">
            <p class="text-xl font-semibold text-white">{{ modal.paradigmToPurchase.value.name }}</p>
            <p class="text-sm text-gray-400 mt-1">{{ modal.paradigmToPurchase.value.description }}</p>
            <div class="mt-4 inline-block px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full font-bold">
              花费: {{ modal.paradigmToPurchase.value.cost }} SP
            </div>
          </div>

          <p class="text-gray-400 mb-6">
            这将消耗您的奇点算力 (SP)。此操作不可撤销。
          </p>

          <div class="flex justify-center gap-4">
            <button
              @click="modal.hide()"
              class="px-8 py-3 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              取消
            </button>
            <button
              @click="modal.confirm()"
              class="px-8 py-3 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-500 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-lg shadow-purple-600/30"
            >
              确认解锁
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useParadigmPurchaseModal } from '~/composables/useParadigmPurchaseModal'

const modal = useParadigmPurchaseModal()
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
</style>
