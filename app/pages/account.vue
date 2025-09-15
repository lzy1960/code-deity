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
            <Icon name="mdi:chevron-right" class="text-gray-400" />
          </a>
          <a @click="importSave" class="flex items-center justify-between p-4 hover:bg-gray-800 transition-colors rounded-b-lg cursor-pointer">
            <span class="text-lg">Import Save</span>
            <Icon name="mdi:chevron-right" class="text-gray-400" />
          </a>
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

const authStore = useAuthStore();
const supabase = useSupabaseClient();

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
