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
import CodeScene from '~/components/game/CodeScene.vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useSingularityModal } from '~/composables/useSingularityModal';
import { useToast } from '~/composables/useToast';
import { formatNumber } from '~/utils/format';

const gameStore = useGameStore();
const singularityModal = useSingularityModal();
const toast = useToast();

const activeTab = ref('generators');
const upgradesSubTab = ref('refactor');
const hasShownRefactorMessage = ref(false);
const hasShownOverloadMessage = ref(false);

// Floating numbers state
const floatingNumbers = ref<{ id: number; amount: string; left: string; top: string }[]>([]);
let floatingNumberId = 0;

const handleManualClick = (event?: MouseEvent) => {
  const clickPower = gameStore.manualClickPower;
  gameStore.manualClick();

  const newId = floatingNumberId++;
  const leftPct = event
    ? `${Math.min(80, Math.max(10, (event.clientX / window.innerWidth) * 100))}%`
    : `${Math.random() * 50 + 20}%`;
  const topPct = event
    ? `${Math.min(75, Math.max(5, (event.clientY / window.innerHeight) * 85))}%`
    : '30%';
  floatingNumbers.value.push({
    id: newId,
    amount: `+${formatNumber(clickPower)}`,
    left: leftPct,
    top: topPct,
  });

  setTimeout(() => {
    floatingNumbers.value = floatingNumbers.value.filter(n => n.id !== newId);
  }, 1500);
};

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

const tabTitleMap: Record<string, string> = {
  generators: $t('common.generators'),
  upgrades:   $t('common.refactor'),
  challenges: $t('common.challenges'),
  automation: $t('common.automation'),
  singularity: $t('common.singularity'),
  stats:      $t('common.stats'),
};

const headerTitle = computed(() => {
  if (!isGeneratorSectionUnlocked.value) return $t('index.gameTitle');
  return tabTitleMap[activeTab.value] ?? activeTab.value;
});

const buyGenerator = (id: number) => {
  gameStore.buyGenerator(id);
};

const desktopNavItems = computed(() => [
  { id: 'generators', label: $t('common.generators'), short: 'GEN', icon: 'mdi:memory', unlocked: true },
  { id: 'upgrades',   label: $t('common.refactor'),   short: 'RP',  icon: 'mdi:rocket-launch', unlocked: gameStore.isRefactorUnlocked },
  { id: 'challenges', label: $t('common.challenges'), short: 'CH',  icon: 'mdi:trophy-variant', unlocked: gameStore.isChallengesUnlocked },
  { id: 'automation', label: $t('common.automation'), short: 'AUTO',icon: 'mdi:robot', unlocked: gameStore.isAutomationUnlocked },
  { id: 'singularity',label: $t('common.singularity'),short: 'SP',  icon: 'mdi:creation', unlocked: gameStore.unlockedSingularity },
  { id: 'stats',      label: $t('common.stats'),      short: 'STAT',icon: 'mdi:chart-bar', unlocked: true },
]);

const getDesktopNavUnlockHint = (item: { id: string; unlocked: boolean }): string => {
  if (item.unlocked) return '';
  switch (item.id) {
    case 'upgrades': return $t('common.unlockRefactorHint');
    case 'automation': return $t('common.unlockAutomationHint');
    case 'challenges': return $t('common.unlockChallengesHint');
    default: return $t('common.notUnlocked');
  }
};

const handleDesktopNavClick = (item: { id: string; unlocked: boolean }) => {
  if (item.unlocked) {
    activeTab.value = item.id;
  } else {
    toast.addToast(getDesktopNavUnlockHint(item), 'warning');
  }
};

watch(() => gameStore.isRefactorUnlocked, (isUnlocked) => {
  if (isUnlocked && !hasShownRefactorMessage.value) {
    toast.addToast($t('toast.refactorSuggestion'), 'warning', 5000);
    hasShownRefactorMessage.value = true;
    activeTab.value = 'upgrades';
  }
});

watch(() => gameStore.generators.find(g => g.id === 8)!.bought, (aiCores) => {
  if (aiCores > prestigeThresholds.ARCHITECTURAL_OVERHEAD_AI_CORES && !hasShownOverloadMessage.value) {
    toast.addToast($t('toast.architecturalOverload'), 'error', 8000);
    hasShownOverloadMessage.value = true;
  }
});

watch(() => gameStore.isMultiplierUnlocked, () => {
  gameStore.setBuyMultiplier('x1');
});

watch(() => gameStore.refactorCount, (newCount, oldCount) => {
  if (newCount > oldCount) {
    activeTab.value = 'generators';
    hasShownOverloadMessage.value = false;
  }
});

watch(() => unlockedGenerators.value.length, (newLength, oldLength) => {
  if (newLength > oldLength && oldLength > 0) {
    Haptics.impact({ style: ImpactStyle.Light });
  }
});

watch(() => gameStore.isCompileUnlocked, (isUnlocked, wasUnlocked) => {
  if (isUnlocked && !wasUnlocked) {
    Haptics.impact({ style: ImpactStyle.Medium });
  }
});

const codeRushButtonText = computed(() => {
  if (gameStore.isCodeRushActive) {
    return `${$t('common.codeRushActive')} (${$t('common.codeRushActiveMultiplier')})`;
  } else if (gameStore.isCodeRushReady) {
    return $t('common.activateCodeRush');
  } else {
    return `${$t('common.manualOverclock')} (${$t('common.manualOverclockCpsPercentage')})`;
  }
});

const codeRushFillWidth = computed(() => `${gameStore.codeRushProgress}%`);

const isCodeRushChargedAndReady = computed(() =>
  gameStore.codeRushProgress >= 100 && !gameStore.isCodeRushActive
);
</script>

<template>
  <div
    class="flex h-dvh flex-col bg-[#101a23] text-white"
    style='font-family: "Space Grotesk", "Noto Sans", sans-serif; padding-top: env(safe-area-inset-top);'
  >
    <!-- ── Header ─────────────────────────────────────── -->
    <div class="relative shrink-0 sticky top-0 z-30">
      <AppHeader
        :title="headerTitle"
        :can-singularity="gameStore.canSingularity"
        @singularity-click="handleSingularityReset"
      />
    </div>

    <!-- ══════════════════════════════════════════════════
         MOBILE LAYOUT  (hidden on lg+)
         CodeScene fills screen, bottom sheet overlays it
    ═══════════════════════════════════════════════════ -->
    <div class="lg:hidden flex-1 relative overflow-hidden min-h-0">

      <!-- Floating click numbers -->
      <div class="floating-numbers-container pointer-events-none">
        <span
          v-for="num in floatingNumbers"
          :key="num.id"
          class="floating-number"
          :style="{ left: num.left, top: num.top }"
        >{{ num.amount }}</span>
      </div>

      <!-- CodeScene — fills the entire game area -->
      <CodeScene
        class="absolute inset-0"
        @manual-click="handleManualClick"
      />

      <!-- Pre-unlock hint text (before generators) -->
      <div
        v-if="!isGeneratorSectionUnlocked"
        class="absolute bottom-8 inset-x-0 text-center pointer-events-none z-10"
      >
        <p class="text-gray-500 text-xs">
          {{ $t('common.manualCode') }} — {{ $t('common.clickSceneToCode') }}
        </p>
      </div>

      <!-- ── Bottom Sheet (once generators are unlocked) ── -->
      <div
        v-if="isGeneratorSectionUnlocked"
        class="bottom-sheet absolute bottom-0 inset-x-0 z-20 flex flex-col"
      >
        <!-- Handle -->
        <div class="flex justify-center py-1.5 shrink-0">
          <div class="w-8 h-0.5 rounded-full bg-gray-600 opacity-40" />
        </div>

        <!-- Code Rush + 倍率选择器（合并为一行，generators tab only） -->
        <div v-if="activeTab === 'generators'" class="px-3 pb-1.5 shrink-0 flex items-center gap-2">
          <div
            class="code-rush-animated-border-wrapper relative rounded-lg overflow-hidden flex-1"
            :class="{ 'code-rush-active-shadow': gameStore.isCodeRushActive }"
          >
            <button
              @click.prevent="gameStore.isCodeRushReady ? gameStore.activateCodeRush() : handleManualClick()"
              class="code-rush-button relative w-full px-3 py-1.5 text-white font-bold rounded-lg overflow-hidden"
              :class="{ 'code-rush-charged-ready': isCodeRushChargedAndReady }"
            >
              <div
                v-if="!gameStore.isCodeRushActive"
                class="code-rush-fill absolute inset-0 transition-all duration-500 ease-out"
                :class="isCodeRushChargedAndReady ? 'bg-gradient-to-r from-purple-600 to-purple-500' : 'bg-gradient-to-r from-purple-600 to-blue-500'"
                :style="{ width: codeRushFillWidth }"
              />
              <div
                v-else
                class="code-rush-fill code-rush-active-zebra absolute inset-0"
                :style="{ width: codeRushFillWidth }"
              />
              <div class="relative z-10 flex items-center justify-center gap-1.5 text-xs">
                <Icon name="mdi:flash" class="text-xs" />
                <Transition name="fade" mode="out-in">
                  <span :key="codeRushButtonText">{{ codeRushButtonText }}</span>
                </Transition>
              </div>
            </button>
          </div>
          <BuyMultiplierSelector v-if="gameStore.isMultiplierUnlocked" />
        </div>

        <!-- Tab navigation -->
        <div class="shrink-0">
          <AppFooter v-model:active-tab="activeTab" context="game" />
        </div>

        <!-- Scrollable tab content -->
        <div class="flex-1 overflow-y-auto min-h-0 px-3 pb-4">
          <!-- Generators -->
          <div v-show="activeTab === 'generators'" class="space-y-2 pt-2">
            <GeneratorItem
              v-for="generator in unlockedGenerators"
              :key="generator.id"
              :generator-id="generator.id"
              @buy="buyGenerator(generator.id)"
            />
          </div>

          <!-- Upgrades -->
          <div v-show="activeTab === 'upgrades'">
            <div class="border-b border-gray-700 mb-3">
              <div class="flex">
                <a
                  @click="upgradesSubTab = 'refactor'"
                  class="flex flex-col items-center justify-center py-2 px-4 w-1/2 text-center cursor-pointer text-sm font-bold"
                  :class="upgradesSubTab === 'refactor'
                    ? 'border-b-2 border-[#3899fa] text-white'
                    : 'border-b-2 border-transparent text-gray-500'"
                >{{ $t('common.refactor') }}</a>
                <a
                  v-if="gameStore.isRefactorUnlocked"
                  @click="gameStore.isCompileUnlocked ? upgradesSubTab = 'deploy' : null"
                  class="flex flex-col items-center justify-center py-2 px-4 w-1/2 text-center text-sm font-bold"
                  :class="{
                    'cursor-pointer': gameStore.isCompileUnlocked,
                    'cursor-not-allowed': !gameStore.isCompileUnlocked,
                    'border-b-2 border-[#3899fa] text-white': upgradesSubTab === 'deploy',
                    'border-b-2 border-transparent text-gray-500': upgradesSubTab !== 'deploy',
                  }"
                >
                  <span class="flex items-center gap-1">
                    {{ $t('common.deploy') }}
                    <Icon v-if="!gameStore.isCompileUnlocked" name="mdi:lock" class="text-gray-500 text-xs" />
                  </span>
                </a>
              </div>
            </div>
            <div v-show="upgradesSubTab === 'refactor'">
              <RefactorSection
                :potential-rp-gain="gameStore.refactorGain"
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
              <div v-else class="text-center text-gray-400 py-6">
                <Icon name="mdi:lock-outline" class="text-4xl mb-3" />
                <h3 class="text-sm font-bold mb-1">{{ $t('common.unlockCondition') }}</h3>
                <p class="text-xs">
                  {{ $t('common.youNeedToHave') }}
                  <span class="font-bold text-green-400">{{ prestigeThresholds.COMPILE_UNLOCK_RP }}</span>
                  {{ $t('common.refactorPoints') }} {{ $t('common.unlockThisFeature') }}.
                </p>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div v-show="activeTab === 'stats'" class="pt-2">
            <StatsSection />
          </div>

          <!-- Challenges -->
          <div v-show="activeTab === 'challenges'" class="pt-2">
            <ChallengesSection />
          </div>

          <!-- Automation -->
          <div v-show="activeTab === 'automation'" class="pt-2">
            <AutomationSection />
          </div>

          <!-- Singularity: v-if so VueFlow can measure node dimensions on mount -->
          <div v-if="activeTab === 'singularity'" class="pt-2">
            <SingularitySection />
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════
         DESKTOP LAYOUT  (hidden on mobile, shown on lg+)
         Left: CodeScene (full height) │ Right: tab nav + content
    ═══════════════════════════════════════════════════ -->
    <div class="hidden lg:flex flex-1 overflow-hidden min-h-0">

      <!-- ── Left: CodeScene panel (full height) ─────── -->
      <div class="relative shrink-0 w-[360px] xl:w-[420px] p-3 flex flex-col">
        <!-- Floating click numbers -->
        <div class="floating-numbers-container pointer-events-none">
          <span
            v-for="num in floatingNumbers"
            :key="num.id"
            class="floating-number"
            :style="{ left: num.left, top: num.top }"
          >{{ num.amount }}</span>
        </div>
        <!-- Scene fills all available height -->
        <CodeScene
          class="rounded-xl overflow-hidden flex-1"
          @manual-click="handleManualClick"
        />
        <p v-if="!isGeneratorSectionUnlocked" class="text-center text-gray-500 text-xs mt-2">
          {{ $t('common.manualCode') }} — {{ $t('common.clickSceneToCode') }}
        </p>
      </div>

      <!-- ── Right: tab nav + scrollable content ──────── -->
      <div class="flex-1 flex flex-col overflow-hidden border-l border-gray-800/50">

        <!-- Horizontal tab navigation bar -->
        <nav class="shrink-0 flex items-end gap-0.5 px-4 pt-3 bg-[#0a1520] border-b border-gray-800/60 overflow-x-auto">
          <a
            v-for="item in desktopNavItems"
            :key="item.id"
            @click="handleDesktopNavClick(item)"
            class="relative flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap shrink-0 transition-colors"
            :class="[
              activeTab === item.id
                ? 'bg-[#101a23] text-[#3899fa] border border-b-0 border-gray-700/80'
                : item.unlocked
                  ? 'text-gray-400 hover:text-white hover:bg-white/5'
                  : 'text-gray-600 cursor-not-allowed',
            ]"
          >
            <Icon :name="item.icon" class="text-base" />
            <span>{{ item.label }}</span>
            <Icon v-if="!item.unlocked" name="mdi:lock-outline" class="text-xs opacity-60" />
          </a>
        </nav>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto p-5">
          <div :class="{ 'mx-auto max-w-2xl': activeTab !== 'singularity' }" class="space-y-4 pb-6">

            <!-- Code Rush + multiplier row (generators tab) -->
            <div v-if="activeTab === 'generators' && isGeneratorSectionUnlocked" class="flex items-center gap-2">
              <div
                class="code-rush-animated-border-wrapper relative rounded-lg overflow-hidden flex-1"
                :class="{ 'code-rush-active-shadow': gameStore.isCodeRushActive }"
              >
                <button
                  @click.prevent="gameStore.isCodeRushReady ? gameStore.activateCodeRush() : handleManualClick()"
                  class="code-rush-button relative w-full px-4 py-2 text-white font-bold rounded-lg overflow-hidden"
                  :class="{ 'code-rush-charged-ready': isCodeRushChargedAndReady }"
                >
                  <div v-if="!gameStore.isCodeRushActive"
                    class="code-rush-fill absolute inset-0 transition-all duration-500 ease-out"
                    :class="isCodeRushChargedAndReady ? 'bg-gradient-to-r from-purple-600 to-purple-500' : 'bg-gradient-to-r from-purple-600 to-blue-500'"
                    :style="{ width: codeRushFillWidth }"
                  />
                  <div v-else class="code-rush-fill code-rush-active-zebra absolute inset-0" :style="{ width: codeRushFillWidth }" />
                  <div class="relative z-10 flex items-center justify-center gap-2 text-xs">
                    <Icon name="mdi:flash" class="text-sm" />
                    <Transition name="fade" mode="out-in">
                      <span :key="codeRushButtonText">{{ codeRushButtonText }}</span>
                    </Transition>
                  </div>
                </button>
              </div>
              <BuyMultiplierSelector v-if="gameStore.isMultiplierUnlocked" />
            </div>

            <div v-if="activeTab === 'generators'" class="space-y-3">
              <GeneratorItem
                v-for="generator in unlockedGenerators"
                :key="generator.id"
                :generator-id="generator.id"
                @buy="buyGenerator(generator.id)"
              />
            </div>

            <div v-if="activeTab === 'upgrades'">
              <RefactorSection
                :potential-rp-gain="gameStore.refactorGain"
                :can-refactor="gameStore.canRefactor"
                :current-rp-bonus="gameStore.rpBonus"
                :unlock-requirement="prestigeThresholds.REFACTOR_UNLOCK_AI_CORES"
                @refactor="gameStore.refactor"
              />
              <div class="my-6 border-t border-gray-700" />
              <CompileSection
                v-if="gameStore.isCompileUnlocked"
                :version="gameStore.version"
                :cost="gameStore.compileCost"
                :can-compile="gameStore.refactorPoints.gte(gameStore.compileCost)"
                @compile-and-release="gameStore.compileAndRelease"
              />
            </div>

            <div v-if="activeTab === 'challenges'"><ChallengesSection /></div>
            <div v-if="activeTab === 'automation'"><AutomationSection /></div>
            <div v-if="activeTab === 'singularity'"><SingularitySection /></div>
            <div v-if="activeTab === 'stats'"><StatsSection /></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Floating click numbers ─────────────────────────── */
.floating-numbers-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 100;
}

.floating-number {
  position: absolute;
  font-size: 15px;
  font-weight: bold;
  color: #4ade80;
  text-shadow: 0 0 5px rgba(74, 222, 128, 0.7);
  animation: float-up 1.5s ease-out forwards;
  white-space: nowrap;
  transform: translate(-50%, -50%);
}

@keyframes float-up {
  from { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  to   { transform: translate(-50%, -120%) scale(0.8); opacity: 0; }
}

/* ── Bottom Sheet ───────────────────────────────────── */
.bottom-sheet {
  background: #0d151c;
  border-radius: 1.25rem 1.25rem 0 0;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.7);
  height: 65vh;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* ── Code Rush button ───────────────────────────────── */
.code-rush-button {
  background-color: #1e2a38;
  position: relative;
  overflow: hidden;
}

.code-rush-fill {
  transition: width 0.5s ease-out;
}

.code-rush-active-zebra {
  background-image: linear-gradient(
    -45deg,
    rgba(139, 92, 246, 0.8) 25%,
    rgba(59, 130, 246, 0.8) 25.1%,
    rgba(59, 130, 246, 0.8) 50%,
    rgba(139, 92, 246, 0.8) 50.1%,
    rgba(139, 92, 246, 0.8) 75%,
    rgba(59, 130, 246, 0.8) 75.1%
  );
  background-size: 80px 80px;
  animation: zebra-stripe-move 0.5s linear infinite;
}

@keyframes zebra-stripe-move {
  0%   { background-position: 0 0; }
  100% { background-position: 80px 0; }
}

.code-rush-animated-border-wrapper {
  position: relative;
  border-radius: 0.5rem;
}

.code-rush-active-shadow {
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.7), 0 0 15px rgba(139, 92, 246, 0.5);
  animation: pulseShadow 1s infinite alternate;
}

@keyframes pulseShadow {
  0%   { box-shadow: 0 0 8px rgba(139, 92, 246, 0.7), 0 0 15px rgba(139, 92, 246, 0.5); }
  100% { box-shadow: 0 0 12px rgba(139, 92, 246, 0.9), 0 0 25px rgba(139, 92, 246, 0.7); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
