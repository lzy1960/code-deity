<template>
  <footer class="bg-[#0d151c] border-t border-[#21364a]">
    <nav class="flex justify-around items-center px-1 pt-1.5 pb-2">
      <a
        v-for="tab in tabs"
        :key="tab.id"
        @click="handleTabClick(tab)"
        :class="getTabClass(tab)"
        :title="tab.name"
      >
        <Icon :name="`mdi:${tab.icon}`" class="text-xl" />
        <span class="text-[9px] leading-none mt-0.5">{{ tab.name }}</span>
      </a>
    </nav>
  </footer>
</template>

<script setup lang="ts">
import { useGameStore } from '~/store/game';
import { useRouter } from 'vue-router';
import { useToast } from '~/composables/useToast';

const props = defineProps<{
  activeTab: string;
  context: 'game' | 'account';
}>();

const emit = defineEmits(['update:activeTab']);
const router = useRouter();
const gameStore = useGameStore();
const toast = useToast();

interface Tab {
  id: string;
  name: string;
  icon: string;
  isUnlocked: () => boolean;
  isExternal?: boolean;
  path?: string;
}

const tabs: Tab[] = [
  { id: 'generators', name: $t('common.generators'), icon: 'dns', isUnlocked: () => true },
  { id: 'upgrades', name: $t('common.refactor'), icon: 'rocket-launch', isUnlocked: () => gameStore.isRefactorUnlocked },
  { id: 'automation', name: $t('common.automation'), icon: 'robot', isUnlocked: () => gameStore.isAutomationUnlocked },
  { id: 'challenges', name: $t('common.challenges'), icon: 'trophy', isUnlocked: () => gameStore.isChallengesUnlocked },
  { id: 'singularity', name: $t('common.singularity'), icon: 'creation', isUnlocked: () => gameStore.unlockedSingularity },
  { id: 'stats', name: $t('common.stats'), icon: 'chart-bar', isUnlocked: () => true },
];

const isActive = (tabId: string) => props.activeTab === tabId;

const handleTabClick = (tab: Tab) => {
  if (!tab.isUnlocked()) {
    toast.addToast(getTabTitle(tab), 'warning');
    return;
  }

  if (tab.isExternal && tab.path) {
    router.push(tab.path);
  } else {
    emit('update:activeTab', tab.id);
  }
};

const getTabClass = (tab: Tab) => {
  const baseClasses = 'flex flex-1 flex-col items-center justify-center gap-0.5 cursor-pointer px-2 py-1 rounded-lg transition-colors';
  if (!tab.isUnlocked()) {
    return `${baseClasses} text-gray-700 cursor-not-allowed`;
  }
  return `${baseClasses} ${isActive(tab.id) ? 'text-[#3899fa]' : 'text-[#5a7a96] hover:text-[#8eadcc]'}`;
};

const getTabTitle = (tab: Tab): string => {
  if (tab.isUnlocked()) return '';
  switch (tab.id) {
    case 'upgrades': return $t('common.unlockRefactorHint');
    case 'automation': return $t('common.unlockAutomationHint');
    case 'challenges': return $t('common.unlockChallengesHint');
    default: return $t('common.locked');
  }
};
</script>

<style scoped></style>
