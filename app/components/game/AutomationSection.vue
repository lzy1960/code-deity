<template>
  <div class="space-y-3">
    <h2 class="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">Automation</h2>
    <p class="text-gray-400">Toggle automators to automatically buy generators. Unlocks after your first Compile & Release.</p>
    <div v-for="generator in unlockedGenerators" :key="generator.id" class="flex items-center justify-between rounded-lg bg-[#191933] p-3">
      <div>
        <p class="text-base font-medium">Auto-buy {{ generatorConfig(generator.id).name }}</p>
      </div>
      
      <label class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" :checked="gameStore.automatorStates[generator.id]" @change="toggleAutomator(generator.id)" class="sr-only peer">
        <div class="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '~/store/game';

const gameStore = useGameStore();

const unlockedGenerators = computed(() => 
  gameStore.generators.filter(g => gameStore.isGeneratorUnlocked(g.id))
);

const generatorConfig = (id: number) => gameStore.generatorConfig(id);

const toggleAutomator = (id: number) => {
  gameStore.toggleAutomator(id);
};
</script>