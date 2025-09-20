<template>
  <div class="relative flex size-full min-h-screen flex-col justify-between overflow-x-hidden bg-[#0D1217] text-white" style="padding-top: env(safe-area-inset-top);">
    <div class="flex-1">
      <header class="sticky top-0 z-10 bg-[#0D1217]/80 backdrop-blur-sm">
        <div class="flex items-center p-4">
          <button @click="goBack" class="flex size-10 shrink-0 items-center justify-center">
            <Icon name="mdi:arrow-left" class="text-2xl" />
          </button>
          <h1 class="flex-1 text-center text-xl font-bold tracking-tight pr-10">{{ $t('common.settings') }}</h1>
        </div>
      </header>
      <div class="p-4 space-y-6">

        <!-- Logged in state -->
        <div v-if="authStore.isLoggedIn" class="bg-[#1C2836] rounded-lg p-6 text-center space-y-4">
          <div class="flex items-center justify-center space-x-4">
            <img :src="authStore.user?.user_metadata.avatar_url" alt="User Avatar" class="h-16 w-16 rounded-full object-cover">
            <div>
              <p class="text-gray-300 text-left">{{ $t('common.loggedInAs') }}</p>
              <p class="text-lg font-bold text-white text-left">{{ authStore.user?.email }}</p>
            </div>
          </div>
          <button @click="logout" class="w-full flex items-center justify-center gap-3 bg-red-600/80 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-600/100 transition-colors">
            <Icon name="mdi:logout" class="h-6 w-6" />
            <span>{{ $t('common.logOut') }}</span>
          </button>
        </div>

        <!-- Logged out state -->
        <div v-else class="bg-[#1C2836] rounded-lg p-6 text-center">
          <button @click="loginWithGoogle" class="w-full flex items-center justify-center gap-3 bg-[#3899fa] text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors">
            <Icon name="mdi:google" class="h-6 w-6" />
            <span>{{ $t('common.logInWithGoogle') }}</span>
          </button>
        </div>

        <div class="bg-[#1C2836] rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-lg">{{ $t('common.cloudSync') }}</p>
              <p v-if="gameStore.lastCloudSync" class="text-sm text-gray-400">{{ $t('common.lastSync') }} {{ lastSyncTimeAgo }}</p>
              <p v-else class="text-sm text-gray-400">{{ $t('common.lastSync') }} {{ $t('common.never') }}</p>
            </div>
            <button @click="syncNow" class="bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
              {{ $t('common.syncNow') }}
            </button>
          </div>
        </div>
        <div class="bg-[#1C2836] rounded-lg divide-y divide-gray-700">
          <a @click="exportSave" class="flex items-center justify-between p-4 hover:bg-gray-800 transition-colors rounded-t-lg cursor-pointer">
            <span class="text-lg">{{ $t('common.exportSave') }}</span>
            <Icon name="mdi:chevron-right" class="text-gray-400" />
          </a>
          <a @click="importSave" class="flex items-center justify-between p-4 hover:bg-gray-800 transition-colors rounded-b-lg cursor-pointer">
            <span class="text-lg">{{ $t('common.importSave') }}</span>
            <Icon name="mdi:chevron-right" class="text-gray-400" />
          </a>
        </div>

        <!-- Language Settings -->
        <div class="bg-[#1C2836] rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-lg">{{ $t('common.language') }}</p>
              <p class="text-sm text-gray-400">{{ $t('common.current') }} {{ currentLocaleName }}</p>
            </div>
            <button @click="languageModal.show()" class="bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
              {{ $t('common.switch') }}
            </button>
          </div>
        </div>

        <!-- Danger Zone -->
        <div class="border-t-2 border-red-500/30 pt-6">
          <h3 class="text-xl font-bold text-red-400">{{ $t('common.dangerZone') }}</h3>
          <div class="mt-4 bg-[#1C2836] rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-lg">{{ $t('common.wipeAllData') }}</p>
                <p class="text-sm text-gray-400">{{ $t('common.wipeDataHint') }}</p>
              </div>
              <button @click="wipeAllData" class="bg-red-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                {{ $t('common.wipeData') }}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/store/auth';
import { useGameStore } from '~/store/game';
import { useTimeAgo } from '@vueuse/core';
import { useLanguageModal } from '~/composables/useLanguageModal';

const authStore = useAuthStore();
const gameStore = useGameStore();
const supabase = useSupabaseClient();
const router = useRouter();
const { $saveGameCloud, $loadGame, $wipeData } = useNuxtApp() as any
const languageModal = useLanguageModal();
const { locales, locale } = useI18n();

const currentLocaleName = computed(() => {
  const current = locales.value.find(l => l.code === locale.value);
  return current ? current.name : locale.value;
});

const lastSyncTimeAgo = useTimeAgo(computed(() => gameStore.lastCloudSync ?? 0))

const goBack = () => {
  router.back();
};

const loginWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) {
    alert($t('toast.errorLoggingIn') + error.message);
  }
};

const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    alert($t('toast.errorLoggingOut') + error.message);
  }
};

const syncNow = async () => {
  // A simple sync is to save the current state to the cloud,
  // then immediately load from the cloud to resolve any conflicts.
  alert($t('toast.syncingCloud'));
  await $saveGameCloud();
  await $loadGame();
  alert($t('toast.syncComplete'));
};

const exportSave = () => {
  alert($t('toast.exportSaveNotImplemented'));
  // Future implementation: trigger save file download
};

const importSave = () => {
  alert($t('toast.importSaveNotImplemented'));
  // Future implementation: open file picker and load save
};

const wipeAllData = async () => {
  if (window.confirm($t('toast.wipeDataConfirm'))) {
    await $wipeData();
    alert($t('toast.dataWiped'));
    // Programmatically navigate the user back to the main page to ensure a clean state.
    await router.replace('/');
  }
};
</script>