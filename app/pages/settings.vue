<template>
  <div class="relative flex size-full min-h-screen flex-col overflow-x-hidden bg-[#0d151c] text-white" style="padding-top: env(safe-area-inset-top);">
    <header class="sticky top-0 z-10 bg-[#0d151c]/90 backdrop-blur-sm border-b border-[#21364a]">
      <div class="flex items-center px-3 py-2">
        <button @click="goBack" class="flex size-8 shrink-0 items-center justify-center text-[#5a7a96] hover:text-white transition-colors">
          <Icon name="mdi:arrow-left" class="text-base" />
        </button>
        <h1 class="flex-1 text-center text-sm font-semibold text-white pr-8">{{ $t('common.settings') }}</h1>
      </div>
    </header>

    <div class="flex-1 p-3 space-y-3">

      <!-- Language Settings -->
      <div class="bg-[#182635] rounded-md p-3 flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-white">{{ $t('common.language') }}</p>
          <p class="text-[10px] text-[#5a7a96] mt-0.5">{{ $t('common.current') }} {{ currentLocaleName }}</p>
        </div>
        <button @click="languageModal.show()" class="bg-[#21364a] hover:bg-[#2a4a66] text-white text-xs font-medium py-1.5 px-3 rounded transition-colors">
          {{ $t('common.switch') }}
        </button>
      </div>

      <!-- Onboarding Reset -->
      <div class="bg-[#182635] rounded-md p-3 flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-white">{{ $t('onboarding.resetTour') }}</p>
          <p class="text-[10px] text-[#5a7a96] mt-0.5">{{ $t('onboarding.resetTourHint') }}</p>
        </div>
        <button @click="handleResetTour" class="bg-[#21364a] hover:bg-[#2a4a66] text-white text-xs font-medium py-1.5 px-3 rounded transition-colors">
          {{ $t('onboarding.resetTour') }}
        </button>
      </div>

      <!-- Danger Zone -->
      <div class="border border-red-900/40 rounded-md overflow-hidden">
        <div class="px-3 py-2 bg-red-950/20">
          <p class="text-[10px] font-semibold text-red-400 uppercase tracking-wider">{{ $t('common.dangerZone') }}</p>
        </div>
        <div class="p-3 flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-white">{{ $t('common.wipeAllData') }}</p>
            <p class="text-[10px] text-[#5a7a96] mt-0.5">{{ $t('common.wipeDataHint') }}</p>
          </div>
          <button @click="wipeAllData" class="bg-red-900/60 hover:bg-red-800/80 text-red-300 text-xs font-medium py-1.5 px-3 rounded transition-colors border border-red-800/50">
            {{ $t('common.wipeData') }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useLanguageModal } from '~/composables/useLanguageModal';
import { useOnboarding } from '~/composables/useOnboarding';

const router = useRouter();
const { $wipeData } = useNuxtApp() as any
const languageModal = useLanguageModal();
const { resetTour } = useOnboarding();
const { locales, locale } = useI18n();

const currentLocaleName = computed(() => {
  const current = locales.value.find(l => l.code === locale.value);
  return current ? current.name : locale.value;
});

const goBack = () => {
  router.back();
};

const handleResetTour = () => {
  resetTour();
  router.replace('/');
};

const wipeAllData = async () => {
  if (window.confirm($t('toast.wipeDataConfirm'))) {
    await $wipeData();
    resetTour();
    alert($t('toast.dataWiped'));
    await router.replace('/');
  }
};
</script>