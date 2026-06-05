<template>
  <Transition name="modal-panel">
    <div v-if="isVisible" class="fixed inset-0 z-[1000] flex items-center justify-center" @click="dismiss">
      <!-- Spotlight effect backdrops -->
      <div v-if="rect" class="backdrop" :style="{ top: 0, left: 0, width: '100%', height: `${rect.top}px` }"></div>
      <div v-if="rect" class="backdrop" :style="{ top: `${rect.bottom}px`, left: 0, width: '100%', bottom: 0 }"></div>
      <div v-if="rect" class="backdrop" :style="{ top: `${rect.top}px`, left: 0, width: `${rect.left}px`, height: `${rect.height}px` }"></div>
      <div v-if="rect" class="backdrop" :style="{ top: `${rect.top}px`, right: 0, width: `${windowWidth - rect.right}px`, height: `${rect.height}px` }"></div>

      <div class="relative">
        <div class="guidance-panel" style="width: 80vw;">
          <p>{{ title }}</p>
          <span>{{ text }}</span>
          <button @click.stop="dismiss">
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
  }
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

.modal-panel-enter-active,
.modal-panel-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.modal-panel-enter-from,
.modal-panel-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.guidance-panel {
  display: grid;
  gap: 10px;
  max-width: 440px;
  border: 1px solid rgba(76, 165, 255, 0.34);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(19, 37, 54, 0.98), rgba(12, 23, 34, 0.98)),
    radial-gradient(circle at 12% 0%, rgba(76, 165, 255, 0.16), transparent 36%);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.42), inset 0 0 36px rgba(0, 0, 0, 0.26);
  padding: 16px;
  text-align: center;
}

.guidance-panel p {
  color: #f8fbff;
  font-size: 1rem;
  font-weight: 900;
}

.guidance-panel span {
  color: #b9cde0;
  font-size: 0.82rem;
  line-height: 1.55;
}

.guidance-panel button {
  min-height: 38px;
  border: 1px solid rgba(76, 165, 255, 0.44);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(56, 153, 250, 0.34), rgba(28, 112, 190, 0.3));
  color: #fff;
  font-size: 0.84rem;
  font-weight: 900;
}

.arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-style: solid;
}

.arrow-down {
  border-width: 10px 10px 0 10px;
  border-color: rgba(76, 165, 255, 0.52) transparent transparent transparent;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
}
</style>
