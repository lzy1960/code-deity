<template>
  <Transition name="save-toast-fade">
    <div v-if="notifier.isVisible.value" class="fixed top-5 left-5 z-[9999] bg-gray-900/80 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-green-500/30">
      <div class="flex items-center gap-2">
        <Icon name="mdi:content-save-check" class="text-green-400" />
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
</style>
