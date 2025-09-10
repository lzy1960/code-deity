<template>
  <div class="rounded-lg bg-gradient-to-br from-[#2a2a5f] to-[#1e1e48] p-4 text-center shadow-lg">
    <p class="text-lg font-semibold">Potential RP Gain: <span class="text-xl font-bold text-cyan-400">{{ potentialRpGain }}</span></p>
    <button class="mt-3 w-full cursor-pointer items-center justify-center rounded-md bg-cyan-500 px-6 py-3 text-base font-bold text-white shadow-md transition-transform hover:scale-105" @click="$emit('refactor')">
      <span class="truncate">Refactor Code</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps<{
  potentialRpGain: number;
}>();

defineEmits(['refactor']);
</script>