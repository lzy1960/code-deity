<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Settings</h2>

    <!-- Preferences Section -->
    <div class="bg-gray-800 p-4 rounded-lg shadow-md mb-6">
      <h3 class="text-lg font-semibold mb-3">Preferences</h3>
      <div class="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
        <span>Music</span>
        <label class="switch">
          <input type="checkbox" v-model="settings.musicEnabled">
          <span class="slider round"></span>
        </label>
      </div>
      <div class="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
        <span>Sound Effects</span>
        <label class="switch">
          <input type="checkbox" v-model="settings.soundEffectsEnabled">
          <span class="slider round"></span>
        </label>
      </div>
      <div class="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
        <span>Notifications</span>
        <label class="switch">
          <input type="checkbox" v-model="settings.notificationsEnabled">
          <span class="slider round"></span>
        </label>
      </div>
    </div>

    <!-- Account Section -->
    <div class="bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 class="text-lg font-semibold mb-3">Account</h3>
      <div class="flex justify-between items-center py-2">
        <span>Reset Game</span>
        <button @click="resetGame" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Reset</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';

// Placeholder for settings state
const settings = reactive({
  musicEnabled: true,
  soundEffectsEnabled: true,
  notificationsEnabled: true,
});

function resetGame() {
  if (confirm('Are you sure you want to reset the game? This cannot be undone.')) {
    // Implement game reset logic here
    console.log('Game reset initiated!');
    // For now, just reload the page to simulate a reset
    window.location.reload();
  }
}
</script>

<style scoped>
/* Basic Switch Styles - Can be moved to a global CSS file if preferred */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(16px);
  -ms-transform: translateX(16px);
  transform: translateX(16px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 24px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>