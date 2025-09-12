<template>
  <div class="relative flex size-full min-h-screen flex-col bg-[#101a23] text-white dark group/design-root" style='font-family: "Space Grotesk", "Noto Sans", sans-serif;'>
    <div class="flex-grow flex flex-col">
      <AppHeader :title="headerTitle">
        <template #actions>
          <BuyMultiplierSelector v-if="activeTab === 'generators' && gameStore.isMultiplierUnlocked" />
        </template>
      </AppHeader>

      <!-- System Message for Refactor Unlock -->
      <div v-if="showRefactorSystemMessage" class="bg-yellow-500 text-black text-center p-2 font-bold animate-pulse">
        [系统提示]：你的代码结构过于臃肿，增长已达瓶颈。或许……你需要一次彻底的重构。
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
                @buy="gameStore.buyGenerator(generator.id)"
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
                <a v-if="gameStore.isCompileUnlocked" @click="upgradesSubTab = 'deploy'" class="flex flex-col items-center justify-center py-3 px-4 w-1/2 text-center cursor-pointer" :class="upgradesSubTab === 'deploy' ? 'border-b-2 border-b-[#3899fa] text-white' : 'border-b-2 border-b-transparent text-gray-500 hover:text-white transition-colors'">
                  <p class="text-base font-bold">Deploy</p>
                </a>
              </div>
            </div>

            <div v-show="upgradesSubTab === 'refactor'">
              <RefactorSection :potential-rp-gain="gameStore.refactorGain.toNumber()" :can-refactor="gameStore.canRefactor" :current-rp-bonus="gameStore.rpBonus" @refactor="gameStore.refactor" />
            </div>
            
            <div v-if="gameStore.isCompileUnlocked" v-show="upgradesSubTab === 'deploy'">
              <CompileSection :version="gameStore.version" @compile-and-release="gameStore.compileAndRelease" />
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
        </div>
      </main>
    </div>

    <AppFooter v-if="isGeneratorSectionUnlocked" v-model:active-tab="activeTab" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore } from '~/store/game';
import AppHeader from '~/components/layout/AppHeader.vue';
import AppFooter from '~/components/layout/AppFooter.vue';
import GeneratorItem from '~/components/game/GeneratorItem.vue';
import RefactorSection from '~/components/game/RefactorSection.vue';
import CompileSection from '~/components/game/CompileSection.vue';
import AutomationSection from '~/components/game/AutomationSection.vue';
import ChallengesSection from '~/components/game/ChallengesSection.vue';
import StatsSection from '~/components/game/StatsSection.vue';
import BuyMultiplierSelector from '~/components/game/BuyMultiplierSelector.vue';

const gameStore = useGameStore();

const activeTab = ref('generators');
const upgradesSubTab = ref('refactor');
const showRefactorSystemMessage = ref(false);
const hasShownRefactorMessage = ref(false);

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

watch(() => gameStore.isMultiplierUnlocked, (isUnlocked) => {
  gameStore.setBuyMultiplier('x1')
})

watch(() => gameStore.refactorCount, (newCount, oldCount) => {
  if (newCount > oldCount) {
    activeTab.value = 'generators';
  }
});
</script>
