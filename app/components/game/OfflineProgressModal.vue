<template>
  <teleport to="body">
    <Transition name="modal-bounce">
      <div v-if="isRevealed" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div class="relative bg-transparent rounded-2xl shadow-xl w-full max-w-md text-white text-center p-0 overflow-hidden border border-blue-500/20">
          <div class="animated-border"></div>
          <div class="relative z-10 rounded-[14px] bg-[#1C2836] m-[2px] p-8">
            <!-- Slot for any content -->
            <slot />
          </div>
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

.animated-border {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    transparent,
    rgba(56, 153, 250, 0.7), /* #3899fa */
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
