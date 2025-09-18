<template>
  <div class="p-3 rounded-lg bg-black/30 border border-white/10">
    <div class="flex items-start gap-3">
      <div class="text-3xl text-cyan-400 flex-shrink-0 pt-1">
        <Icon :name="icon" />
      </div>
      <div class="flex-1">
        <h4 class="font-bold text-white text-base">{{ title }}</h4>
        <p class="text-xs text-gray-400">{{ description }}</p>
      </div>
    </div>
    <div class="mt-3 text-center">
      <button 
        v-if="!isActive"
        @click="$emit('trigger')" 
        :disabled="viewsLeft <= 0 || isLoading"
        class="w-full px-3 py-2 rounded-md bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-1"
      >
        <template v-if="isLoading">
          <Icon name="mdi:loading" class="animate-spin" />
          <span>加载中</span>
        </template>
        <template v-else>
          <Icon name="mdi:movie-play" />
          <span>观看广告 ({{ viewsLeft }}/5)</span>
        </template>
      </button>
      <div v-else class="w-full px-3 py-2 rounded-md bg-green-500/20 text-green-300 font-bold">
        <div class="flex items-baseline justify-center gap-1.5">
          <span class="text-sm">已激活</span>
          <span class="text-xs font-mono">{{ activeText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  icon: string;
  viewsLeft: number;
  isActive?: boolean;
  activeText?: string;
  isLoading?: boolean;
}>();

defineEmits(['trigger']);
</script>
