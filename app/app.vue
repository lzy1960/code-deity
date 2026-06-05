<script setup lang="ts">
import { onMounted, onUnmounted, computed, watch, ref } from 'vue'
import { useGameStore } from '~/store/game'
import { useOfflineProgressModal } from '~/composables/useOfflineProgressModal'
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
import type { PluginListenerHandle } from '@capacitor/core'

const gameStore = useGameStore()

const { $loadGame, $saveGameLocal } = useNuxtApp() as any
const exitConfirmationModal = useExitConfirmationModal()
const router = useRouter()
const route = useRoute()

const isDev = computed(() => process.env.NODE_ENV === 'development')

const { isRevealed, reveal, onConfirm, confirm } = useOfflineProgressModal()
let autoSaveIntervalId: ReturnType<typeof setInterval> | null = null
const capacitorListeners: PluginListenerHandle[] = []

onConfirm(async () => {
  gameStore.applyOfflineGains()
})

function revealOfflineProgressIfNeeded() {
  if (!gameStore.hasPendingOfflineGains) {
    gameStore.calculateOfflineProgress()
  }
  if (gameStore.hasPendingOfflineGains) {
    reveal()
  }
}

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
  revealOfflineProgressIfNeeded()

  // Start the game loop
  gameStore.startGameLoop()

  // Auto-save every 15 seconds
  autoSaveIntervalId = setInterval(() => {
    $saveGameLocal()
  }, 15000)

  // Listen for the hardware back button on Android
  capacitorListeners.push(
    await App.addListener('backButton', () => {
      if (route.path !== '/') {
        router.back();
      } else {
        exitConfirmationModal.show();
      }
    })
  )

  // Listen for app state changes (background/foreground)
  capacitorListeners.push(
    await App.addListener('appStateChange', async (state) => {
      if (state.isActive) {
        await $loadGame();
        revealOfflineProgressIfNeeded();
      } else {
        $saveGameLocal();
      }
    })
  )
})

onUnmounted(() => {
  if (autoSaveIntervalId !== null) {
    clearInterval(autoSaveIntervalId)
    autoSaveIntervalId = null
  }
  gameStore.stopGameLoop()
  for (const listener of capacitorListeners.splice(0)) {
    void listener.remove()
  }
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

    <OfflineProgressModal
      :is-revealed="isRevealed"
      :cp="gameStore.pendingOfflineGains?.cp"
      @confirm="confirm"
    />
  </div>
</template>
