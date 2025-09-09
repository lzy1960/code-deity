<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
    <!-- Top Bar -->
    <header class="flex justify-between items-center p-4 bg-gray-800 shadow-md">
      <h1 class="text-xl font-bold">Programmer</h1>
      <button @click="activeTab = 'settings'" class="text-gray-400 hover:text-gray-100">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow p-4 overflow-auto">
      <!-- Computing Power & Per Second Display -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="bg-gray-800 p-4 rounded-lg shadow-md text-center">
          <p class="text-sm text-gray-400">Computing Power</p>
          <p class="text-2xl font-bold text-green-400">{{ format(playerStore.money) }}</p>
        </div>
        <div class="bg-gray-800 p-4 rounded-lg shadow-md text-center">
          <p class="text-sm text-gray-400">Per Second</p>
          <p class="text-2xl font-bold text-blue-400">{{ format(totalProductionPerSecond) }}</p>
        </div>
      </div>

      <!-- Tabs for Generators, Refactor, Architecture, Logs -->
      <div class="flex border-b border-gray-700 mb-4">
        <button @click="activeTab = 'generators'" :class="{'border-blue-500 text-blue-400': activeTab === 'generators', 'border-transparent text-gray-400 hover:text-gray-100': activeTab !== 'generators'}" class="py-2 px-4 text-sm font-medium border-b-2">Generators</button>
        <button @click="activeTab = 'refactor'" :class="{'border-blue-500 text-blue-400': activeTab === 'refactor', 'border-transparent text-gray-400 hover:text-gray-100': activeTab !== 'refactor'}" class="py-2 px-4 text-sm font-medium border-b-2">Refactor</button>
        <button @click="activeTab = 'architecture'" :class="{'border-blue-500 text-blue-400': activeTab === 'architecture', 'border-transparent text-gray-400 hover:text-gray-100': activeTab !== 'architecture'}" class="py-2 px-4 text-sm font-medium border-b-2">Architecture</button>
        <button @click="activeTab = 'logs'" :class="{'border-blue-500 text-blue-400': activeTab === 'logs', 'border-transparent text-gray-400 hover:text-gray-100': activeTab !== 'logs'}" class="py-2 px-4 text-sm font-medium border-b-2">Logs</button>
      </div>

      <!-- Tab Content -->
      <div v-if="activeTab === 'generators'">
        <div v-for="generator in generatorsStore.getAllGenerators" :key="generator.id" class="bg-gray-800 p-4 rounded-lg shadow-md mb-3 flex justify-between items-center">
          <div>
            <h3 class="text-lg font-semibold">{{ generator.name }}</h3>
            <p class="text-sm text-gray-400">Cost: {{ format(generatorSystem.getGeneratorCost(generator.id)) }}</p>
            <p class="text-sm text-gray-400">Yield: {{ format(generator.productionRate) }} Multiplier: x{{ format(new Decimal(generator.yieldMultiplier)) }}</p>
          </div>
          <button @click="buyGenerator(generator.id)" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Buy x1</button>
        </div>
      </div>

      <div v-if="activeTab === 'refactor'">
        <RefactorTab />
      </div>
      <div v-if="activeTab === 'compile'">
        <CompileTab />
      </div>
      <div v-if="activeTab === 'settings'">
        <SettingsTab />
      </div>
      <div v-if="activeTab === 'modules'">
        <ModulesTab />
      </div>
    </main>

    <!-- Bottom Navigation -->
    <nav class="flex justify-around p-3 bg-gray-800 shadow-lg">
      <button @click="activeTab = 'generators'" :class="{'text-blue-400': activeTab === 'generators', 'text-gray-400': activeTab !== 'generators'}" class="flex flex-col items-center text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Generators
      </button>
      <button @click="activeTab = 'modules'" :class="{'text-blue-400': activeTab === 'modules', 'text-gray-400': activeTab !== 'modules'}" class="flex flex-col items-center text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 10h2m10 0h2M3 14h2m10 0h2M11 19l-2-2m2 2l2-2m-2-2v2m-8-10h16a2 2 0 012 2v8a2 2 0 01-2 2H3a2 2 0 01-2-2V6a2 2 0 012-2z" />
        </svg>
        Modules
      </button>
      <button @click="activeTab = 'settings'" :class="{'text-blue-400': activeTab === 'settings', 'text-gray-400': activeTab !== 'settings'}" class="flex flex-col items-center text-xs">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Settings
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import Decimal from 'decimal.js';
import { saveGame, loadGame, type SaveData, CURRENT_SAVE_VERSION } from '../lib/save';
import { usePlayerStore } from '../game/state/playerStore';
import { useGeneratorsStore } from '../game/state/generatorsStore';
import { GeneratorSystem } from '../game/systems/generator';
import RefactorTab from '../components/refactor/RefactorTab.vue';
import CompileTab from '../components/compile/CompileTab.vue';
import SettingsTab from '../components/settings/SettingsTab.vue';
import ModulesTab from '../components/modules/ModulesTab.vue';

const playerStore = usePlayerStore();
const generatorsStore = useGeneratorsStore();
const generatorSystem = new GeneratorSystem();

const activeTab = ref('generators'); // Default to generators tab

const totalProductionPerSecond = computed(() => {
  let total = new Decimal(0);
  generatorsStore.getAllGenerators.forEach(generator => {
    total = total.plus(generator.productionRate);
  });
  return total;
});

function format(amount: Decimal) {
  return amount.toDecimalPlaces(2).toString();
}

function buyGenerator(id: number) {
  generatorSystem.buyGenerator(id);
}

async function save() {
  try {
    const saveData: SaveData = {
      version: CURRENT_SAVE_VERSION,
      lastSaveTime: Date.now(),
      money: playerStore.money,
      refactorPoints: playerStore.refactorPoints,
      versionPoints: playerStore.versionPoints,
      generators: generatorsStore.generators.map(g => ({
        id: g.id,
        level: g.level,
        quantity: g.quantity,
        productionRate: g.productionRate,
        name: g.name,
        baseCost: g.baseCost,
        baseProduction: g.baseProduction,
        yieldMultiplier: g.yieldMultiplier,
      })),
    };
    await saveGame(saveData);
    console.log('Game saved!');
  } catch (error) {
    console.error('Failed to save game:', error);
  }
}

async function load() {
  try {
    const savedState = await loadGame();
    if (savedState) {
      playerStore.money = savedState.money;
      playerStore.refactorPoints = savedState.refactorPoints;
      playerStore.versionPoints = savedState.versionPoints;
      // Load generators
      if (savedState.generators) {
        generatorsStore.generators = savedState.generators.map(g => ({
          ...g,
          quantity: new Decimal(g.quantity),
          productionRate: new Decimal(g.productionRate),
        }));
      }
      console.log('Game loaded!');
    }
  } catch (error) {
    console.error('Failed to load game:', error);
  }
}

let saveInterval: any;

onMounted(() => {
  load();
  saveInterval = setInterval(save, 30000); // Autosave every 30 seconds
});

onUnmounted(() => {
  clearInterval(saveInterval);
});
</script>