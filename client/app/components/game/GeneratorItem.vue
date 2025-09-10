<template>
  <div class="flex items-center gap-4 rounded-lg bg-[#191933] p-3">
    <div class="flex-grow">
      <p class="text-base font-medium">{{ generator.name }}: <span class="font-bold text-green-400">{{ generator.amount.toFixed(0) }}</span></p>
      <p class="text-sm text-[#9292c9]">Multiplier: x{{ generator.multiplier.toFixed(2) }}</p>
    </div>
    <button class="flex min-w-[100px] cursor-pointer items-center justify-center rounded-md bg-[#232348] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#343466]" @click="$emit('buy')">
      <span class="truncate">Buy ({{ generator.baseCost.times(generator.costMultiplier.pow(generator.bought)).toFixed(2) }})</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import type { Generator } from '~/app/store/game'; // 导入 Generator 类型

defineProps<{
  generator: Generator;
}>();

defineEmits(['buy']);
</script>
