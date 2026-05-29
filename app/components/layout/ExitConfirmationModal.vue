<template>
  <Transition name="modal-bounce">
    <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm" @click.self="hide">
      <div class="relative m-4 w-full max-w-sm rounded-2xl bg-transparent p-0 shadow-2xl shadow-cyan-500/20 overflow-hidden border border-cyan-500/20">
        <div class="animated-border"></div>
        <div class="relative z-10 rounded-[14px] bg-gray-900 m-[2px] p-4">
          <h2 class="mb-3 text-center text-base font-bold text-cyan-300">
            {{ $t('common.confirmExit') }}
          </h2>
          <p class="mb-4 text-center text-xs text-gray-300">
            {{ $t('common.confirmCloseApp') }}
          </p>
          <div class="flex justify-between gap-3">
            <button
              class="flex-1 rounded-lg border border-gray-600 px-4 py-2 text-sm font-bold text-gray-300 transition-colors hover:border-gray-400 hover:bg-gray-700"
              @click="hide"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              class="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 shadow-lg shadow-red-600/30"
              @click="confirm"
            >
              {{ $t('common.exit') }}
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
