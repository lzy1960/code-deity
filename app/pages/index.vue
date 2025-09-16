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
import SingularityStats from '~/components/game/SingularityStats.vue';
import SingularitySection from '~/components/game/SingularitySection.vue';
import BuyMultiplierSelector from '~/components/game/BuyMultiplierSelector.vue';
import AdBoostButton from '~/components/game/AdBoostButton.vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const gameStore = useGameStore();

const activeTab = ref('generators');
const upgradesSubTab = ref('refactor');
const showRefactorSystemMessage = ref(false);
const hasShownRefactorMessage = ref(false);
const showOverloadSystemMessage = ref(false);
const hasShownOverloadMessage = ref(false);

const handleSingularityReset = () => {
  gameStore.performSingularityReset();
  activeTab.value = 'singularity';
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
    showRefactorSystemMessage.value = true;
    hasShownRefactorMessage.value = true;
    activeTab.value = 'upgrades';
    setTimeout(() => {
      showRefactorSystemMessage.value = false;
    }, 5000);
  }
});

watch(() => gameStore.generators.find(g => g.id === 8)!.bought, (aiCores) => {
  if (aiCores > prestigeThresholds.ARCHITECTURAL_OVERHEAD_AI_CORES && !hasShownOverloadMessage.value) {
    showOverloadSystemMessage.value = true;
    hasShownOverloadMessage.value = true;
    setTimeout(() => {
      showOverloadSystemMessage.value = false;
    }, 8000);
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
  <div class="relative flex size-full min-h-screen flex-col bg-[#101a23] text-white dark group/design-root" style='font-family: "Space Grotesk", "Noto Sans", sans-serif; padding-top: env(safe-area-inset-top);'>
    <div class="flex-grow flex flex-col">
      <AppHeader :title="headerTitle">
        <template #actions>
          <BuyMultiplierSelector v-if="activeTab === 'generators' && gameStore.isMultiplierUnlocked" />
        </template>
      </AppHeader>

      <!-- System Messages -->
      <div v-if="showRefactorSystemMessage" class="bg-yellow-500 text-black text-center p-2 font-bold animate-pulse">
        [系统提示]：你的代码结构过于臃肿，增长已达瓶颈。或许……你需要一次彻底的重构。
      </div>
      <div v-if="showOverloadSystemMessage" class="bg-red-500 text-white text-center p-2 font-bold animate-pulse">
                [系统警告]：架构过载！您的 'AI 核心' 数量已超过最佳阈值 ({{ prestigeThresholds.ARCHITECTURAL_OVERHEAD_AI_CORES }})。复杂的单体结构导致了效率衰减，所有算力产出都将受到指数级惩罚。建议立即进行 [代码重构] 以优化架构。
      </div>

      <!-- Singularity Call to Action -->
      <div v-if="gameStore.canSingularity" class="p-4">
        <div class="bg-purple-900 border-2 border-purple-500 rounded-lg text-center p-4 animate-pulse">
          <h2 class="text-2xl font-bold text-yellow-300 mb-2">技术奇点已达到！</h2>
          <p class="mb-4">你已经走到了当前纪元的尽头。超越这个极限，进入新的演化阶段，解锁全新的力量！</p>
          <button @click="handleSingularityReset" class="px-6 py-3 bg-yellow-400 text-purple-900 font-bold rounded-lg shadow-lg hover:bg-yellow-500 transition-all transform hover:scale-105">
            化身创世
          </button>
        </div>
      </div>

      <main class="flex-grow overflow-y-auto p-4 space-y-4 pb-24">
        <!-- Manual Code Button -->
        <div v-if="!isGeneratorSectionUnlocked" class="flex justify-center items-center h-64">
          <button @click.prevent="gameStore.manualClick" class="px-10 py-5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105">
            手动编写代码
          </button>
        </div>

        <!-- Main Content Area -->
        <div v-else>
          <!-- Generators Section -->
          <div v-show="activeTab === 'generators'">
            <div class="space-y-3">
              <GeneratorItem
                v-for="generator in unlockedGenerators"
                :key="generator.id"
                :generator-id="generator.id"
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
                  :title="!gameStore.isCompileUnlocked ? `Requires ${prestigeThresholds.COMPILE_UNLOCK_RP} RP to unlock` : ''"
                >
                  <p class="text-base font-bold flex items-center">
                    Deploy
                    <Icon v-if="!gameStore.isCompileUnlocked" name="mdi:lock" class="ml-1 text-gray-500" />
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
            <SingularityStats />
            <SingularitySection />
          </div>
        </div>
      </main>
    </div>

    <AdBoostButton v-if="isGeneratorSectionUnlocked" />
    <AppFooter v-if="isGeneratorSectionUnlocked" v-model:active-tab="activeTab" context="game" />
  </div>
</template>