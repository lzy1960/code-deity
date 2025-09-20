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
import { useLanguageModal } from '~/composables/useLanguageModal';

const router = useRouter();
const { $wipeData } = useNuxtApp() as any
const languageModal = useLanguageModal();
const { locales, locale } = useI18n();

const currentLocaleName = computed(() => {
  const current = locales.value.find(l => l.code === locale.value);
  return current ? current.name : locale.value;
});

const goBack = () => {
  router.back();
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
