<template>
  <Transition name="modal-bounce">
    <div v-if="modal.isRevealed.value" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="modal.hide()">
      <div class="relative m-4 w-full max-w-md rounded-2xl bg-transparent p-0 shadow-2xl shadow-purple-500/20 overflow-hidden border border-purple-500/20">
        <div class="animated-border"></div>
        <div class="relative z-10 rounded-[14px] bg-gray-900 m-[2px] p-6">
          <h2 class="mb-3 text-center text-2xl font-bold text-purple-300">
            <Icon name="mdi:creation" class="mr-2" />
            确认进入技术奇点？
          </h2>
          <p class="mb-6 text-center text-base text-gray-300">
            这将是你当前纪元的终点。你将失去所有算力、生成器、重构点和版本号，以换取强大的 <span class="font-bold text-green-400">奇点算力 (SP)</span>，开启一个全新的纪元。
          </p>
          <p class="mb-6 text-center font-bold text-yellow-400">
            此操作不可逆转。
          </p>
          <div class="flex justify-around">
            <button
              class="rounded-lg border border-gray-600 px-8 py-3 font-bold text-gray-300 transition-colors hover:border-gray-400 hover:bg-gray-700"
              @click="modal.hide()"
            >
              取消
            </button>
            <button
              class="rounded-lg bg-purple-600 px-8 py-3 font-bold text-white shadow-lg shadow-purple-600/30 transition-colors hover:bg-purple-700"
              @click="modal.confirm()"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useSingularityModal } from '~/composables/useSingularityModal'

const modal = useSingularityModal()
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
