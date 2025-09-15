<template>
  <div class="rounded-xl p-5 transition-all duration-300" :class="containerClass">
    <h3 class="text-lg font-bold text-white">{{ title }}</h3>
    <div class="mt-3 space-y-2 text-sm text-gray-300/80">
      <p><span class="font-semibold text-gray-200">规则:</span> {{ rule }}</p>
      <p><span class="font-semibold text-gray-200">目标:</span> {{ goal }}</p>
      <p class="font-bold text-cyan-400"><span class="font-semibold text-gray-200">奖励:</span> {{ reward }}</p>
    </div>
    
    <div class="mt-4">
      <button v-if="isCompleted" class="w-full rounded-lg px-4 py-2.5 text-sm font-bold bg-green-500/20 text-green-300 border border-green-500/50 cursor-default" disabled>
        <Icon name="ph:check-circle-bold" class="mr-1" />
        已完成
      </button>
      <button v-else-if="isActive" @click="$emit('exit')" class="w-full rounded-lg px-4 py-2.5 text-sm font-bold bg-red-500/80 text-white hover:bg-red-500/100 border border-red-400 transition-all duration-200 transform hover:scale-105">
        <Icon name="ph:x-circle-bold" class="mr-1" />
        退出挑战
      </button>
      <button v-else @click="$emit('start')" class="w-full rounded-lg px-4 py-2.5 text-sm font-bold bg-blue-600/80 text-white hover:bg-blue-600/100 border border-blue-500 transition-all duration-200 transform hover:scale-105 shadow-lg shadow-blue-600/20">
        <Icon name="ph:play-circle-bold" class="mr-1" />
        开始挑战
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  rule: string;
  goal: string;
  reward: string;
  isCompleted: boolean;
  isActive: boolean;
}>();

defineEmits(['start', 'exit']);

const containerClass = computed(() => {
  if (props.isCompleted) return 'bg-white/5 border border-green-500/30';
  if (props.isActive) return 'bg-blue-900/50 ring-2 ring-blue-500 shadow-2xl shadow-blue-500/20';
  return 'bg-white/5 border border-white/10';
});
</script>