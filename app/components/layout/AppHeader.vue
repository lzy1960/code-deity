<template>
  <header class="app-header" :class="{ charged: canSingularity }">
    <div class="flex items-center px-3 py-2 gap-2">
      <!-- 左：奇点按钮 -->
      <div class="shrink-0">
        <button v-if="canSingularity" @click="$emit('singularityClick')" class="singularity-button">
          <Icon name="mdi:creation" class="text-base" />
          <span>{{ $t('common.singularity') }}</span>
        </button>
      </div>
      <!-- 中：页面标题 -->
      <h2 class="text-white text-base font-bold leading-tight flex-1 text-center truncate">{{ title }}</h2>
      <!-- 右：倍率选择器 + 功能按钮 -->
      <div class="flex items-center gap-1 shrink-0">
        <slot name="actions" />
        <button @click="genesisLogModal.show()" class="icon-btn">
          <Icon name="mdi:console-line" class="text-xl" />
        </button>
        <button @click="helpModal.show()" class="icon-btn">
          <Icon name="mdi:help-circle-outline" class="text-xl" />
        </button>
        <NuxtLink to="/settings" class="icon-btn">
          <Icon name="mdi:cog" class="text-xl" />
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useHelpModal } from '~/composables/useHelpModal';
import { useGenesisLogModal } from '~/composables/useGenesisLogModal';

defineProps<{
  title: string;
  canSingularity: boolean;
}>();

defineEmits(['singularityClick']);

const helpModal = useHelpModal();
const genesisLogModal = useGenesisLogModal();
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #21364a;
  background: rgba(16, 26, 35, 0.9);
  backdrop-filter: blur(8px);
  transition: border-color 0.5s ease, box-shadow 0.5s ease;
}

.app-header.charged {
  border-bottom-color: rgba(134, 239, 172, 0.36);
  box-shadow: 0 0 15px rgba(76, 165, 255, 0.2);
}

.singularity-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  border: 1px solid rgba(134, 239, 172, 0.34);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(22, 101, 52, 0.48), rgba(20, 83, 45, 0.4));
  color: #dcfce7;
  box-shadow: 0 0 14px rgba(134, 239, 172, 0.18);
  font-size: 0.72rem;
  font-weight: 900;
  padding: 0 10px;
  animation: singularity-ready 1.25s ease-in-out infinite alternate;
}

@keyframes singularity-ready {
  from { box-shadow: 0 0 10px rgba(134, 239, 172, 0.14); }
  to { box-shadow: 0 0 18px rgba(134, 239, 172, 0.28); }
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid rgba(142, 173, 204, 0.14);
  border-radius: 8px;
  color: #8eadcc;
  background: rgba(16, 26, 35, 0.42);
  transition: border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease;
}
.icon-btn:hover {
  border-color: rgba(56, 153, 250, 0.34);
  background: rgba(56, 153, 250, 0.12);
  color: #e5f3ff;
}
</style>
