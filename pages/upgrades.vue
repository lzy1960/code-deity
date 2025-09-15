<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '~/store/game'
import { formatNumber } from '~/utils/format'

// Import tab components
import RefactorSection from '~/components/game/RefactorSection.vue'
import CompileSection from '~/components/game/CompileSection.vue'
import ChallengesSection from '~/components/game/ChallengesSection.vue'

const gameStore = useGameStore()

// Define tabs
const tabs = {
  Refactor: RefactorSection,
  Deploy: CompileSection,
  Challenges: ChallengesSection,
}

const activeTab = ref(Object.keys(tabs)[0])

const currentTabComponent = computed(() => tabs[activeTab.value as keyof typeof tabs])

</script>

<template>
  <div class="p-4 md:p-6 max-w-4xl mx-auto text-white font-sans">
    <!-- Header -->
    <div class="text-center mb-8">
      <p class="text-lg text-gray-400/90">Computing Power (CP)</p>
      <h1 class="text-5xl lg:text-6xl font-bold tracking-tighter text-shadow-lg shadow-cyan-500/20">
        {{ formatNumber(gameStore.currency) }}
      </h1>
      <p v-if="gameStore.cps.gt(0)" class="text-green-400 font-mono mt-1">+{{ formatNumber(gameStore.cps) }}/s</p>
    </div>

    <!-- Tab Navigation -->
    <div class="flex justify-center border-b border-white/10 mb-6 md:mb-8">
      <button
        v-for="(_, tabName) in tabs"
        :key="tabName"
        @click="activeTab = tabName"
        :class="[
          'px-4 md:px-6 py-3 font-semibold text-base md:text-lg transition-colors duration-200 outline-none',
          activeTab === tabName
            ? 'text-white border-b-2 border-blue-500'
            : 'text-gray-400 hover:text-white/80'
        ]"
      >
        {{ tabName }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="min-h-[300px]">
      <KeepAlive>
        <component :is="currentTabComponent" />
      </KeepAlive>
    </div>

    <!-- Footer Navigation -->
    <div class="h-20"></div> <!-- Spacer for bottom nav -->
    <nav class="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-white/10 flex justify-around items-center p-2">
      <NuxtLink to="/" class="flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors p-2 rounded-lg w-24">
        <Icon name="ph:code-bold" class="text-2xl" />
        <span class="text-xs mt-1">Generators</span>
      </NuxtLink>
      <NuxtLink to="/upgrades" class="flex flex-col items-center justify-center text-white transition-colors p-2 rounded-lg w-24 bg-blue-500/20">
        <Icon name="ph:rocket-launch-bold" class="text-2xl" />
        <span class="text-xs mt-1">Upgrades</span>
      </NuxtLink>
      <NuxtLink to="/settings" class="flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors p-2 rounded-lg w-24">
        <Icon name="ph:gear-six-bold" class="text-2xl" />
        <span class="text-xs mt-1">Settings</span>
      </NuxtLink>
    </nav>
  </div>
</template>

<style scoped>
.text-shadow-lg {
  text-shadow: 0 0 15px var(--tw-shadow-color);
}
</style>
