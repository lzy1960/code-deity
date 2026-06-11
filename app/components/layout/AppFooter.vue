<template>
  <footer class="app-footer">
    <nav class="tab-shell">
      <TransitionGroup name="tab-appear" tag="div" class="tab-list">
        <a
          v-for="tab in unlockedTabs"
          :key="tab.id"
          @click="handleTabClick(tab)"
          :class="getTabClass(tab)"
          :title="tab.name"
        >
          <Icon :name="`mdi:${tab.icon}`" />
          <span>{{ tab.name }}</span>
        </a>
      </TransitionGroup>
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
const { t, locale } = useI18n();

interface Tab {
  id: string;
  name: string;
  icon: string;
  isUnlocked: () => boolean;
  isExternal?: boolean;
  path?: string;
}

const tabs = computed<Tab[]>(() => {
  locale.value
  return [
    { id: 'generators', name: t('common.generators'), icon: 'dns', isUnlocked: () => true },
    { id: 'upgrades', name: t('common.progression'), icon: 'rocket-launch', isUnlocked: () => gameStore.isRefactorUnlocked },
    { id: 'automation', name: t('common.automation'), icon: 'robot', isUnlocked: () => gameStore.isAutomationUnlocked },
    { id: 'challenges', name: t('common.challenges'), icon: 'trophy', isUnlocked: () => gameStore.isChallengesUnlocked },
    { id: 'singularity', name: t('common.singularity'), icon: 'creation', isUnlocked: () => gameStore.unlockedSingularity },
    { id: 'stats', name: t('common.stats'), icon: 'chart-bar', isUnlocked: () => true },
  ];
})

const unlockedTabs = computed(() => tabs.value.filter(tab => tab.isUnlocked()))

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
  const baseClasses = 'tab-item';
  if (!tab.isUnlocked()) {
    return `${baseClasses} locked`;
  }
  return `${baseClasses} ${isActive(tab.id) ? 'active' : ''}`;
};

const getTabTitle = (tab: Tab): string => {
  if (tab.isUnlocked()) return '';
  switch (tab.id) {
    case 'upgrades': return t('common.unlockRefactorHint');
    case 'automation': return t('common.unlockAutomationHint');
    case 'challenges': return t('common.unlockChallengesHint');
    default: return t('common.locked');
  }
};
</script>

<style scoped>
.tab-appear-enter-active { transition: all 0.22s ease; }
.tab-appear-enter-from   { opacity: 0; transform: translateY(8px); }

.app-footer {
  border-top: 1px solid rgba(76, 165, 255, 0.22);
  background:
    linear-gradient(180deg, rgba(12, 23, 34, 0.96), rgba(8, 15, 24, 0.98)),
    radial-gradient(circle at 50% 0%, rgba(76, 165, 255, 0.1), transparent 54%);
  box-shadow: 0 -12px 34px rgba(0, 0, 0, 0.28);
}

.tab-shell {
  padding: 6px 8px 8px;
}

.tab-list {
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  gap: 5px;
  width: 100%;
}

.tab-item {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 44px;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #8ba2b7;
  transition: border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.tab-item:hover {
  border-color: rgba(76, 165, 255, 0.18);
  background: rgba(76, 165, 255, 0.08);
  color: #cfe3f5;
}

.tab-item.active {
  border-color: rgba(76, 165, 255, 0.42);
  background:
    linear-gradient(180deg, rgba(76, 165, 255, 0.2), rgba(28, 112, 190, 0.16)),
    rgba(16, 26, 35, 0.72);
  color: #f8fbff;
  box-shadow: inset 0 0 18px rgba(76, 165, 255, 0.08);
}

.tab-item.active::before {
  content: '';
  position: absolute;
  top: 4px;
  width: 18px;
  height: 2px;
  border-radius: 999px;
  background: #9af7bd;
  box-shadow: 0 0 8px rgba(154, 247, 189, 0.5);
}

.tab-item.locked {
  cursor: not-allowed;
  color: #425568;
}

.tab-item .iconify {
  font-size: 1.12rem;
}

.tab-item span {
  overflow: hidden;
  max-width: 100%;
  font-size: 0.58rem;
  font-weight: 800;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
