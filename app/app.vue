<script setup lang="ts">
import { onMounted, computed, watch, ref } from 'vue'
import { useGameStore } from '~/store/game'
import { useOfflineProgressModal } from '~/composables/useOfflineProgressModal'
import { formatNumber } from '~/utils/format';
import OfflineProgressModal from '~/components/game/OfflineProgressModal.vue'
import ExitConfirmationModal from '~/components/layout/ExitConfirmationModal.vue'
import ParadigmPurchaseModal from '~/components/game/ParadigmPurchaseModal.vue'
import SingularityConfirmationModal from '~/components/game/SingularityConfirmationModal.vue'
import RefactorConfirmationModal from '~/components/game/RefactorConfirmationModal.vue'
import TechDebtPanel from '~/components/game/TechDebtPanel.vue'
import HelpModal from '~/components/layout/HelpModal.vue'
import ToastManager from '~/components/layout/ToastManager.vue'
import LanguageModal from '~/components/layout/LanguageModal.vue'
import AutoSaveNotifier from '~/components/layout/AutoSaveNotifier.vue'
import GenesisLogModal from '~/components/game/GenesisLogModal.vue'
import { useEventListener } from '@vueuse/core'
import { useExitConfirmationModal } from '~/composables/useExitConfirmationModal'
import { App } from '@capacitor/app';

const gameStore = useGameStore()

const { $loadGame, $saveGameLocal } = useNuxtApp() as any
const exitConfirmationModal = useExitConfirmationModal()
const router = useRouter()
const route = useRoute()

const isDev = computed(() => process.env.NODE_ENV === 'development')

const { isRevealed, reveal, onConfirm, confirm } = useOfflineProgressModal()

onConfirm(async () => {
  gameStore.applyOfflineGains()
})

// Save on page hide
useEventListener(document, 'visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    $saveGameLocal()
  }
})
useEventListener(window, 'pagehide', () => {
  $saveGameLocal()
})

onMounted(async () => {
  // Load game data
  await $loadGame()

  // Check for offline progress
  if (gameStore.hasPendingOfflineGains) {
    reveal()
  } else {
    gameStore.calculateOfflineProgress()
    if (gameStore.hasPendingOfflineGains) {
      reveal()
    }
  }

  // Start the game loop
  gameStore.startGameLoop()

  // Auto-save every 15 seconds
  setInterval(() => {
    $saveGameLocal()
  }, 15000)

  // Listen for the hardware back button on Android
  App.addListener('backButton', () => {
    if (route.path !== '/') {
      router.back();
    } else {
      exitConfirmationModal.show();
    }
  });

  // Listen for app state changes (background/foreground)
  App.addListener('appStateChange', async (state) => {
    if (state.isActive) {
      await $loadGame();
      gameStore.calculateOfflineProgress();
      if (gameStore.hasPendingOfflineGains) {
        reveal();
      }
    } else {
      $saveGameLocal();
    }
  });
})

// Save immediately when automator states change (fixes the known auto-save bug)
watch(() => gameStore.automatorStates, () => {
  $saveGameLocal()
}, { deep: true })
</script>

<template>
  <div>
    <NuxtPage />
    <GameNarrativeManager />
    <DevDebugMenu v-if="isDev" />
    <ExitConfirmationModal />
    <ParadigmPurchaseModal />
    <SingularityConfirmationModal />
    <RefactorConfirmationModal />
    <TechDebtPanel />
    <HelpModal />
    <ToastManager />
    <LanguageModal />
    <GenesisLogModal />
    <AutoSaveNotifier />

    <OfflineProgressModal :is-revealed="isRevealed">
      <h2 class="text-3xl font-bold text-[#3899fa] flex items-center justify-center gap-3">
        <Icon name="mdi:timer-sand" />
        <span>{{ $t('common.welcomeBack') }}</span>
      </h2>
      <p class="mt-4 text-lg text-gray-300">{{ $t('common.offlineGainMessage') }}</p>

      <div class="my-6 bg-[#101a23] rounded-lg p-4">
        <p class="text-4xl font-bold text-green-400">+{{ formatNumber(gameStore.pendingOfflineGains?.cp) }}</p>
        <p class="mt-1 text-sm text-gray-400">{{ $t('common.computingPower') }} (CP)</p>
      </div>

      <div class="flex flex-col gap-3">
        <button
          @click="confirm"
          class="w-full rounded-lg bg-[#3899fa] text-white font-bold py-4 px-6 hover:bg-opacity-90 transition-colors text-xl shadow-lg shadow-[#3899fa]/30 transform hover:scale-105 active:scale-100"
        >
          {{ $t('common.confirmGains') }}
        </button>
      </div>
    </OfflineProgressModal>
  </div>
</template>
