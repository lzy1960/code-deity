<template>
  <div class="fixed top-5 right-5 z-[9999] w-full max-w-xs" style="padding-top: env(safe-area-inset-top);">
    <TransitionGroup name="toast-list" tag="div" class="relative space-y-3">
      <div
        v-for="toast in toastStore.toasts.value"
        :key="toast.id"
        class="flex items-center w-full p-4 text-white rounded-lg shadow-2xl"
        :class="toastClasses[toast.type]"
        role="alert"
      >
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg" :class="iconWrapperClasses[toast.type]">
          <Icon :name="icons[toast.type]" class="w-5 h-5" />
        </div>
        <div class="ml-3 text-sm font-normal">{{ toast.message }}</div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const toastStore = useToast()

const toastClasses = {
  info: 'bg-blue-500/30 border border-blue-400/50 backdrop-blur-md',
  success: 'bg-green-500/30 border border-green-400/50 backdrop-blur-md',
  warning: 'bg-yellow-500/30 border border-yellow-400/50 backdrop-blur-md',
  error: 'bg-red-500/30 border border-red-400/50 backdrop-blur-md',
}

const iconWrapperClasses = {
  info: 'bg-blue-500/50',
  success: 'bg-green-500/50',
  warning: 'bg-yellow-500/50',
  error: 'bg-red-500/50',
}

const icons = {
  info: 'mdi:information',
  success: 'mdi:check-circle',
  warning: 'mdi:alert',
  error: 'mdi:alert-circle',
}
</script>

<style scoped>
/* Base transition for enter, leave, and move animations */
.toast-list-move,
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* Enter and leave states */
.toast-list-enter-from,
.toast-list-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Ensure leaving items are taken out of layout flow so moving animations can be calculated correctly. */
.toast-list-leave-active {
  position: absolute;
  width: 100%;
}
</style>
