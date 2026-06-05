<template>
  <div class="settings-page" style="padding-top: env(safe-area-inset-top);">
    <header class="settings-header">
      <div class="flex items-center px-3 py-2">
        <button @click="goBack" class="back-button">
          <Icon name="mdi:arrow-left" class="text-base" />
        </button>
        <h1 class="flex-1 text-center text-sm font-semibold text-white pr-8">{{ $t('common.settings') }}</h1>
      </div>
    </header>

    <main class="settings-body">

      <!-- Language Settings -->
      <section class="settings-row">
        <div>
          <p>{{ $t('common.language') }}</p>
          <span>{{ $t('common.current') }} {{ currentLocaleName }}</span>
        </div>
        <button @click="languageModal.show()" class="panel-action">
          {{ $t('common.switch') }}
        </button>
      </section>

      <!-- Onboarding Reset -->
      <section class="settings-row">
        <div>
          <p>{{ $t('onboarding.resetTour') }}</p>
          <span>{{ $t('onboarding.resetTourHint') }}</span>
        </div>
        <button @click="handleResetTour" class="panel-action">
          {{ $t('onboarding.resetTour') }}
        </button>
      </section>

      <!-- Danger Zone -->
      <section class="danger-panel">
        <div class="danger-header">
          <p>{{ $t('common.dangerZone') }}</p>
        </div>
        <div class="danger-body">
          <div>
            <p>{{ $t('common.wipeAllData') }}</p>
            <span>{{ $t('common.wipeDataHint') }}</span>
          </div>
          <button @click="wipeAllData" class="danger-action">
            {{ $t('common.wipeData') }}
          </button>
        </div>
      </section>

    </main>
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

<style scoped>
.settings-page {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  overflow-x: hidden;
  background: #101a23;
  color: #fff;
}

.settings-page::before,
.settings-page::after {
  display: none;
}

.settings-header,
.settings-body {
  position: relative;
}

.settings-header {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #253f56;
  background: #0d1823;
  box-shadow: none;
}

.back-button {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid #253f56;
  border-radius: 8px;
  color: #8eadcc;
  transition: border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease;
}

.back-button:hover {
  border-color: #3d6f92;
  background: #173047;
  color: #e5f3ff;
}

.settings-body {
  display: grid;
  gap: 10px;
  width: min(100%, 720px);
  margin: 0 auto;
  padding: 12px;
}

.settings-row,
.danger-panel {
  overflow: hidden;
  border: 1px solid #253f56;
  border-radius: 8px;
  background: #0d1924;
  box-shadow: none;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
}

.settings-row p,
.danger-body p {
  color: #e5f3ff;
  font-size: 0.78rem;
  font-weight: 800;
}

.settings-row span,
.danger-body span {
  display: block;
  margin-top: 3px;
  color: #8eadcc;
  font-size: 0.68rem;
  line-height: 1.45;
}

.panel-action,
.danger-action {
  flex: 0 0 auto;
  min-height: 34px;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0 12px;
  transition: border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease;
}

.panel-action {
  border: 1px solid #3d6f92;
  background: #12304a;
  color: #e5f3ff;
}

.panel-action:hover {
  border-color: #5896c4;
  background: #173a55;
}

.danger-panel {
  border-color: #6b3030;
}

.danger-header {
  border-bottom: 1px solid #6b3030;
  background: #2a1418;
  padding: 9px 12px;
}

.danger-header p {
  color: #fca5a5;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.danger-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
}

.danger-action {
  border: 1px solid #7a3d3d;
  background: #3a1b20;
  color: #fca5a5;
}

.danger-action:hover {
  border-color: #9a5555;
  background: #4a2026;
}
</style>
