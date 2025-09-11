<template>
  <div class="relative flex size-full min-h-screen flex-col text-white dark group/design-root" style='font-family: "Space Grotesk", "Noto Sans", sans-serif;'>
    <div class="flex-grow">
      <AppHeader :currency="gameStore.currency.toNumber()" />

      <!-- System Message for Refactor Unlock -->
      <div v-if="showRefactorSystemMessage" class="bg-yellow-500 text-black text-center p-2 font-bold animate-pulse">
        [系统提示]：你的代码结构过于臃肿，增长已达瓶颈。或许……你需要一次彻底的重构。
      </div>

      <main class="p-4 space-y-6 pb-24">
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
            <RefactorSection :potential-rp-gain="gameStore.refactorGain.toNumber()" :can-refactor="gameStore.canRefactor" @refactor="gameStore.refactor" />
            
            <!-- Placeholder for future upgrade sections like Compile/Release -->
            <div v-if="gameStore.isCompileUnlocked" class="mt-6">
               <h2 class="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">编译发布</h2>
               <p class="text-gray-400">编译发布功能待实现...</p>
            </div>
          </div>

          <!-- Stats Section -->
          <div v-show="activeTab === 'stats'">
            <h2 class="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">统计</h2>
            <p class="text-gray-400">统计功能待实现...</p>
          </div>
          
           <!-- Challenges Section -->
          <div v-show="activeTab === 'challenges'">
            <h2 class="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">挑战</h2>
            <p class="text-gray-400">挑战功能待实现...</p>
          </div>
          
           <!-- Automation Section -->
          <div v-show="activeTab === 'automation'">
            <h2 class="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">自动化</h2>
            <p class="text-gray-400">自动化功能待实现...</p>
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
        <a v-if="gameStore.isRefactorUnlocked" @click="activeTab = 'upgrades'" :class="['flex', 'flex-col', 'items-center', 'justify-end', 'gap-1', 'px-4', 'py-1', 'cursor-pointer', activeTab === 'upgrades' ? 'text-white' : 'text-[#9292c9]']">
          <span class="material-symbols-outlined text-2xl">rocket_launch</span>
          <p class="text-xs font-medium tracking-[0.015em]">Upgrades</p>
        </a>
        <a @click="activeTab = 'stats'" :class="['flex', 'flex-col', 'items-center', 'justify-end', 'gap-1', 'px-4', 'py-1', 'cursor-pointer', activeTab === 'stats' ? 'text-white' : 'text-[#9292c9]']">
          <span class="material-symbols-outlined text-2xl">bar_chart</span>
          <p class="text-xs font-medium tracking-[0.015em]">Stats</p>
        </a>
        <a v-if="gameStore.isAutomationUnlocked" @click="activeTab = 'automation'" :class="['flex', 'flex-col', 'items-center', 'justify-end', 'gap-1', 'px-4', 'py-1', 'cursor-pointer', activeTab === 'automation' ? 'text-white' : 'text-[#9292c9]']">
          <span class="material-symbols-outlined text-2xl">smart_toy</span>
          <p class="text-xs font-medium tracking-[0.015em]">Automation</p>
        </a>
        <a v-if="gameStore.isChallengesUnlocked" @click="activeTab = 'challenges'" :class="['flex', 'flex-col', 'items-center', 'justify-end', 'gap-1', 'px-4', 'py-1', 'cursor-pointer', activeTab === 'challenges' ? 'text-white' : 'text-[#9292c9]']">
          <span class="material-symbols-outlined text-2xl">emoji_events</span>
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


</script>
