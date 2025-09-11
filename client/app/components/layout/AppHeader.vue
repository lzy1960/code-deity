<template>
  <header class="sticky top-0 z-10 bg-[#111122]/80 backdrop-blur-sm">
    <div class="flex items-center p-4 pb-2 justify-between">
      <h1 class="text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">代码神祇 (Code Deity)</h1>
      <button class="p-2">
        <span class="material-symbols-outlined text-2xl">settings</span>
      </button>
    </div>
    <div class="px-4 pb-4">
      <div class="flex items-center justify-between rounded-lg bg-[#191933] p-3 shadow-lg">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-yellow-400">paid</span>
          <p class="text-lg font-bold">{{ formattedCurrency }}</p>
        </div>
        <div class="flex gap-2">
          <button class="flex items-center justify-center rounded-md bg-[#232348] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#343466]" @click="$emit('saveGame')">
            <span class="material-symbols-outlined mr-1 text-base">save</span>
            Save
          </button>
          <button class="flex items-center justify-center rounded-md bg-[#232348] px-4 py-2 text-sm font-medium transition-colors hover:bg-[#343466]" @click="$emit('loadGame')">
            <span class="material-symbols-outlined mr-1 text-base">cloud_upload</span>
            Load
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps<{
  currency: number;
}>();

defineEmits(['saveGame', 'loadGame']);

const formattedCurrency = computed(() => {
  return new Intl.NumberFormat().format(props.currency);
});
</script>