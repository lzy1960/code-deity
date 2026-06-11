<script setup lang="ts">
import { onMounted, onUnmounted, computed, watch, ref } from 'vue'
import { useGameStore } from '~/store/game'
import { useOfflineProgressModal } from '~/composables/useOfflineProgressModal'
import OfflineProgressModal from '~/components/game/OfflineProgressModal.vue'
import ExitConfirmationModal from '~/components/layout/ExitConfirmationModal.vue'
import ParadigmPurchaseModal from '~/components/game/ParadigmPurchaseModal.vue'
import SingularityConfirmationModal from '~/components/game/SingularityConfirmationModal.vue'
import CompileConfirmationModal from '~/components/game/CompileConfirmationModal.vue'
import RefactorConfirmationModal from '~/components/game/RefactorConfirmationModal.vue'
import TechDebtPanel from '~/components/game/TechDebtPanel.vue'
import HelpModal from '~/components/layout/HelpModal.vue'
import SettingsPanel from '~/components/layout/SettingsPanel.vue'
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
let savePromise: Promise<void> = Promise.resolve()
let resumePromise: Promise<void> | null = null

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

function pauseAndSaveGame() {
  gameStore.stopGameLoop()
  savePromise = Promise.resolve($saveGameLocal({ notify: false })).catch((error) => {
    console.warn('Failed to save game while pausing.', error)
  })
  return savePromise
}

async function resumeGameFromStorage() {
  if (resumePromise) return resumePromise

  gameStore.stopGameLoop()
  resumePromise = (async () => {
    await savePromise
    try {
      await $loadGame()
    } catch (error) {
      console.warn('Failed to load game while resuming.', error)
    }
    revealOfflineProgressIfNeeded()
    gameStore.startGameLoop()
  })().finally(() => {
    resumePromise = null
  })

  return resumePromise
}

// Save on page hide and reconcile offline progress when the page returns.
useEventListener(document, 'visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    pauseAndSaveGame()
  } else if (document.visibilityState === 'visible') {
    void resumeGameFromStorage()
  }
})
useEventListener(window, 'pagehide', () => {
  pauseAndSaveGame()
})
useEventListener(window, 'beforeunload', () => {
  pauseAndSaveGame()
})

onMounted(async () => {
  await resumeGameFromStorage()

  // Auto-save frequently; saveManager also keeps a synchronous refresh-safe mirror.
  autoSaveIntervalId = setInterval(() => {
    $saveGameLocal({ notify: false })
  }, 5000)

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
        await resumeGameFromStorage();
      } else {
        pauseAndSaveGame();
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
  $saveGameLocal({ notify: false })
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
    <CompileConfirmationModal />
    <RefactorConfirmationModal />
    <TechDebtPanel />
    <HelpModal />
    <SettingsPanel />
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
