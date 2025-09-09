<template>
  <div>
    <h1>Incremental Game</h1>
    <p>Money: {{ format(playerStore.money) }}</p>
    <p>Refactor Points: {{ format(playerStore.refactorPoints) }}</p>
    <p>Version Points: {{ format(playerStore.versionPoints) }}</p>
    <button @click="getMoney">Get Money</button>
    <button @click="save">Save</button>
    <button @click="load">Load</button>

    <div>
      <button @click="activeTab = 'refactor'">Refactor</button>
      <button @click="activeTab = 'compile'">Compile</button>
    </div>

    <div v-if="activeTab === 'refactor'">
      <RefactorTab />
    </div>
    <div v-if="activeTab === 'compile'">
      <CompileTab />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import Decimal from 'decimal.js';
import { saveGame, loadGame, createNewSave, type SaveData, CURRENT_SAVE_VERSION } from '../lib/save';
import { usePlayerStore } from '../game/state/playerStore';

const playerStore = usePlayerStore();
const activeTab = ref('refactor');

function format(amount: Decimal) {
  return amount.toDecimalPlaces(2).toString();
}

function getMoney() {
  playerStore.addMoney(new Decimal(1));
}

async function save() {
  try {
    const saveData: SaveData = {
      version: CURRENT_SAVE_VERSION,
      lastSaveTime: Date.now(),
      money: playerStore.money,
      refactorPoints: playerStore.refactorPoints,
      versionPoints: playerStore.versionPoints,
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