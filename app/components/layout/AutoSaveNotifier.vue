<template>
  <Transition name="save-toast-fade">
    <div v-if="notifier.isVisible.value" class="save-toast">
      <div class="flex items-center gap-2">
        <Icon name="mdi:content-save-check" />
        <span>{{ notifier.message.value }}</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useAutoSaveNotifier } from '~/composables/useAutoSaveNotifier'

const notifier = useAutoSaveNotifier()
</script>

<style scoped>
.save-toast-fade-enter-active,
.save-toast-fade-leave-active {
  transition: all 0.3s ease-out;
}

.save-toast-fade-enter-from,
.save-toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.save-toast {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 9999;
  border: 1px solid rgba(134, 239, 172, 0.34);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(19, 37, 54, 0.94), rgba(12, 23, 34, 0.98)),
    radial-gradient(circle at 0% 0%, rgba(134, 239, 172, 0.16), transparent 36%);
  color: #f8fbff;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.32);
  font-size: 0.75rem;
  font-weight: 900;
  padding: 9px 12px;
}

.save-toast .iconify {
  color: #bbf7d0;
}
</style>
