<template>
  <div class="relative flex size-full min-h-screen flex-col justify-between overflow-x-hidden bg-[#0D1217] text-white">
    <div class="flex-1">
      <AppHeader title="Account" />
      <div class="p-4 space-y-6">

        <!-- Logged in state -->
        <div v-if="authStore.isLoggedIn" class="bg-[#1C2836] rounded-lg p-6 text-center space-y-4">
          <p class="text-gray-300">Logged in as:</p>
          <p class="text-lg font-bold text-white">{{ authStore.user?.email }}</p>
          <button @click="logout" class="w-full flex items-center justify-center gap-3 bg-red-600/80 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600/100 transition-colors">
            <Icon name="mdi:logout" class="h-6 w-6" />
            <span>Log Out</span>
          </button>
        </div>

        <!-- Logged out state -->
        <div v-else class="bg-[#1C2836] rounded-lg p-6 text-center">
          <button @click="loginWithGoogle" class="w-full flex items-center justify-center gap-3 bg-[#3899fa] text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors">
            <Icon name="mdi:google" class="h-6 w-6" />
            <span>Log in with Google Account</span>
          </button>
        </div>

        <div class="bg-[#1C2836] rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-lg">Cloud Sync</p>
              <p v-if="gameStore.lastCloudSync" class="text-sm text-gray-400">Last Sync: {{ lastSyncTimeAgo }}</p>
              <p v-else class="text-sm text-gray-400">Last Sync: Never</p>
            </div>
            <button @click="syncNow" class="bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
              Sync Now
            </button>
          </div>
        </div>
        <div class="bg-[#1C2836] rounded-lg divide-y divide-gray-700">
          <a @click="exportSave" class="flex items-center justify-between p-4 hover:bg-gray-800 transition-colors rounded-t-lg cursor-pointer">
            <span class="text-lg">Export Save</span>
            <Icon name="mdi:chevron-right" class="text-gray-400" />
          </a>
          <a @click="importSave" class="flex items-center justify-between p-4 hover:bg-gray-800 transition-colors rounded-b-lg cursor-pointer">
            <span class="text-lg">Import Save</span>
            <Icon name="mdi:chevron-right" class="text-gray-400" />
          </a>
        </div>

        <!-- Danger Zone -->
        <div class="border-t-2 border-red-500/30 pt-6">
          <h3 class="text-xl font-bold text-red-400">Danger Zone</h3>
          <div class="mt-4 bg-[#1C2836] rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-lg">Wipe All Data</p>
                <p class="text-sm text-gray-400">Permanently delete all local and cloud save data.</p>
              </div>
              <button @click="wipeAllData" class="bg-red-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                Wipe Data
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
    <AppFooter context="account" active-tab="account" />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue';
import AppFooter from '~/components/layout/AppFooter.vue';
import { useAuthStore } from '~/store/auth';
import { useGameStore } from '~/store/game';
import { useTimeAgo } from '@vueuse/core';

const authStore = useAuthStore();
const gameStore = useGameStore();
const supabase = useSupabaseClient();
const { $saveGameCloud, $loadGame, $wipeData } = useNuxtApp() as any

const lastSyncTimeAgo = useTimeAgo(computed(() => gameStore.lastCloudSync ?? 0))

const loginWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) {
    alert('Error logging in: ' + error.message);
  }
};

const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert('Error logging out: ' + error.message);
  }
};

const syncNow = async () => {
  // A simple sync is to save the current state to the cloud,
  // then immediately load from the cloud to resolve any conflicts.
  alert('Syncing with cloud...');
  await $saveGameCloud();
  await $loadGame();
  alert('Sync complete!');
};

const exportSave = () => {
  alert('Export Save - Not yet implemented.');
  // Future implementation: trigger save file download
};

const importSave = () => {
  alert('Import Save - Not yet implemented.');
  // Future implementation: open file picker and load save
};

const wipeAllData = async () => {
  if (window.confirm('Are you absolutely sure you want to wipe all data? This action cannot be undone.')) {
    await $wipeData();
    alert('All data has been wiped. The page will now reload.');
    window.location.reload();
  }
};
</script>
