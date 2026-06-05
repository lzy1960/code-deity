<template>
  <div class="toast-viewport" style="padding-top: env(safe-area-inset-top);">
    <TransitionGroup name="toast-list" tag="div" class="relative space-y-2">
      <div
        v-for="toast in toastStore.toasts.value"
        :key="toast.id"
        class="toast-item"
        :class="`toast-${toast.type}`"
        role="alert"
      >
        <div class="toast-icon">
          <Icon :name="icons[toast.type]" />
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" @click="toastStore.removeToast(toast.id)">
          <Icon name="mdi:close" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const toastStore = useToast()

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
  transition: all 0.22s ease;
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

.toast-viewport {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 9999;
  width: min(calc(100vw - 24px), 300px);
}

.toast-item {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 26px;
  align-items: center;
  gap: 8px;
  width: 100%;
  border: 1px solid rgba(76, 165, 255, 0.28);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(19, 37, 54, 0.96), rgba(12, 23, 34, 0.98)),
    radial-gradient(circle at 0% 0%, rgba(76, 165, 255, 0.14), transparent 38%);
  color: #f8fbff;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.34);
  padding: 9px;
}

.toast-icon,
.toast-close {
  display: grid;
  place-items: center;
  border-radius: 8px;
}

.toast-icon {
  width: 28px;
  height: 28px;
  background: rgba(76, 165, 255, 0.14);
  color: #bae6fd;
}

.toast-icon .iconify {
  width: 16px;
  height: 16px;
}

.toast-message {
  color: #cfe3f5;
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.35;
}

.toast-close {
  width: 26px;
  height: 26px;
  color: #8ba2b7;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.toast-close:hover {
  background: rgba(76, 165, 255, 0.14);
  color: #fff;
}

.toast-success {
  border-color: rgba(134, 239, 172, 0.32);
}

.toast-success .toast-icon {
  background: rgba(22, 101, 52, 0.28);
  color: #bbf7d0;
}

.toast-warning {
  border-color: rgba(250, 204, 21, 0.34);
}

.toast-warning .toast-icon {
  background: rgba(113, 63, 18, 0.28);
  color: #fde68a;
}

.toast-error {
  border-color: rgba(248, 113, 113, 0.34);
}

.toast-error .toast-icon {
  background: rgba(127, 29, 29, 0.3);
  color: #fecaca;
}
</style>
