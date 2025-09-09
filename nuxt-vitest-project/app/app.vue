<template>
  <div>
    <h1>Incremental Game</h1>
    <p>Money: {{ format(player.money) }}</p>
    <button @click="getMoney">Get Money</button>
    <button @click="save">Save</button>
    <button @click="load">Load</button>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, onUnmounted } from 'vue';
import Decimal from 'decimal.js';
import { saveGame, loadGame, createNewSave, type SaveData } from '../lib/save';

const player = reactive<SaveData>(createNewSave());

function format(amount: Decimal) {
  return amount.toString();
}

function getMoney() {
  player.money = new Decimal(player.money).add(1);
}

async function save() {
  try {
    await saveGame(player);
    console.log('Game saved!');
  } catch (error) {
    console.error('Failed to save game:', error);
  }
}

async function load() {
  try {
    const savedState = await loadGame();
    if (savedState) {
      Object.assign(player, savedState);
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