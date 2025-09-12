<template>
  <div class="relative flex size-full min-h-screen flex-col text-white dark group/design-root" style='font-family: "Space Grotesk", "Noto Sans", sans-serif;'>
    <div class="flex-grow">
      <AppHeader :currency="gameStore.currency" />

      <!-- System Message for Refactor Unlock -->
      <div v-if="showRefactorSystemMessage" class="bg-yellow-500 text-black text-center p-2 font-bold animate-pulse">
        [系统提示]：你的代码结构过于臃肿，增长已达瓶颈。或许……你需要一次彻底的重构。
      </div>

      <main class="relative p-4 space-y-6 pb-24">
        <!-- Buy Multiplier Selector -->
        <div v-if="gameStore.isMultiplierUnlocked" class="absolute top-4 right-4 z-10 w-48">
          <BuyMultiplierSelector />
        </div>

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
            <h2 class="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">Generators</h2>
            <div class="space-y-3">
              <GeneratorItem
                v-for="generator in unlockedGenerators"
                :key="generator.id"
                :generator-id="generator.id"
                @buy="gameStore.buyGenerator(generator.id)"
              />
            </div>
          </div>

          <!-- Refactor Section -->
          <div v-show="activeTab === 'upgrades'">
            <h2 class="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">Code Refactoring (RP)</h2>
            <RefactorSection :potential-rp-gain="gameStore.refactorGain.toNumber()" :can-refactor="gameStore.canRefactor" :current-rp-bonus="gameStore.rpBonus" @refactor="gameStore.refactor" />
            
            <!-- Compile/Release Section -->
            <div v-if="gameStore.isCompileUnlocked" class="mt-6">
              <h2 class="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">Compile & Release (Version)</h2>
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
    <footer v-if="isGeneratorSectionUnlocked" class="sticky bottom-0 bg-[#191933]/80 backdrop-blur-sm">
      <nav class="flex justify-around border-t border-[#232348] py-2">
        <a @click="activeTab = 'generators'" :class="['flex', 'flex-col', 'items-center', 'justify-end', 'gap-1', 'rounded-full', 'px-4', 'py-1', 'cursor-pointer', activeTab === 'generators' ? 'text-white' : 'text-[#9292c9]']">
          <span class="material-symbols-outlined text-2xl">list</span>
          <p class="text-xs font-medium tracking-[0.015em]">Generators</p>
        </a>
        <a @click="gameStore.isRefactorUnlocked ? activeTab = 'upgrades' : null" :class="getTabClass('upgrades', gameStore.isRefactorUnlocked)" :title="getTabTitle('upgrades', gameStore.isRefactorUnlocked)">
          <span class="material-symbols-outlined text-2xl">{{ gameStore.isRefactorUnlocked ? 'rocket_launch' : 'lock' }}</span>
          <p class="text-xs font-medium tracking-[0.015em]">Upgrades</p>
        </a>
        <a @click="activeTab = 'stats'" :class="getTabClass('stats', true)">
          <span class="material-symbols-outlined text-2xl">bar_chart</span>
          <p class="text-xs font-medium tracking-[0.015em]">Stats</p>
        </a>
        <a @click="gameStore.isAutomationUnlocked ? activeTab = 'automation' : null" :class="getTabClass('automation', gameStore.isAutomationUnlocked)" :title="getTabTitle('automation', gameStore.isAutomationUnlocked)">
          <span class="material-symbols-outlined text-2xl">{{ gameStore.isAutomationUnlocked ? 'smart_toy' : 'lock' }}</span>
          <p class="text-xs font-medium tracking-[0.015em]">Automation</p>
        </a>
        <a @click="gameStore.isChallengesUnlocked ? activeTab = 'challenges' : null" :class="getTabClass('challenges', gameStore.isChallengesUnlocked)" :title="getTabTitle('challenges', gameStore.isChallengesUnlocked)">
          <span class="material-symbols-outlined text-2xl">{{ gameStore.isChallengesUnlocked ? 'emoji_events' : 'lock' }}</span>
          <p class="text-xs font-medium tracking-[0.015em]">Challenges</p>
        </a>
      </nav>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore } from '~/store/game';
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
  const baseClasses = 'flex flex-col items-center justify-end gap-1 px-4 py-1';
  if (!isUnlocked) {
    return `${baseClasses} text-gray-500 cursor-not-allowed`;
  }
  const activeColor = activeTab.value === tabName ? 'text-white' : 'text-[#9292c9]';
  return `${baseClasses} cursor-pointer ${activeColor}`;
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
