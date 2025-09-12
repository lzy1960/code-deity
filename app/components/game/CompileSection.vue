<template>
  <div class="rounded-lg bg-gradient-to-br from-[#1e483b] to-[#1e2a48] p-4 text-center shadow-lg">
    <p class="text-lg font-semibold">Current Version: <span class="text-xl font-bold text-teal-400">{{ version }}</span></p>
    <p class="text-sm text-gray-300 mt-1">Each version boosts RP effectiveness by 20%.</p>
    <button
      class="mt-3 w-full items-center justify-center rounded-md px-6 py-3 text-base font-bold text-white shadow-md transition-all bg-teal-600 hover:scale-105 hover:bg-teal-700 cursor-pointer"
      @click="$emit('compileAndRelease')"
    >
      <span class="truncate">Compile & Release (Resets)</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps<{
  version: number;
}>();

defineEmits(['compileAndRelease']);
</script>