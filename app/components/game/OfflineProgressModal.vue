<template>
  <teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isRevealed" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
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
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .bg-\[\#1C2836\],
.modal-fade-leave-active .bg-\[\#1C2836\] {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .bg-\[\#1C2836\],
.modal-fade-leave-to .bg-\[\#1C2836\] {
  transform: scale(0.95);
}
</style>
