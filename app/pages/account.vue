<template>
  <div class="relative flex size-full min-h-screen flex-col justify-between overflow-x-hidden bg-[#0D1217] text-white">
    <div class="flex-1">
      <AppHeader :currency="gameStore.currency" />
      <div class="p-4 space-y-6">
        <div class="bg-[#1C2836] rounded-lg p-6 text-center">
          <button @click="loginWithGoogle" class="w-full flex items-center justify-center gap-3 bg-[#3899fa] text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors">
            <svg class="h-6 w-6" fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M15 6.36C13.56 5.23 11.66 4.5 9.5 4.5 4.8 4.5 1 8.3 1 13c0 1.94.64 3.73 1.73 5.15"></path><path d="M19.46 16.22c.39-.6.74-1.26 1.04-1.97.48-1.15.7-2.37.7-3.63 0-4.97-4.03-9-9-9-1.92 0-3.7.6-5.12 1.63"></path><path d="M9.14 18.25c.39.54.83 1.04 1.33 1.48 1.15.98 2.52 1.52 4.02 1.52 4.7 0 8.5-3.8 8.5-8.5 0-1.7-.5-3.28-1.35-4.56"></path><path d="m14 13-4 4"></path><path d="M10 13h4v4"></path></svg>
            <span>Log in with Google Account</span>
          </button>
        </div>
        <div class="bg-[#1C2836] rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-lg">Cloud Sync</p>
              <p class="text-sm text-gray-400">Last Sync: Never</p>
            </div>
            <button @click="syncNow" class="bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
              Sync Now
            </button>
          </div>
        </div>
        <div class="bg-[#1C2836] rounded-lg divide-y divide-gray-700">
          <a @click="exportSave" class="flex items-center justify-between p-4 hover:bg-gray-800 transition-colors rounded-t-lg cursor-pointer">
            <span class="text-lg">Export Save</span>
            <span class="material-symbols-outlined text-gray-400">chevron_right</span>
          </a>
          <a @click="importSave" class="flex items-center justify-between p-4 hover:bg-gray-800 transition-colors rounded-b-lg cursor-pointer">
            <span class="text-lg">Import Save</span>
            <span class="material-symbols-outlined text-gray-400">chevron_right</span>
          </a>
        </div>
      </div>
    </div>
    <footer class="sticky bottom-0 bg-[#182635]/80 backdrop-blur-sm border-t border-[#21364a]">
      <nav class="flex justify-around items-center px-4 pt-2 pb-3">
        <a @click="$router.push('/')" class="flex flex-1 flex-col items-center justify-end gap-1 text-[#8eadcc] hover:text-white transition-colors cursor-pointer">
          <span class="material-symbols-outlined"> dns </span>
          <p class="text-xs font-medium">Generators</p>
        </a>
        <a class="flex flex-1 flex-col items-center justify-end gap-1 text-[#3899fa]">
          <span class="material-symbols-outlined"> account_circle </span>
          <p class="text-xs font-bold">Account</p>
        </a>
      </nav>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/store/game';
import AppHeader from '~/components/layout/AppHeader.vue';

const gameStore = useGameStore();

const loginWithGoogle = () => {
  alert('Login with Google - Not yet implemented.');
  // Future implementation: call Supabase auth
};

const syncNow = () => {
  alert('Cloud Sync - Not yet implemented.');
  // Future implementation: sync with Supabase
};

const exportSave = () => {
  alert('Export Save - Not yet implemented.');
  // Future implementation: trigger save file download
};

const importSave = () => {
  alert('Import Save - Not yet implemented.');
  // Future implementation: open file picker and load save
};
</script>
