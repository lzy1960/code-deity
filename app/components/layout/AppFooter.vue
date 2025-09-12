<template>
  <footer class="sticky bottom-0 bg-[#182635]/80 backdrop-blur-sm border-t border-[#21364a]">
    <div class="flex items-center px-2 overflow-x-auto whitespace-nowrap">
      <nav class="flex justify-around items-center w-full min-w-max pt-2 pb-3">
        <a 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="handleTabClick(tab)" 
          :class="getTabClass(tab)" 
          :title="getTabTitle(tab)"
        >
          <Icon :name="`mdi:${tab.icon}`" class="text-2xl" />
          <p class="text-xs font-medium" :class="{ 'font-bold': isActive(tab.id) }">{{ tab.name }}</p>
        </a>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useGameStore } from '~/store/game';
import { useRouter } from 'vue-router';

const props = defineProps<{
  activeTab: string;
  context: 'game' | 'account';
}>();

const emit = defineEmits(['update:activeTab']);
const router = useRouter();
const gameStore = useGameStore();

interface Tab {
  id: string;
  name: string;
  icon: string;
  isUnlocked: () => boolean;
  isExternal?: boolean;
  path?: string;
}

const tabs: Tab[] = [
  { id: 'generators', name: 'Generators', icon: 'dns', isUnlocked: () => true },
  { id: 'upgrades', name: 'Upgrades', icon: 'rocket-launch', isUnlocked: () => gameStore.isRefactorUnlocked },
  { id: 'stats', name: 'Stats', icon: 'chart-bar', isUnlocked: () => true },
  { id: 'automation', name: 'Automation', icon: 'robot', isUnlocked: () => gameStore.isAutomationUnlocked },
  { id: 'challenges', name: 'Challenges', icon: 'trophy', isUnlocked: () => gameStore.isChallengesUnlocked },
  { id: 'account', name: 'Account', icon: 'account-circle', isUnlocked: () => true, isExternal: true, path: '/account' },
];

const isActive = (tabId: string) => props.activeTab === tabId;

const handleTabClick = (tab: Tab) => {
  if (!tab.isUnlocked()) return;

  if (tab.isExternal && tab.path) {
    router.push(tab.path);
  } else {
    emit('update:activeTab', tab.id);
  }
};

const getTabClass = (tab: Tab) => {
  const baseClasses = 'flex flex-1 flex-col items-center justify-end gap-1 cursor-pointer px-4 py-1';
  if (!tab.isUnlocked()) {
    return `${baseClasses} text-gray-600 cursor-not-allowed`;
  }
  const activeColor = isActive(tab.id) ? 'text-[#3899fa]' : 'text-[#8eadcc] hover:text-white transition-colors';
  return `${baseClasses} ${activeColor}`;
};

const getTabTitle = (tab: Tab): string => {
  if (tab.isUnlocked()) return '';
  switch (tab.id) {
    case 'upgrades': return 'Unlock by purchasing 1 AI Core.';
    case 'automation': return 'Unlock by performing your first Compile & Release.';
    case 'challenges': return 'Unlock after your 2nd Compile & Release.';
    default: return 'Locked';
  }
};
</script>

<style scoped>
/* For Webkit browsers like Chrome, Safari */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #182635;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #3899fa;
  border-radius: 20px;
}
</style>
