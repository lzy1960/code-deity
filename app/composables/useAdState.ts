import { ref } from 'vue'
import { createSharedComposable } from '@vueuse/core'

export type BoostType = 'quantumComputing' | 'supplyChainOptimization' | 'algorithmBreakthrough' | 'codeInjection' | 'neuralBoost' | 'offlineBonus';

export const useAdState = createSharedComposable(() => {
  // For simulating progress and handling app lifecycle
  const adShownTimestamp = ref(0)
  const adClosedTimestamp = ref(0)
  const adDismissed = ref(false)
  
  // For the event-driven reward system
  const requestedBoostType = ref<BoostType | null>(null)
  const rewardGranted = ref(false)

  return { 
    adShownTimestamp,
    adClosedTimestamp,
    adDismissed,
    requestedBoostType,
    rewardGranted
  }
})
