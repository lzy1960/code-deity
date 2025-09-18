<script setup lang="ts">
import { onMounted, computed, watch, ref } from 'vue'
import { useGameStore } from '~/store/game'
import { useAuthStore } from '~/store/auth'
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
import AdBoostModal from '~/components/game/AdBoostModal.vue'
import { useEventListener } from '@vueuse/core'
import { useIsNative } from '~/utils/platform'
import { useToast } from '~/composables/useToast'
import { useAdState } from '~/composables/useAdState'

import { useExitConfirmationModal } from '~/composables/useExitConfirmationModal'
import { App } from '@capacitor/app';
import { initializeAdMob, showRewardVideoAd } from '~/services/admob';

const gameStore = useGameStore()
const authStore = useAuthStore()
const { $loadGame, $saveGameLocal } = useNuxtApp() as any
const exitConfirmationModal = useExitConfirmationModal()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const adState = useAdState()

// Get user state from the module's composable
const user = useSupabaseUser()

// Watch for changes in the user state and update our auth store
watch(user, (newUser) => {
  authStore.setUser(newUser)
}, { immediate: true })


const isDev = computed(() => process.env.NODE_ENV === 'development')
const adWatched = ref(false)
const isNative = useIsNative()
const isOfflineAdLoading = ref(false)

// 1. Use the composable to get modal controls
const { isRevealed, reveal, onConfirm, confirm } = useOfflineProgressModal()

// 2. Define what happens when the user confirms
onConfirm(async () => {
  gameStore.applyOfflineGains()
  adWatched.value = false // Reset ad state when modal closes
})

// Add a global event listeners to save the game locally when the user leaves the page.
useEventListener(document, 'visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    $saveGameLocal()
  }
})
useEventListener(window, 'pagehide', () => {
  $saveGameLocal()
})

async function watchAdForBonus() {
  if (isOfflineAdLoading.value) return;

  try {
    isOfflineAdLoading.value = true;
    // Fire and forget. The global watcher will handle the reward.
    await showRewardVideoAd('offlineBonus');
  } catch (error) {
    console.error('Error showing offline reward video ad:', error);
    toast.addToast('广告加载失败，请稍后再试', 'error');
  } finally {
    isOfflineAdLoading.value = false;
  }
}

onMounted(async () => {
  // Initialize AdMob and its global listeners
  initializeAdMob();

  // Central watcher for when a reward is successfully granted
  watch(() => adState.rewardGranted.value, (isGranted) => {
    if (isGranted) {
      const boostType = adState.requestedBoostType.value;

      switch (boostType) {
        case 'quantumComputing':
          gameStore.activateQuantumComputing();
          toast.addToast('量子计算已激活！CPS x5，持续10分钟', 'success', 5000);
          break;
        case 'supplyChainOptimization':
          gameStore.activateSupplyChainOptimization();
          toast.addToast('供应链已优化！成本降低25%，持续15分钟', 'success', 5000);
          break;
        case 'algorithmBreakthrough':
          gameStore.activateAlgorithmBreakthrough();
          toast.addToast('算法突破已激活！下次购买生成器成本降低90%', 'success', 5000);
          break;
        case 'codeInjection':
          gameStore.applyCodeInjection();
          toast.addToast('代码注入成功！获得1小时算力', 'success', 5000);
          break;
        case 'neuralBoost':
          gameStore.activateNeuralBoost();
          toast.addToast('神经超频已激活！手动点击效果提升10倍', 'success', 5000);
          break;
        case 'offlineBonus':
          gameStore.doubleOfflineGains();
          adWatched.value = true; // Disable the button in the offline modal
          toast.addToast('超线程已启动！离线收益翻倍', 'success', 5000);
          break;
        case 'refactorBonus':
          gameStore.doubleNextRefactorGain();
          gameStore.refactor();
          toast.addToast('超级编译完成！本次重构收益翻倍', 'success', 5000);
          break;
      }

      // Reset the state after applying the reward
      adState.rewardGranted.value = false;
      adState.requestedBoostType.value = null;
    }
  });

  // Central watcher for when an ad is dismissed (closed)
  watch(() => adState.adDismissed.value, async (wasDismissed) => {
    if (wasDismissed) {
      const adWatchDuration = Date.now() - adState.adShownTimestamp.value;
      
      if (adWatchDuration > 0) {
        // Pause resource generation by shifting the clock forward
        gameStore.adjustLastUpdateTime(adWatchDuration);
        // Pause active boost timers by extending their expiry
        gameStore.extendBoosts(adWatchDuration);
      }

      // Immediately save the new state with the corrected timestamps
      await $saveGameLocal();

      // Reset the dismiss flag
      adState.adDismissed.value = false;
    }
  });

  // Load game data
  await $loadGame()

  // Check for offline progress and reveal the modal if needed
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

  // Set up auto-save (local only)
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

  // Listen for app state changes (background/foreground) - now simplified
  App.addListener('appStateChange', async (state) => {
    if (state.isActive) {
      // App came to foreground, check for offline progress
      await $loadGame();
      gameStore.calculateOfflineProgress();
      if (gameStore.hasPendingOfflineGains) {
        reveal();
      }
    } else {
      // App went to background, ensure game is saved
      $saveGameLocal();
    }
  });
})
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
    <AdBoostModal />

    <!-- 
      The modal component is now a generic frame.
      We pass the specific content and the button with the correctly scoped
      `confirm` function directly into the slot.
    -->
    <OfflineProgressModal :is-revealed="isRevealed">
      <h2 class="text-3xl font-bold text-[#3899fa] flex items-center justify-center gap-3">
        <Icon name="mdi:timer-sand" />
        <span>欢迎回来！</span>
      </h2>
      <p class="mt-4 text-lg text-gray-300">在您离线的这段时间里，您的代码产生了新的算力：</p>
      
      <div class="my-6 bg-[#101a23] rounded-lg p-4">
        <p class="text-4xl font-bold text-green-400">+{{ formatNumber(gameStore.pendingOfflineGains?.cp) }}</p>
        <p class="mt-1 text-sm text-gray-400">算力 (CP)</p>
      </div>

      <div class="flex flex-col gap-3">
        <button 
          v-if="isNative"
          @click="watchAdForBonus"
          :disabled="adWatched || isOfflineAdLoading"
          class="w-full rounded-lg bg-yellow-500 text-black font-bold py-4 px-6 hover:bg-opacity-90 transition-all text-xl shadow-lg shadow-yellow-500/30 transform hover:scale-105 active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
        >
          <template v-if="isOfflineAdLoading">
            <Icon name="mdi:loading" class="animate-spin" />
            <span>加载中...</span>
          </template>
          <template v-else>
            <Icon name="mdi:movie-play" />
            <span>启动超线程 (x2 收益)</span>
          </template>
        </button>
        <button 
          @click="confirm"
          class="w-full rounded-lg bg-[#3899fa] text-white font-bold py-4 px-6 hover:bg-opacity-90 transition-colors text-xl shadow-lg shadow-[#3899fa]/30 transform hover:scale-105 active:scale-100"
        >
          确认收益
        </button>
      </div>
    </OfflineProgressModal>
  </div>
</template>
