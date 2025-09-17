<template>
  <div class="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-white/10">
    <div class="text-3xl text-cyan-400">
      <Icon :name="icon" />
    </div>
    <div class="flex-1">
      <h4 class="font-bold text-white text-base">{{ title }}</h4>
      <p class="text-xs text-gray-400">{{ description }}</p>
    </div>
    <div class="w-28 text-center">
      <button 
        v-if="!isActive"
        @click="$emit('trigger')" 
        :disabled="viewsLeft <= 0"
        class="w-full px-3 py-1.5 rounded-md bg-yellow-500 text-black font-bold text-sm hover:bg-yellow-400 transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        <Icon name="mdi:movie-play" />
        <span>({{ viewsLeft }}/5)</span>
      </button>
      <div v-else class="w-full px-3 py-1.5 rounded-md bg-green-500/20 text-green-300 font-bold">
        <p class="text-sm">已激活</p>
        <p class="text-xs font-mono">{{ activeText }}</p>
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
}>();

defineEmits(['trigger']);
</script>
