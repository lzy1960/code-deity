<template>
  <header class="sticky top-0 z-10 bg-[#101a23]/90 backdrop-blur-sm transition-all duration-500 border-b border-[#21364a]" :class="{ 'shadow-[0_0_15px_rgba(192,132,252,0.5)] border-b border-purple-400/50': canSingularity }">
    <div class="flex items-center px-3 py-2 gap-2">
      <!-- 左：奇点按钮 -->
      <div class="shrink-0">
        <button v-if="canSingularity" @click="$emit('singularityClick')" class="px-3 h-8 rounded-lg bg-purple-600 text-white font-bold text-xs animate-pulse shadow-lg shadow-purple-500/50 flex items-center gap-1.5">
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
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  color: white;
  background: transparent;
  transition: background 0.15s;
}
.icon-btn:hover { background: rgba(255,255,255,0.1); }
</style>
