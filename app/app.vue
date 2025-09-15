<script setup lang="ts">
import { onMounted, computed, watch } from 'vue'
import { useGameStore } from '~/store/game'
import { useAuthStore } from '~/store/auth'
import { useOfflineProgressModal } from '~/composables/useOfflineProgressModal'
import { formatNumber } from '~/utils/format';
import OfflineProgressModal from '~/components/game/OfflineProgressModal.vue'
import { useEventListener } from '@vueuse/core'

const gameStore = useGameStore()
const authStore = useAuthStore()
const { $loadGame, $saveGameLocal } = useNuxtApp() as any

// Get user state from the module's composable
const user = useSupabaseUser()

// Watch for changes in the user state and update our auth store
watch(user, (newUser) => {
  authStore.setUser(newUser)
}, { immediate: true })


const isDev = computed(() => process.env.NODE_ENV === 'development')

// 1. Use the composable to get modal controls
const { isRevealed, reveal, onConfirm, confirm } = useOfflineProgressModal()

// 2. Define what happens when the user confirms
onConfirm(async () => {
  gameStore.applyOfflineGains()
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

onMounted(async () => {
  // 3. Load game data
  await $loadGame()

  // 4. Start the game loop immediately
  gameStore.startGameLoop()

  // 5. Check for offline progress and reveal the modal if needed
  if (gameStore.hasPendingOfflineGains) {
    reveal()
  } else {
    gameStore.calculateOfflineProgress()
    if (gameStore.hasPendingOfflineGains) {
      reveal()
    }
  }

  // 6. Set up auto-save (local only)
  setInterval(() => {
    $saveGameLocal()
  }, 15000)
})
</script>

<template>
  <div>
    <NuxtPage />
    <GameNarrativeManager />
    <DevDebugMenu v-if="isDev" />

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

      <button 
        @click="confirm"
        class="w-full rounded-lg bg-[#3899fa] text-white font-bold py-4 px-6 hover:bg-opacity-90 transition-colors text-xl shadow-lg shadow-[#3899fa]/30 transform hover:scale-105 active:scale-100"
      >
        确认收益
      </button>
    </OfflineProgressModal>
  </div>
</template>
