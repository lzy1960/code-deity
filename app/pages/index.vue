<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore } from '~/store/game';
import { prestigeThresholds } from '~~/game/configs';
import AppHeader from '~/components/layout/AppHeader.vue';
import AppFooter from '~/components/layout/AppFooter.vue';
import GeneratorItem from '~/components/game/GeneratorItem.vue';
import RefactorSection from '~/components/game/RefactorSection.vue';
import CompileSection from '~/components/game/CompileSection.vue';
import AutomationSection from '~/components/game/AutomationSection.vue';
import ChallengesSection from '~/components/game/ChallengesSection.vue';
import StatsSection from '~/components/game/StatsSection.vue';
import SingularitySection from '~/components/game/SingularitySection.vue';
import BuyMultiplierSelector from '~/components/game/BuyMultiplierSelector.vue';
import AdBoostButton from '~/components/game/AdBoostButton.vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useSingularityModal } from '~/composables/useSingularityModal';
import { useToast } from '~/composables/useToast';
import { formatNumber } from '~/utils/format';

const gameStore = useGameStore();
const singularityModal = useSingularityModal();
const toast = useToast();

const activeTab = ref('generators');
const upgradesSubTab = ref('refactor');
const hasShownRefactorMessage = ref(false);
const hasShownOverloadMessage = ref(false);

// Floating numbers state
const floatingNumbers = ref<{ id: number, amount: string, left: string }[]>([]);
let floatingNumberId = 0;

const handleManualClick = () => {
  const clickPower = gameStore.manualClickPower;
  gameStore.manualClick();

  const newId = floatingNumberId++;
  floatingNumbers.value.push({
    id: newId,
    amount: `+${formatNumber(clickPower)}`,
    left: `${Math.random() * 50 + 10}px` // Position above the left-aligned CP display
  });

  // Remove the number after the animation completes
  setTimeout(() => {
    floatingNumbers.value = floatingNumbers.value.filter(n => n.id !== newId);
  }, 1500); // Corresponds to animation duration
};

const handleSingularityReset = () => {
  singularityModal.show(() => {
    gameStore.performSingularityReset();
    activeTab.value = 'singularity';
  });
};

const isGeneratorSectionUnlocked = computed(() => {
  return gameStore.isGeneratorUnlocked(1);
});

const unlockedGenerators = computed(() => {
  return gameStore.generators.filter(g => gameStore.isGeneratorUnlocked(g.id));
});

const headerTitle = computed(() => {
  if (!isGeneratorSectionUnlocked.value) {
    return $t('index.gameTitle');
  }
  // Capitalize first letter
  return activeTab.value.charAt(0).toUpperCase() + activeTab.value.slice(1);
});

const buyGenerator = (id: number) => {
  gameStore.buyGenerator(id);
};

const desktopNavItems = computed(() => [
  { id: 'generators', label: $t('common.generators'), icon: 'mdi:memory', unlocked: true },
  { id: 'upgrades', label: $t('common.refactor'), icon: 'mdi:rocket-launch', unlocked: gameStore.isRefactorUnlocked },
  { id: 'challenges', label: $t('common.challenges'), icon: 'mdi:trophy-variant', unlocked: gameStore.isChallengesUnlocked },
  { id: 'automation', label: $t('common.automation'), icon: 'mdi:robot', unlocked: gameStore.isAutomationUnlocked },
  { id: 'singularity', label: $t('common.singularity'), icon: 'mdi:creation', unlocked: gameStore.unlockedSingularity },
]);

const getDesktopNavUnlockHint = (item: { id: string; unlocked: boolean }): string => {
  if (item.unlocked) return '';
  switch (item.id) {
    case 'upgrades': return $t('common.unlockRefactorHint');
    case 'automation': return $t('common.unlockAutomationHint');
    case 'challenges': return $t('common.unlockChallengesHint');
    // A specific hint for singularity might be needed if not covered by a generic one.
    default: return $t('common.notUnlocked'); 
  }
};

const handleDesktopNavClick = (item: { id: string; unlocked: boolean }) => {
  if (item.unlocked) {
    activeTab.value = item.id;
  } else {
    const hint = getDesktopNavUnlockHint(item);
    toast.addToast(hint, 'warning');
  }
};

watch(() => gameStore.isRefactorUnlocked, (isUnlocked) => {
  if (isUnlocked && !hasShownRefactorMessage.value) {
    toast.addToast(
      $t('toast.refactorSuggestion'),
      'warning',
      5000
    );
    hasShownRefactorMessage.value = true;
    activeTab.value = 'upgrades';
  }
});

watch(() => gameStore.generators.find(g => g.id === 8)!.bought, (aiCores) => {
  if (aiCores > prestigeThresholds.ARCHITECTURAL_OVERHEAD_AI_CORES && !hasShownOverloadMessage.value) {
    toast.addToast(
      $t('toast.architecturalOverload'),
      'error',
      8000
    );
    hasShownOverloadMessage.value = true;
  }
});

watch(() => gameStore.isMultiplierUnlocked, (isUnlocked) => {
  gameStore.setBuyMultiplier('x1')
})

watch(() => gameStore.refactorCount, (newCount, oldCount) => {
  if (newCount > oldCount) {
    activeTab.value = 'generators';
    // Reset message flags on refactor
    hasShownOverloadMessage.value = false;
  }
});

// Watch for unlocks to provide haptic feedback
watch(() => unlockedGenerators.value.length, (newLength, oldLength) => {
  if (newLength > oldLength && oldLength > 0) { // oldLength > 0 to avoid vibration on initial load
    Haptics.impact({ style: ImpactStyle.Light });
  }
});

watch(() => gameStore.isRefactorUnlocked, (isUnlocked, wasUnlocked) => {
  if (isUnlocked && !wasUnlocked) {
    Haptics.impact({ style: ImpactStyle.Medium });
  }
});

watch(() => gameStore.isCompileUnlocked, (isUnlocked, wasUnlocked) => {
  if (isUnlocked && !wasUnlocked) {
    Haptics.impact({ style: ImpactStyle.Medium });
  }
});
</script>

<template>
  <div class="flex size-full h-dvh flex-col bg-[#101a23] text-white dark group/design-root h-full min-h-[100vh]" style='font-family: "Space Grotesk", "Noto Sans", sans-serif; padding-top: env(safe-area-inset-top);'>
    <!-- Header (Mobile and Desktop) -->
    <div class="relative shrink-0 sticky top-0 z-30">
      <AppHeader :title="headerTitle" :can-singularity="gameStore.canSingularity" @singularity-click="handleSingularityReset">
        <template #actions>
          <BuyMultiplierSelector v-if="activeTab === 'generators' && gameStore.isMultiplierUnlocked" />
        </template>
      </AppHeader>
      <div class="floating-numbers-container">
        <span
          v-for="num in floatingNumbers"
          :key="num.id"
          class="floating-number"
          :style="{ left: num.left }"
        >
          {{ num.amount }}
        </span>
      </div>
    </div>

    <!-- Initial Manual Code Button (Centered) -->
    <div v-if="!isGeneratorSectionUnlocked" class="flex-1 flex justify-center items-center h-64">
      <button @click.prevent="handleManualClick" class="px-10 py-5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105">
        {{ $t('common.manualCode') }}
      </button>
    </div>

    <!-- Main Layout (Desktop and Mobile) -->
    <div v-else class="flex-1 lg:flex lg:overflow-hidden h-full">
      <!-- Left Column (Desktop Only) -->
      <aside class="hidden lg:flex lg:flex-col w-1/4 xl:w-1/5 h-full bg-[#0d151c] p-4 space-y-6 border-r border-gray-800 overflow-y-auto">
        <!-- Stats Panel -->
        <div>
          <h2 class="text-xl font-bold text-white mb-4">Dashboard</h2>
          <StatsSection />
        </div>
        <!-- Desktop Navigation -->
        <nav class="flex-1 space-y-2">
          <h2 class="text-xl font-bold text-white mb-4">Navigation</h2>
          <a 
            v-for="item in desktopNavItems"
            :key="item.id"
            @click="handleDesktopNavClick(item)"
            class="flex items-center justify-between px-4 py-3 text-lg rounded-lg cursor-pointer transition-colors"
            :class="[
              activeTab === item.id 
                ? 'bg-[#3899fa] text-white font-bold' 
                : item.unlocked 
                  ? 'text-gray-400 hover:bg-gray-800 hover:text-white' 
                  : 'text-gray-600 cursor-not-allowed'
            ]"
          >
            <div class="flex items-center">
              <Icon :name="item.icon" class="mr-3" />
              <span>{{ item.label }}</span>
            </div>
            <Icon v-if="!item.unlocked" name="mdi:lock" class="text-gray-500" />
          </a>
        </nav>
      </aside>

      <!-- Right/Main Column (Mobile and Desktop) -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6">
        <div :class="{ 'mx-auto max-w-4xl': activeTab !== 'singularity' }" class="space-y-4 pb-24 lg:pb-6">
          <!-- Manual Overclock Button (Visible on all screen sizes when generators tab is active) -->
          <button v-if="activeTab === 'generators'" @click.prevent="handleManualClick" class="w-full px-6 py-4 bg-gradient-to-br from-purple-600 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all transform hover:scale-105 active:scale-100 flex items-center justify-center gap-3 text-sm">
            <Icon name="mdi:flash" />
            <span>{{ $t('common.manualOverclock') }} ({{ $t('common.cpsBonus') }})</span>
          </button>

          <!-- Mobile-only Tab Content -->
          <div class="lg:hidden">
            <!-- Generators Section -->
            <div v-show="activeTab === 'generators'" class="space-y-4">
              <div class="space-y-3">
                <GeneratorItem
                  v-for="generator in unlockedGenerators"
                  :key="generator.id"
                  :generator-id="generator.id"
                  :discounted-cost="gameStore.isAlgorithmBreakthroughActive ? gameStore.costForAmount(generator.id, gameStore.buyAmount(generator.id)).times(0.1) : undefined"
                  @buy="buyGenerator(generator.id)"
                />
              </div>
            </div>

            <!-- Upgrades Section -->
            <div v-show="activeTab === 'upgrades'">
              <div class="border-b border-gray-700 px-4 mb-4">
                <div class="flex justify-around">
                  <a @click="upgradesSubTab = 'refactor'" class="flex flex-col items-center justify-center py-3 px-4 w-1/2 text-center cursor-pointer" :class="upgradesSubTab === 'refactor' ? 'border-b-2 border-b-[#3899fa] text-white' : 'border-b-2 border-b-transparent text-gray-500 hover:text-white transition-colors'">
                    <p class="text-base font-bold">{{ $t('common.refactor') }}</p>
                  </a>
                  <a 
                    v-if="gameStore.isRefactorUnlocked" 
                    @click="gameStore.isCompileUnlocked ? upgradesSubTab = 'deploy' : null" 
                    class="flex flex-col items-center justify-center py-3 px-4 w-1/2 text-center"
                    :class="{
                      'cursor-pointer': gameStore.isCompileUnlocked,
                      'cursor-not-allowed': !gameStore.isCompileUnlocked,
                      'border-b-2 border-b-[#3899fa] text-white': upgradesSubTab === 'deploy',
                      'border-b-2 border-b-transparent text-gray-500 hover:text-white transition-colors': upgradesSubTab !== 'deploy'
                    }"
                  >
                    <p class="text-base font-bold flex items-center">
                      {{ $t('common.deploy') }}
                      <Icon v-if="!gameStore.isCompileUnlocked" name="mdi:lock" class="ml-1 text-gray-500" />
                    </p>
                    <p v-if="!gameStore.isCompileUnlocked" class="text-xs text-gray-500 mt-1">
                      ({{ $t('common.requires') }} {{ prestigeThresholds.COMPILE_UNLOCK_RP }} {{ $t('common.refactorPoints') }})
                    </p>
                  </a>
                </div>
              </div>

              <div v-show="upgradesSubTab === 'refactor'">
                <RefactorSection 
                  :potential-rp-gain="gameStore.refactorGain.toNumber()" 
                  :can-refactor="gameStore.canRefactor" 
                  :current-rp-bonus="gameStore.rpBonus" 
                  :unlock-requirement="prestigeThresholds.REFACTOR_UNLOCK_AI_CORES"
                  @refactor="gameStore.refactor" 
                />
              </div>
              
              <div v-if="gameStore.isRefactorUnlocked" v-show="upgradesSubTab === 'deploy'">
                <CompileSection 
                  v-if="gameStore.isCompileUnlocked" 
                  :version="gameStore.version" 
                  :cost="gameStore.compileCost"
                  :can-compile="gameStore.refactorPoints.gte(gameStore.compileCost)"
                  @compile-and-release="gameStore.compileAndRelease" 
                />
                <div v-else class="text-center text-gray-400 p-8">
                  <Icon name="mdi:lock-outline" class="text-5xl mb-4" />
                  <h3 class="text-xl font-bold">{{ $t('common.unlockCondition') }}</h3>
                  <p class="text-lg">{{ $t('common.youNeedToHave') }} <span class="font-bold text-green-400">{{ prestigeThresholds.COMPILE_UNLOCK_RP }}</span> {{ $t('common.refactorPoints') }} {{ $t('common.unlockThisFeature') }}.</p>
                </div>
              </div>
            </div>

            <!-- Stats Section (Mobile Only) -->
            <div v-show="activeTab === 'stats'">
              <StatsSection />
            </div>
            
             <!-- Challenges Section -->
            <div v-show="activeTab === 'challenges'">
              <ChallengesSection />
            </div>
            
             <!-- Automation Section -->
            <div v-show="activeTab === 'automation'">
              <AutomationSection />
            </div>

            <!-- Singularity Section -->
            <div v-show="activeTab === 'singularity'">
              <SingularitySection />
            </div>
          </div>

          <!-- Desktop Content (Mirrors mobile logic but always visible) -->
          <div class="hidden lg:block space-y-4">
            <div v-if="activeTab === 'generators'" class="space-y-3">
              <GeneratorItem
                v-for="generator in unlockedGenerators"
                :key="generator.id"
                :generator-id="generator.id"
                :discounted-cost="gameStore.isAlgorithmBreakthroughActive ? gameStore.costForAmount(generator.id, gameStore.buyAmount(generator.id)).times(0.1) : undefined"
                @buy="buyGenerator(generator.id)"
              />
            </div>

            <div v-if="activeTab === 'upgrades'">
              <RefactorSection 
                :potential-rp-gain="gameStore.refactorGain.toNumber()" 
                :can-refactor="gameStore.canRefactor" 
                :current-rp-bonus="gameStore.rpBonus" 
                :unlock-requirement="prestigeThresholds.REFACTOR_UNLOCK_AI_CORES"
                @refactor="gameStore.refactor" 
              />
              <div class="my-6 border-t border-gray-700"></div>
              <CompileSection 
                v-if="gameStore.isCompileUnlocked" 
                :version="gameStore.version" 
                :cost="gameStore.compileCost"
                :can-compile="gameStore.refactorPoints.gte(gameStore.compileCost)"
                @compile-and-release="gameStore.compileAndRelease" 
              />
            </div>

            <div v-if="activeTab === 'challenges'">
              <ChallengesSection />
            </div>

            <div v-if="activeTab === 'automation'">
              <AutomationSection />
            </div>

            <div v-if="activeTab === 'singularity'">
              <SingularitySection />
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Footer (Mobile Only) -->
    <div class="fixed bottom-0 left-0 right-0 z-20 lg:hidden">
      <AdBoostButton v-if="isGeneratorSectionUnlocked" />
      <AppFooter v-if="isGeneratorSectionUnlocked" v-model:active-tab="activeTab" context="game" />
    </div>
  </div>
</template>

<style scoped>
.floating-numbers-container {
  position: absolute;
  top: 70px; /* Adjust to be just above the CP display */
  left: 0;
  width: 100%;
  height: 100px;
  pointer-events: none;
  z-index: 100;
}

.floating-number {
  position: absolute;
  font-size: 16px;
  font-weight: bold;
  color: #4ade80; /* green-400 */
  text-shadow: 0 0 5px rgba(74, 222, 128, 0.7);
  animation: float-up 1.5s ease-out forwards;
  white-space: nowrap;
}

@keyframes float-up {
  from {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateY(-80px) scale(0.8);
    opacity: 0;
  }
}
</style>
