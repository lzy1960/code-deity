<template>
  <div class="relative flex size-full min-h-screen flex-col bg-[#101a23] text-white dark group/design-root" style='font-family: "Space Grotesk", "Noto Sans", sans-serif;'>
    <div class="flex-grow">
      <!-- Conditional Header -->
      <header v-if="activeTab === 'generators' && isGeneratorSectionUnlocked" class="sticky top-0 z-10 bg-[#101a23]/80 backdrop-blur-sm">
        <div class="flex items-center p-4 pb-2 justify-between">
          <div class="w-12"></div>
          <h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Generators</h2>
          <div class="flex w-12 items-center justify-end">
            <!-- Settings button can be added later if needed -->
          </div>
        </div>
        <div class="flex flex-col gap-2 bg-[#101a23] px-4 py-3 border-b border-[#21364a]">
          <div class="flex justify-between items-start">
            <div>
              <p class="text-white text-2xl font-bold leading-tight tracking-tighter">{{ formatNumber(gameStore.currency) }} <span class="text-[#8eadcc] text-lg">CP</span></p>
              <p class="text-green-400 text-sm font-medium leading-normal">+ {{ formatNumber(gameStore.cps) }} CP/s</p>
            </div>
            <BuyMultiplierSelector v-if="gameStore.isMultiplierUnlocked" />
          </div>
        </div>
      </header>
      <AppHeader v-else :currency="gameStore.currency" />

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

    <!-- Dynamic Footer/Navbar -->
    <footer v-if="isGeneratorSectionUnlocked" class="sticky bottom-0 bg-[#182635]/80 backdrop-blur-sm border-t border-[#21364a]">
      <nav class="flex justify-around items-center px-4 pt-2 pb-3">
        <a @click="activeTab = 'generators'" :class="['flex', 'flex-1', 'flex-col', 'items-center', 'justify-end', 'gap-1', 'cursor-pointer', activeTab === 'generators' ? 'text-[#3899fa]' : 'text-[#8eadcc] hover:text-white transition-colors']">
          <span class="material-symbols-outlined"> dns </span>
          <p class="text-xs font-bold">Generators</p>
        </a>
        <a @click="gameStore.isRefactorUnlocked ? activeTab = 'upgrades' : null" :class="getTabClass('upgrades', gameStore.isRefactorUnlocked)" :title="getTabTitle('upgrades', gameStore.isRefactorUnlocked)">
          <span class="material-symbols-outlined">{{ gameStore.isRefactorUnlocked ? 'upgrade' : 'lock' }}</span>
          <p class="text-xs font-medium">Upgrades</p>
        </a>
        <a @click="activeTab = 'stats'" :class="getTabClass('stats', true)">
          <span class="material-symbols-outlined">bar_chart</span>
          <p class="text-xs font-medium">Stats</p>
        </a>
        <a @click="gameStore.isAutomationUnlocked ? activeTab = 'automation' : null" :class="getTabClass('automation', gameStore.isAutomationUnlocked)" :title="getTabTitle('automation', gameStore.isAutomationUnlocked)">
          <span class="material-symbols-outlined">{{ gameStore.isAutomationUnlocked ? 'smart_toy' : 'lock' }}</span>
          <p class="text-xs font-medium">Automation</p>
        </a>
        <a @click="gameStore.isChallengesUnlocked ? activeTab = 'challenges' : null" :class="getTabClass('challenges', gameStore.isChallengesUnlocked)" :title="getTabTitle('challenges', gameStore.isChallengesUnlocked)">
          <span class="material-symbols-outlined">{{ gameStore.isChallengesUnlocked ? 'emoji_events' : 'lock' }}</span>
          <p class="text-xs font-medium">Challenges</p>
        </a>
      </nav>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore } from '~/store/game';
import { formatNumber } from '~/utils/format';
import AppHeader from '~/components/layout/AppHeader.vue';
import GeneratorItem from '~/components/game/GeneratorItem.vue';
import RefactorSection from '~/components/game/RefactorSection.vue';
import CompileSection from '~/components/game/CompileSection.vue';
import BuyMultiplierSelector from '~/components/game/BuyMultiplierSelector.vue';
import AutomationSection from '~/components/game/AutomationSection.vue';
import ChallengesSection from '~/components/game/ChallengesSection.vue';
import StatsSection from '~/components/game/StatsSection.vue';

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

const getTabClass = (tabName: string, isUnlocked: boolean) => {
  const baseClasses = 'flex flex-1 flex-col items-center justify-end gap-1 cursor-pointer';
  if (!isUnlocked) {
    return `${baseClasses} text-gray-500 cursor-not-allowed`;
  }
  const activeColor = activeTab.value === tabName ? 'text-[#3899fa]' : 'text-[#8eadcc] hover:text-white transition-colors';
  return `${baseClasses} ${activeColor}`;
};

const getTabTitle = (tabName: string, isUnlocked: boolean): string => {
  if (isUnlocked) return '';
  switch (tabName) {
    case 'upgrades': return 'Unlock by purchasing 1 AI Core.';
    case 'automation': return 'Unlock by performing your first Compile & Release.';
    case 'challenges': return 'Unlock after your 2nd Compile & Release.';
    default: return 'Locked';
  }
};
</script>
