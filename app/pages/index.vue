<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
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
import CodeRushButton from '~/components/game/CodeRushButton.vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useSingularityModal } from '~/composables/useSingularityModal';
import { useToast } from '~/composables/useToast';
import { useOnboarding } from '~/composables/useOnboarding';
import { useSpotlight } from '~/composables/useSpotlight';
import { formatNumber } from '~/utils/format';

const gameStore = useGameStore();
const singularityModal = useSingularityModal();
const toast = useToast();
const { shouldShowTour, shouldShowCodeRushTour, completeTour, completeCodeRushTour } = useOnboarding();
const { spotlightRect, update: updateSpotlightRect, clear: clearSpotlight, forwardClickIfInsideSpotlight } = useSpotlight();

const isTourActive = ref(false);
const tourClickCount = ref(0);
const TOUR_CLICK_TARGET = 10;
const tourStep = ref(0);

const tourStepConfigs = computed(() => [
  { selector: '[data-onboarding="code-area"]', title: $t('onboarding.step1Title'), description: $t('onboarding.step1Desc') },
  { selector: '[data-onboarding="generator-buy"]', title: $t('onboarding.step2Title'), description: $t('onboarding.step2Desc') },
  { selector: '[data-onboarding="code-area"]', title: $t('onboarding.step3Title'), description: $t('onboarding.step3Desc') },
]);

const currentTourStep = computed(() => tourStepConfigs.value[tourStep.value]);
const tourClickRemaining = computed(() => TOUR_CLICK_TARGET - tourClickCount.value);

function updateSpotlight() {
  updateSpotlightRect(currentTourStep.value?.selector, isTourActive.value);
}

const tooltipPosition = computed(() => {
  if (!spotlightRect.value) return { display: 'none' } as Record<string, string>;
  const rect = spotlightRect.value;
  const tooltipWidth = 272;
  const tooltipHeight = 120;
  let top = rect.top + rect.height + 24;
  let left = rect.left + (rect.width - tooltipWidth) / 2;
  left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
  if (top + tooltipHeight > window.innerHeight) {
    top = rect.top - tooltipHeight - 16;
  }
  // If still off-screen (spotlight too tall), place inside the spotlight area
  if (top < 0) {
    top = Math.min(rect.top + 24, window.innerHeight - tooltipHeight - 16);
  }
  return { top: `${top}px`, left: `${left}px` };
});

function goToTourStep(step: number) {
  tourStep.value = step;
  nextTick(updateSpotlight);
}

function handleOverlayClick(e: MouseEvent) {
  if (tourStep.value === 0) {
    forwardClickIfInsideSpotlight(e, '[data-onboarding="code-area"]');
  } else if (tourStep.value === 1) {
    forwardClickIfInsideSpotlight(e, '[data-onboarding="generator-buy"]');
  } else if (tourStep.value === 2) {
    handleTourEnd();
  }
}

const handleTourEnd = () => {
  isTourActive.value = false;
  clearSpotlight();
  completeTour();
};

// ── Code Rush Tour ──────────────────────────────
const isCodeRushTourActive = ref(false);
const codeRushTourStep = ref(0); // 0: activate, 1: click frantically

const codeRushTourStepConfigs = computed(() => [
  { selector: '[data-onboarding="code-rush"]', title: $t('onboarding.codeRushStep1Title'), description: $t('onboarding.codeRushStep1Desc') },
  { selector: '[data-onboarding="code-area"]', title: $t('onboarding.codeRushStep2Title'), description: $t('onboarding.codeRushStep2Desc') },
]);

const currentCodeRushTourStep = computed(() => codeRushTourStepConfigs.value[codeRushTourStep.value]);

function updateCodeRushSpotlight() {
  updateSpotlightRect(currentCodeRushTourStep.value?.selector, isCodeRushTourActive.value);
}

function handleCodeRushOverlayClick(e: MouseEvent) {
  if (codeRushTourStep.value === 0) {
    forwardClickIfInsideSpotlight(e, '[data-onboarding="code-rush"] button');
  } else if (codeRushTourStep.value === 1) {
    forwardClickIfInsideSpotlight(e, '[data-onboarding="code-area"]');
  }
}

function startCodeRushTour() {
  if (isTourActive.value || isCodeRushTourActive.value) return;
  isCodeRushTourActive.value = true;
  codeRushTourStep.value = 0;
  nextTick(updateCodeRushSpotlight);
}

function endCodeRushTour() {
  isCodeRushTourActive.value = false;
  clearSpotlight();
  completeCodeRushTour();
}

watch(() => gameStore.isCodeRushReady, (ready) => {
  if (ready && shouldShowCodeRushTour.value && !isTourActive.value) {
    startCodeRushTour();
  }
});

watch(() => gameStore.isCodeRushActive, (active, wasActive) => {
  if (!isCodeRushTourActive.value) return;
  if (active && codeRushTourStep.value === 0) {
    codeRushTourStep.value = 1;
    nextTick(updateCodeRushSpotlight);
  } else if (!active && wasActive && codeRushTourStep.value === 1) {
    endCodeRushTour();
  }
});

onMounted(async () => {
  window.addEventListener('resize', updateSpotlight);

  if (shouldShowTour.value) {
    // Wait for intro animation (GenesisEvent) to appear and then finish
    await new Promise<void>(resolve => {
      let appeared = !!document.querySelector('[data-genesis-event]');
      if (appeared) {
        // Already present, just wait for removal
        const observer = new MutationObserver(() => {
          if (!document.querySelector('[data-genesis-event]')) {
            observer.disconnect();
            resolve();
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        return;
      }
      // Not yet present — wait for it to appear then disappear
      const observer = new MutationObserver(() => {
        if (!appeared && document.querySelector('[data-genesis-event]')) {
          appeared = true;
        } else if (appeared && !document.querySelector('[data-genesis-event]')) {
          observer.disconnect();
          resolve();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      // If no genesis event appears within 500ms, proceed without waiting
      setTimeout(() => {
        if (!appeared) {
          observer.disconnect();
          resolve();
        }
      }, 500);
    });

    // Show spotlight
    isTourActive.value = true;
    tourClickCount.value = 0;
    tourStep.value = 0;
    await nextTick();
    updateSpotlight();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateSpotlight);
});

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

  if (isTourActive.value && tourStep.value === 0 && tourClickCount.value < TOUR_CLICK_TARGET) {
    tourClickCount.value++;
    if (tourClickCount.value >= TOUR_CLICK_TARGET) {
      goToTourStep(1);
    }
  }
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

watch(() => gameStore.generators[0]?.bought, (bought) => {
  if (isTourActive.value && tourStep.value === 1 && bought && bought > 0) {
    goToTourStep(2);
  }
});

watch(() => gameStore.isRefactorUnlocked, (isUnlocked) => {
  if (isUnlocked && !hasShownRefactorMessage.value) {
    toast.addToast($t('toast.refactorSuggestion'), 'warning', 5000);
    hasShownRefactorMessage.value = true;
    activeTab.value = 'upgrades';
  }
});

watch(() => gameStore.generators[7]!.bought, (aiCores) => {
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
</script>

<template>
  <div
    class="flex h-dvh flex-col bg-[#101a23] text-white"
    style='font-family: "Space Grotesk", "Noto Sans", sans-serif; padding-top: env(safe-area-inset-top);'
  >
    <!-- ── Onboarding Overlay ─────────────────────────── -->
    <div v-if="isTourActive" class="fixed inset-0 z-[9999]">
      <!-- Full-screen click blocker (always present during tour) -->
      <div class="absolute inset-0 z-0" @click.stop.prevent="handleOverlayClick" />

      <!-- Spotlight + tooltip (fade in when ready) -->
      <Transition name="onboarding-fade">
        <div v-if="spotlightRect" class="absolute inset-0 pointer-events-none">
          <!-- Spotlight cutout (dark overlay via box-shadow) -->
          <div
            class="absolute rounded-lg transition-all duration-300 ease-out"
            :style="{
              top: `${spotlightRect.top - 8}px`,
              left: `${spotlightRect.left - 8}px`,
              width: `${spotlightRect.width + 16}px`,
              height: `${spotlightRect.height + 16}px`,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
            }"
          />

          <!-- Tooltip -->
          <div class="absolute onboarding-tooltip pointer-events-auto" style="z-index: 1" :style="tooltipPosition">
            <h3 class="text-sm font-bold text-white mb-2">{{ currentTourStep?.title }}</h3>
            <p class="text-xs text-gray-300 leading-relaxed mb-3">{{ currentTourStep?.description }}</p>

            <div class="flex items-center justify-between">
              <div class="flex gap-1">
                <span v-for="i in 3" :key="i" class="w-1.5 h-1.5 rounded-full" :class="i - 1 === tourStep ? 'bg-[#3899fa]' : 'bg-gray-600'" />
              </div>
              <span v-if="tourStep === 0" class="text-xs text-[#3899fa] font-mono font-bold">
                {{ $t('onboarding.clickRemaining', { count: tourClickRemaining }) }}
              </span>
              <button v-if="tourStep === 2" @click.stop="handleTourEnd" class="px-3 py-1 bg-[#3899fa] text-white text-xs font-bold rounded hover:bg-[#2a7ada] transition-colors">
                {{ $t('onboarding.finish') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ── Code Rush Tour Overlay ─────────────────────── -->
    <div v-if="isCodeRushTourActive" class="fixed inset-0 z-[9999]" :class="{ 'pointer-events-none': codeRushTourStep === 1 }">
      <div v-if="codeRushTourStep === 0" class="absolute inset-0 z-0" @click.stop.prevent="handleCodeRushOverlayClick" />

      <Transition name="onboarding-fade">
        <div v-if="spotlightRect" class="absolute inset-0 pointer-events-none">
          <div
            v-if="codeRushTourStep === 0"
            class="absolute rounded-lg transition-all duration-300 ease-out"
            :style="{
              top: `${spotlightRect.top - 8}px`,
              left: `${spotlightRect.left - 8}px`,
              width: `${spotlightRect.width + 16}px`,
              height: `${spotlightRect.height + 16}px`,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
            }"
          />

          <div class="absolute onboarding-tooltip pointer-events-none" style="z-index: 1" :style="tooltipPosition">
            <h3 class="text-sm font-bold text-white mb-2">{{ currentCodeRushTourStep?.title }}</h3>
            <p class="text-xs text-gray-300 leading-relaxed">{{ currentCodeRushTourStep?.description }}</p>
          </div>
        </div>
      </Transition>
    </div>

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

      <!-- Click guidance hint, pinned to top of terminal area -->
      <Transition name="fade">
        <div
          v-if="gameStore.generators[0]!.bought === 0 && !isTourActive"
          class="absolute inset-x-0 top-4 z-[25] flex justify-center pointer-events-none"
        >
          <div class="flex flex-col items-center gap-0.5 bg-black/60 px-3 py-1.5 rounded-md backdrop-blur-sm border border-green-900/40">
            <p class="text-green-400 text-[10px] animate-pulse font-mono">{{ $t('common.clickToAccumulate') }}</p>
            <p class="text-gray-500 text-[9px]">{{ $t('common.goalHint') }}</p>
          </div>
        </div>
      </Transition>

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
          <CodeRushButton size="sm" @manual-click="handleManualClick" />
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
      <div class="relative shrink-0 w-[360px] xl:w-[420px] p-3 flex flex-col" data-onboarding="code-area">
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
        <div v-if="gameStore.generators[0]!.bought === 0 && !isTourActive" class="text-center mt-2">
          <p class="text-green-500/70 text-xs animate-pulse">{{ $t('common.clickToAccumulate') }}</p>
          <p class="text-gray-600 text-xs mt-1">{{ $t('common.goalHint') }}</p>
        </div>
      </div>

      <!-- ── Right: tab nav + scrollable content ──────── -->
      <div class="flex-1 flex flex-col overflow-hidden border-l border-gray-800/50">

        <!-- Horizontal tab navigation bar -->
        <nav class="shrink-0 flex items-end gap-0.5 px-4 pt-3 bg-[#0a1520] border-b border-gray-800/60 overflow-x-auto">
          <TransitionGroup name="tab-appear" tag="div" class="flex items-end gap-0.5">
          <a
            v-for="item in desktopNavItems.filter(t => t.unlocked)"
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
          </TransitionGroup>
        </nav>

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto p-5">
          <div :class="{ 'mx-auto max-w-2xl': activeTab !== 'singularity' }" class="space-y-4 pb-6">

            <!-- Code Rush + multiplier row (generators tab) -->
            <div v-if="activeTab === 'generators' && isGeneratorSectionUnlocked" class="flex items-center gap-2">
              <CodeRushButton size="md" @manual-click="handleManualClick" />
              <BuyMultiplierSelector v-if="gameStore.isMultiplierUnlocked" />
            </div>

            <div v-if="activeTab === 'generators'" class="space-y-3">
              <div v-if="gameStore.generators[0]!.bought === 0 && !isTourActive" class="text-center py-2 pointer-events-none">
                <p class="text-green-500/70 text-xs animate-pulse">{{ $t('common.clickToAccumulate') }}</p>
                <p class="text-gray-600 text-xs mt-1">{{ $t('common.goalHint') }}</p>
              </div>
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
.tab-appear-enter-active { transition: all 0.3s ease; }
.tab-appear-enter-from   { opacity: 0; transform: translateY(8px); }

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

/* ── Code Rush button styles moved to CodeRushButton.vue ── */

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Onboarding tooltip ───────────────────────────── */
.onboarding-tooltip {
  background: #182635;
  border: 1px solid #2a4a66;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  width: 17rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
}

.onboarding-fade-enter-active { transition: opacity 0.4s ease; }
.onboarding-fade-enter-from { opacity: 0; }
</style>
