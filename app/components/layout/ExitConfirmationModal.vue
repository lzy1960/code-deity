<template>
  <Transition name="modal-bounce">
    <div v-if="isVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm" @click.self="hide">
      <div class="m-4 w-full max-w-sm rounded-lg border border-cyan-400/30 bg-[#101a23] p-6 shadow-2xl shadow-cyan-500/10">
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
</style>
