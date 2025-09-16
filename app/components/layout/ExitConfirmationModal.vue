<template>
  <Transition name="modal-bounce">
    <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm" @click.self="hide">
      <div class="relative m-4 w-full max-w-sm rounded-lg bg-transparent p-0 shadow-2xl shadow-cyan-500/10 overflow-hidden border border-cyan-500/20">
        <div class="animated-border"></div>
        <div class="relative z-10 rounded-[6px] bg-[#101a23] m-[2px] p-6">
          <h2 class="mb-4 text-center text-xl font-bold text-white">
            确认退出
          </h2>
          <p class="mb-6 text-center text-base text-gray-300">
            确定要关闭 Code Deity 吗？
          </p>
          <div class="flex justify-around">
            <button
              class="rounded-md border border-gray-600 px-8 py-2 text-gray-300 transition-colors hover:border-gray-400 hover:bg-gray-700"
              @click="hide"
            >
              取消
            </button>
            <button
              class="rounded-md bg-red-600 px-8 py-2 text-white transition-colors hover:bg-red-700"
              @click="confirm"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useExitConfirmationModal } from '~/composables/useExitConfirmationModal'

const { isVisible, hide, confirm } = useExitConfirmationModal()

watch(isVisible, (newValue) => {
  if (newValue) {
    document.body.classList.add('overflow-hidden')
  } else {
    document.body.classList.remove('overflow-hidden')
  }
})
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
