<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Select Module</h2>

    <!-- Module List -->
    <div class="bg-gray-800 p-4 rounded-lg shadow-md">
      <div v-for="module in modules" :key="module.id" class="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0">
        <div>
          <h3 class="text-lg font-semibold">{{ module.name }}</h3>
          <p class="text-sm text-gray-400">{{ module.description }}</p>
          <p v-if="module.cost" class="text-sm text-gray-500">Cost: {{ module.cost }} Computing Power</p>
        </div>
        <button @click="handleModuleAction(module.id, module.action)" 
                :class="{'bg-blue-600 hover:bg-blue-700': module.action === 'Research', 'bg-green-600 hover:bg-green-700': module.action === 'Install'}"
                class="text-white font-bold py-2 px-4 rounded">
          {{ module.action }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Module {
  id: number;
  name: string;
  description: string;
  cost?: number;
  action: 'Research' | 'Install';
}

const modules = ref<Module[]>([
  { id: 0, name: 'Data Storage', description: 'Stores additional data.', cost: 1000, action: 'Research' },
  { id: 1, name: 'Processing Unit', description: 'Increases computing power by 10%', action: 'Install' },
  { id: 2, name: 'Memory Management', description: 'Optimizes memory usage.', cost: 5000, action: 'Research' },
  { id: 3, name: 'Advanced Processing', description: 'Increases computing power by 25%', action: 'Install' },
  { id: 4, name: 'Parallel Processing', description: 'Enables parallel execution.', cost: 10000, action: 'Research' },
]);

function handleModuleAction(id: number, action: 'Research' | 'Install') {
  console.log(`${action} module with ID: ${id}`);
  // Implement actual research/install logic here
}
</script>

<style scoped>
/* Add any specific styles for ModulesTab here if needed */
</style>