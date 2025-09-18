<template>
  <Transition name="modal-bounce">
    <div v-if="isVisible" class="fixed inset-0 z-[1000] flex items-center justify-center" @click="dismiss">
      <!-- Spotlight effect backdrops -->
      <div v-if="rect" class="backdrop" :style="{ top: 0, left: 0, width: '100%', height: `${rect.top}px` }"></div>
      <div v-if="rect" class="backdrop" :style="{ top: `${rect.bottom}px`, left: 0, width: '100%', bottom: 0 }"></div>
      <div v-if="rect" class="backdrop" :style="{ top: `${rect.top}px`, left: 0, width: `${rect.left}px`, height: `${rect.height}px` }"></div>
      <div v-if="rect" class="backdrop" :style="{ top: `${rect.top}px`, right: 0, width: `${windowWidth - rect.right}px`, height: `${rect.height}px` }"></div>

      <div class="relative">
        <div class="p-4 bg-gray-800 border border-cyan-500 rounded-lg shadow-2xl text-center space-y-3" style="width: 80vw;">
          <p class="text-cyan-300 font-bold text-lg">{{ title }}</p>
          <p class="text-gray-300 text-sm">{{ text }}</p>
          <button @click.stop="dismiss" class="mt-2 px-4 py-2 bg-cyan-600 text-white font-bold rounded-lg hover:bg-cyan-500 transition-colors">
            知道了
          </button>
        </div>
        <div class="arrow arrow-down"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { useWindowSize } from '@vueuse/core';

const props = defineProps<{
  show: boolean;
  target: HTMLElement | null;
  title: string;
  text: string;
}>();

const emit = defineEmits(['dismiss']);

const isVisible = ref(false);
const rect = ref<DOMRect | null>(null);
const { width: windowWidth } = useWindowSize();

watch(() => props.show, async (newValue) => {
  if (newValue) {
    await nextTick();
    if (props.target) {
      rect.value = props.target.getBoundingClientRect();
    }
    isVisible.value = true;
  } else {
    isVisible.value = false;
  n}
});

const dismiss = () => {
  isVisible.value = false;
  emit('dismiss');
};
</script>

<style scoped>
.backdrop {
  position: fixed;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
}

.modal-bounce-enter-active,
.modal-bounce-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.modal-bounce-enter-from,
.modal-bounce-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.arrow-down {
  border-width: 10px 10px 0 10px;
  border-color: #0e7490 transparent transparent transparent; /* cyan-700 for better contrast */
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
}
</style>
