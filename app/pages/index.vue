<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick, defineAsyncComponent } from 'vue';
import { useGameStore } from '~/store/game';
import { prestigeThresholds } from '~~/game/configs';
import AppHeader from '~/components/layout/AppHeader.vue';
import AppFooter from '~/components/layout/AppFooter.vue';
import GeneratorItem from '~/components/game/GeneratorItem.vue';
import RefactorSection from '~/components/game/RefactorSection.vue';
import CompileSection from '~/components/game/CompileSection.vue';
import CompileLockedPanel from '~/components/game/CompileLockedPanel.vue';
import AutomationSection from '~/components/game/AutomationSection.vue';
import ChallengesSection from '~/components/game/ChallengesSection.vue';
import StatsSection from '~/components/game/StatsSection.vue';
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
const SingularitySection = defineAsyncComponent(() => import('~/components/game/SingularitySection.vue'));
const singularityModal = useSingularityModal();
const toast = useToast();
const { t } = useI18n();
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
  stopSheetDrag();
});

const activeTab = ref('generators');
const hasShownRefactorMessage = ref(false);
const hasShownOverloadMessage = ref(false);
const bottomSheetHeight = ref(65);
const isDraggingSheet = ref(false);
let sheetDragStartY = 0;
let sheetDragStartHeight = 65;

const bottomSheetStyle = computed(() => ({
  '--sheet-height': `${bottomSheetHeight.value}vh`,
}));

function clampSheetHeight(height: number) {
  return Math.min(86, Math.max(38, height));
}

function handleSheetPointerMove(event: PointerEvent) {
  if (!isDraggingSheet.value) return;
  const deltaY = sheetDragStartY - event.clientY;
  bottomSheetHeight.value = clampSheetHeight(sheetDragStartHeight + (deltaY / window.innerHeight) * 100);
}

function stopSheetDrag() {
  if (!isDraggingSheet.value) return;
  isDraggingSheet.value = false;
  window.removeEventListener('pointermove', handleSheetPointerMove);
  window.removeEventListener('pointerup', stopSheetDrag);
  window.removeEventListener('pointercancel', stopSheetDrag);
}

function startSheetDrag(event: PointerEvent) {
  sheetDragStartY = event.clientY;
  sheetDragStartHeight = bottomSheetHeight.value;
  isDraggingSheet.value = true;
  window.addEventListener('pointermove', handleSheetPointerMove);
  window.addEventListener('pointerup', stopSheetDrag);
  window.addEventListener('pointercancel', stopSheetDrag);
}

function toggleSheetHeight() {
  bottomSheetHeight.value = bottomSheetHeight.value < 64 ? 65 : 42;
}

// Floating numbers state
const floatingNumbers = ref<{ id: number; amount: string; left: string; top: string; drift: string; lift: string; tilt: string }[]>([]);
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
    drift: `${(Math.random() - 0.5) * 44}px`,
    lift: `${92 + Math.random() * 38}px`,
    tilt: `${(Math.random() - 0.5) * 10}deg`,
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

const handleArchitecturalOverheadClick = () => {
  activeTab.value = 'stats';
  toast.addToast(t('common.architecturalOverheadToast', {
    cores: formatNumber(gameStore.generators[7]?.bought ?? 0),
    threshold: prestigeThresholds.ARCHITECTURAL_OVERHEAD_AI_CORES,
    efficiency: `${(gameStore.architecturalOverheadPenalty * 100).toFixed(1)}%`,
  }), 'warning', 5000);
};

const isGeneratorSectionUnlocked = computed(() => {
  return gameStore.isGeneratorUnlocked(1);
});

const unlockedGenerators = computed(() => {
  return gameStore.generators.filter(g => gameStore.isGeneratorUnlocked(g.id));
});

const tabTitleMap: Record<string, string> = {
  generators: $t('common.generators'),
  upgrades:   $t('common.progression'),
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
  { id: 'upgrades',   label: $t('common.progression'), short: 'ADV', icon: 'mdi:rocket-launch', unlocked: gameStore.isRefactorUnlocked },
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
    class="app-shell flex h-dvh flex-col text-white"
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
    <div class="mobile-stage lg:hidden flex-1 relative overflow-hidden min-h-0">

      <!-- Floating click numbers -->
      <div class="floating-numbers-container pointer-events-none">
        <span
          v-for="num in floatingNumbers"
          :key="num.id"
          class="floating-number"
          :style="{ left: num.left, top: num.top, '--drift': num.drift, '--lift': num.lift, '--tilt': num.tilt }"
        >{{ num.amount }}</span>
      </div>

      <!-- CodeScene — fills the entire game area -->
      <CodeScene
        class="absolute inset-0"
        @manual-click="handleManualClick"
        @overhead-click="handleArchitecturalOverheadClick"
      />

      <!-- Click guidance hint, pinned to top of terminal area -->
      <Transition name="fade">
        <div
          v-if="gameStore.generators[0]!.bought === 0 && !isTourActive"
          class="absolute inset-x-0 top-4 z-[25] flex justify-center pointer-events-none"
        >
          <div class="click-guidance flex flex-col items-center gap-0.5 px-3 py-1.5">
            <p class="text-green-400 text-[10px] animate-pulse font-mono">{{ $t('common.clickToAccumulate') }}</p>
            <p class="text-gray-500 text-[9px]">{{ $t('common.goalHint') }}</p>
          </div>
        </div>
      </Transition>

      <!-- ── Bottom Sheet (once generators are unlocked) ── -->
      <div
        v-if="isGeneratorSectionUnlocked"
        class="bottom-sheet absolute bottom-0 inset-x-0 z-20 flex flex-col"
        :class="{ dragging: isDraggingSheet }"
        :style="bottomSheetStyle"
      >
        <!-- Handle -->
        <button
          class="sheet-resize-handle flex justify-center py-1.5 shrink-0"
          type="button"
          aria-label="调整下方面板高度"
          @pointerdown.prevent="startSheetDrag"
          @dblclick.prevent="toggleSheetHeight"
        >
          <span class="sheet-handle w-8 h-0.5 rounded-full" />
        </button>

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
          <div v-show="activeTab === 'upgrades'" class="space-y-3 pt-2">
            <RefactorSection
              :potential-rp-gain="gameStore.refactorGain"
              :can-refactor="gameStore.canRefactor"
              :current-rp-bonus="gameStore.rpBonus"
              :unlock-requirement="prestigeThresholds.REFACTOR_UNLOCK_AI_CORES"
              @refactor="gameStore.refactor"
            />
            <CompileSection
              v-if="gameStore.isCompileUnlocked"
              :version="gameStore.version"
              :cost="gameStore.compileCost"
              :can-compile="gameStore.refactorPoints.gte(gameStore.compileCost)"
              @compile-and-release="gameStore.compileAndRelease"
            />
            <CompileLockedPanel
              v-else
              :unlock-requirement="prestigeThresholds.COMPILE_UNLOCK_RP"
            />
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
    <div class="desktop-stage hidden lg:flex flex-1 overflow-hidden min-h-0">

      <!-- ── Left: CodeScene panel (full height) ─────── -->
      <div class="code-panel-shell relative shrink-0 w-[360px] xl:w-[420px] p-3 flex flex-col" data-onboarding="code-area">
        <!-- Floating click numbers -->
        <div class="floating-numbers-container pointer-events-none">
          <span
            v-for="num in floatingNumbers"
            :key="num.id"
            class="floating-number"
            :style="{ left: num.left, top: num.top, '--drift': num.drift, '--lift': num.lift, '--tilt': num.tilt }"
          >{{ num.amount }}</span>
        </div>
        <!-- Scene fills all available height -->
        <CodeScene
          class="code-scene-frame rounded-xl overflow-hidden flex-1"
          @manual-click="handleManualClick"
          @overhead-click="handleArchitecturalOverheadClick"
        />
        <div v-if="gameStore.generators[0]!.bought === 0 && !isTourActive" class="text-center mt-2">
          <p class="text-green-500/70 text-xs animate-pulse">{{ $t('common.clickToAccumulate') }}</p>
          <p class="text-gray-600 text-xs mt-1">{{ $t('common.goalHint') }}</p>
        </div>
      </div>

      <!-- ── Right: tab nav + scrollable content ──────── -->
      <div class="desktop-content-shell flex-1 flex flex-col overflow-hidden">

        <!-- Horizontal tab navigation bar -->
        <nav class="desktop-tabs">
          <TransitionGroup name="tab-appear" tag="div" class="desktop-tab-list">
          <a
            v-for="item in desktopNavItems.filter(t => t.unlocked)"
            :key="item.id"
            @click="handleDesktopNavClick(item)"
            class="desktop-tab"
            :class="[
              activeTab === item.id
                ? 'active'
                : item.unlocked
                  ? ''
                  : 'locked',
            ]"
          >
            <Icon :name="item.icon" />
            <span>{{ item.label }}</span>
            <small>{{ item.short }}</small>
            <Icon v-if="!item.unlocked" name="mdi:lock-outline" class="lock-icon" />
          </a>
          </TransitionGroup>
        </nav>

        <!-- Scrollable content -->
        <div class="content-scroll flex-1 overflow-y-auto p-5">
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

            <div v-if="activeTab === 'upgrades'" class="space-y-4">
              <RefactorSection
                :potential-rp-gain="gameStore.refactorGain"
                :can-refactor="gameStore.canRefactor"
                :current-rp-bonus="gameStore.rpBonus"
                :unlock-requirement="prestigeThresholds.REFACTOR_UNLOCK_AI_CORES"
                @refactor="gameStore.refactor"
              />
              <CompileSection
                v-if="gameStore.isCompileUnlocked"
                :version="gameStore.version"
                :cost="gameStore.compileCost"
                :can-compile="gameStore.refactorPoints.gte(gameStore.compileCost)"
                @compile-and-release="gameStore.compileAndRelease"
              />
              <CompileLockedPanel
                v-else
                :unlock-requirement="prestigeThresholds.COMPILE_UNLOCK_RP"
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
.app-shell {
  overflow: hidden;
  background: #101a23;
}

.app-shell::before,
.app-shell::after {
  display: none;
}

.mobile-stage,
.desktop-stage {
  position: relative;
}

.mobile-stage::after {
  display: none;
}

.click-guidance {
  border: 1px solid #1f5137;
  border-radius: 8px;
  background: #0d1f1a;
}

.code-panel-shell {
  border-right: 1px solid #1f3448;
  background: #0c1721;
}

.code-scene-frame {
  border: 1px solid #253f56;
  box-shadow: none;
}

.desktop-content-shell {
  border-left: 1px solid #1f3448;
  background: #101a23;
  box-shadow: none;
}

.content-scroll {
  scrollbar-color: rgba(155, 210, 255, 0.28) transparent;
}

.tab-appear-enter-active { transition: all 0.22s ease; }
.tab-appear-enter-from   { opacity: 0; transform: translateY(8px); }

.desktop-tabs {
  flex-shrink: 0;
  overflow-x: auto;
  border-bottom: 1px solid #253f56;
  background: #0d1823;
  box-shadow: none;
  padding: 10px 14px;
}

.desktop-tab-list {
  display: flex;
  align-items: center;
  gap: 8px;
}

.desktop-tab {
  position: relative;
  display: inline-grid;
  grid-template-columns: auto auto auto;
  align-items: center;
  gap: 7px;
  min-height: 38px;
  flex: 0 0 auto;
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid #253f56;
  border-radius: 8px;
  background: #102033;
  color: #8ba2b7;
  font-size: 0.82rem;
  font-weight: 800;
  padding: 0 10px;
  transition: border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.desktop-tab:hover {
  border-color: #3d6f92;
  background: #173047;
  color: #cfe3f5;
}

.desktop-tab.active {
  border-color: #4f9c70;
  background: #10291f;
  color: #f8fbff;
  box-shadow: none;
}

.desktop-tab.active::before {
  content: '';
  position: absolute;
  inset: auto 10px 4px;
  height: 2px;
  border-radius: 999px;
  background: #9af7bd;
  box-shadow: none;
}

.desktop-tab .iconify {
  font-size: 1rem;
}

.desktop-tab small {
  border: 1px solid #253f56;
  border-radius: 999px;
  color: #b9cde0;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.58rem;
  font-weight: 900;
  padding: 1px 5px;
}

.desktop-tab.active small {
  border-color: #2d6042;
  color: #dcfce7;
}

.desktop-tab.locked {
  cursor: not-allowed;
  color: #425568;
}

.desktop-tab .lock-icon {
  font-size: 0.76rem;
  opacity: 0.7;
}

/* ── Floating click numbers ─────────────────────────── */
.floating-numbers-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 100;
}

.floating-number {
  position: absolute;
  min-width: 3.25rem;
  padding: 0.18rem 0.52rem 0.2rem;
  border: 1px solid #4f9c70;
  border-radius: 999px;
  background: #10291f;
  color: #d1fae5;
  box-shadow: none;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  text-align: center;
  text-shadow: 0 0 10px rgba(110, 231, 183, 0.64);
  animation: float-up 1.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  white-space: nowrap;
  transform: translate(-50%, -50%);
  will-change: transform, opacity;
}

.floating-number::after {
  display: none;
}

@keyframes float-up {
  0% {
    transform: translate(-50%, -50%) translateY(8px) rotate(0deg) scale(0.86);
    opacity: 0;
  }
  14% {
    opacity: 1;
  }
  62% {
    transform: translate(calc(-50% + var(--drift) * 0.45), calc(-50% - var(--lift) * 0.62)) rotate(var(--tilt)) scale(1.02);
    opacity: 0.95;
  }
  100% {
    transform: translate(calc(-50% + var(--drift)), calc(-50% - var(--lift))) rotate(var(--tilt)) scale(0.78);
    opacity: 0;
  }
}

@keyframes float-glow {
  0% {
    opacity: 0;
    transform: scale(0.7);
  }
  18% {
    opacity: 0.65;
  }
  100% {
    opacity: 0;
    transform: scale(1.35);
  }
}

/* ── Bottom Sheet ───────────────────────────────────── */
.bottom-sheet {
  overflow: hidden;
  border: 1px solid #253f56;
  border-bottom: 0;
  border-radius: 1.25rem 1.25rem 0 0;
  background: #101a23;
  box-shadow: none;
  height: var(--sheet-height, 65vh);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  transition: height 0.18s ease;
}

.bottom-sheet.dragging {
  transition: none;
}

.bottom-sheet::before {
  display: none;
}

.bottom-sheet > * {
  position: relative;
  z-index: 1;
}

.sheet-resize-handle {
  width: 100%;
  cursor: ns-resize;
  touch-action: none;
}

.sheet-handle {
  background: #5f7589;
  box-shadow: none;
}

.sheet-resize-handle:active .sheet-handle,
.sheet-resize-handle:hover .sheet-handle {
  background: #8eadcc;
}

/* ── Code Rush button styles moved to CodeRushButton.vue ── */

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Onboarding tooltip ───────────────────────────── */
.onboarding-tooltip {
  background: #142331;
  border: 1px solid #29465f;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  width: 17rem;
  box-shadow: none;
}

.onboarding-fade-enter-active { transition: opacity 0.4s ease; }
.onboarding-fade-enter-from { opacity: 0; }
</style>
