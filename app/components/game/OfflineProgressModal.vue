<template>
  <teleport to="body">
    <Transition name="modal-bounce">
      <div v-if="isRevealed" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-[#1C2836] rounded-2xl shadow-xl w-full max-w-md text-white text-center p-8 border-2 border-[#3899fa]/50">
          <!-- Slot for any content -->
          <slot />
        </div>
      </div>
    </Transition>
  </teleport>
</template>

<script setup lang="ts">
// This component is now a generic wrapper.
// Its only job is to show or hide based on the isRevealed prop.
defineProps<{ 
  isRevealed: boolean,
}>()
</script>

<style scoped>
.modal-bounce-enter-active,
.modal-bounce-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.modal-bounce-enter-from,
.modal-bounce-leave-to {
  opacity: 0;
}

.modal-bounce-enter-active .bg-\[\#1C2836\],
.modal-bounce-leave-active .bg-\[\#1C2836\] {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.modal-bounce-enter-from .bg-\[\#1C2836\],
.modal-bounce-leave-to .bg-\[\#1C2836\] {
  transform: scale(0.8);
  opacity: 0;
}
</style>
