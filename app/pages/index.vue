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

const gameStore = useGameStore();
const singularityModal = useSingularityModal();
const toast = useToast();

const activeTab = ref('generators');
const upgradesSubTab = ref('refactor');
const hasShownRefactorMessage = ref(false);
const hasShownOverloadMessage = ref(false);

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
    return '代码神祇 (Code Deity)';
  }
  // Capitalize first letter
  return activeTab.value.charAt(0).toUpperCase() + activeTab.value.slice(1);
});

const buyGenerator = (id: number) => {
  gameStore.buyGenerator(id);
};

watch(() => gameStore.isRefactorUnlocked, (isUnlocked) => {
  if (isUnlocked && !hasShownRefactorMessage.value) {
    toast.addToast(
      '代码结构已达瓶颈，建议进行重构',
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
      `架构过载：AI核心数量过多导致效率衰减`,
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
  <div class="relative flex size-full h-screen flex-col overflow-hidden bg-[#101a23] text-white dark group/design-root" style='font-family: "Space Grotesk", "Noto Sans", sans-serif; padding-top: env(safe-area-inset-top);'>
    <AppHeader :title="headerTitle" :can-singularity="gameStore.canSingularity" @singularity-click="handleSingularityReset">
      <template #actions>
        <BuyMultiplierSelector v-if="activeTab === 'generators' && gameStore.isMultiplierUnlocked" />
      </template>
    </AppHeader>

    <main class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-4 pb-24">
        <!-- Manual Code Button -->
        <div v-if="!isGeneratorSectionUnlocked" class="flex justify-center items-center h-64">
          <button @click.prevent="gameStore.manualClick" class="px-10 py-5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105">
            手动编写代码
          </button>
        </div>

        <!-- Main Content Area -->
        <div v-else>
          <!-- Generators Section -->
          <div v-show="activeTab === 'generators'" class="space-y-4">
            <!-- Manual Overclock Button -->
            <button @click.prevent="gameStore.manualClick" class="w-full px-6 py-4 bg-gradient-to-br from-purple-600 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all transform hover:scale-105 active:scale-100 flex items-center justify-center gap-3 text-lg">
              <Icon name="mdi:flash" />
              <span>手动超频 (+5% CPS)</span>
            </button>
            
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
                  <p class="text-base font-bold">Refactor</p>
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
                    Deploy
                    <Icon v-if="!gameStore.isCompileUnlocked" name="mdi:lock" class="ml-1 text-gray-500" />
                  </p>
                  <p v-if="!gameStore.isCompileUnlocked" class="text-xs text-gray-500 mt-1">
                    (需要 {{ prestigeThresholds.COMPILE_UNLOCK_RP }} RP)
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
                <h3 class="text-xl font-bold">Unlock Condition</h3>
                <p class="text-lg">You need to have <span class="font-bold text-green-400">{{ prestigeThresholds.COMPILE_UNLOCK_RP }}</span> Refactor Points (RP) to unlock this feature.</p>
              </div>
            </div>
          </div>

          <!-- Stats Section -->
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
      </div>
    </main>

    <AdBoostButton v-if="isGeneratorSectionUnlocked" />
    <AppFooter v-if="isGeneratorSectionUnlocked" v-model:active-tab="activeTab" context="game" />
  </div>
</template>
