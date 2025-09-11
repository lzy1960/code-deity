<template>
  <div class="rounded-lg p-4" :class="containerClass">
    <h3 class="text-lg font-bold">{{ title }}</h3>
    <p class="text-sm mt-1"><span class="font-semibold">规则:</span> {{ rule }}</p>
    <p class="text-sm mt-1"><span class="font-semibold">目标:</span> {{ goal }}</p>
    <p class="text-sm mt-1 font-bold text-green-400"><span class="font-semibold text-white">奖励:</span> {{ reward }}</p>
    
    <div class="mt-3">
      <button v-if="isCompleted" class="w-full rounded-md px-4 py-2 text-sm font-bold bg-green-700 cursor-default" disabled>
        已完成
      </button>
      <button v-else-if="isActive" @click="$emit('exit')" class="w-full rounded-md px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-700">
        退出挑战
      </button>
      <button v-else @click="$emit('start')" class="w-full rounded-md px-4 py-2 text-sm font-bold bg-purple-600 hover:bg-purple-700">
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
  if (props.isCompleted) return 'bg-green-900/50';
  if (props.isActive) return 'bg-purple-900/80 ring-2 ring-purple-500';
  return 'bg-[#191933]';
});
</script>