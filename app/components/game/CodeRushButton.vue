<template>
  <div
    class="code-rush-animated-border-wrapper relative rounded-lg overflow-hidden flex-1"
    data-onboarding="code-rush"
    :class="{ 'code-rush-active-shadow': gameStore.isCodeRushActive }"
  >
    <button
      @click.prevent="onClick"
      class="code-rush-button relative w-full text-white font-bold rounded-lg overflow-hidden"
      :class="[sizeClass, { 'code-rush-charged-ready': isCodeRushChargedAndReady }]"
    >
      <div
        v-if="!gameStore.isCodeRushActive"
        class="code-rush-fill absolute inset-0 transition-all duration-500 ease-out"
        :class="{ 'code-rush-ready-fill': isCodeRushChargedAndReady }"
        :style="{ width: codeRushFillWidth }"
      />
      <div
        v-else
        class="code-rush-fill code-rush-active-zebra absolute inset-0"
        :style="{ width: codeRushFillWidth }"
      />
      <div class="relative z-10 flex items-center justify-center text-xs" :class="contentGapClass">
        <Icon name="mdi:flash" :class="iconSizeClass" />
        <Transition name="fade" mode="out-in">
          <span :key="codeRushButtonText">{{ codeRushButtonText }}</span>
        </Transition>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '~/store/game'

const props = withDefaults(defineProps<{
  size?: 'sm' | 'md'
}>(), { size: 'sm' })

const emit = defineEmits<{ manualClick: [] }>()

const gameStore = useGameStore()
const { t: $t } = useI18n()

const sizeClass = computed(() => props.size === 'sm' ? 'px-3 py-1.5' : 'px-4 py-2')
const contentGapClass = computed(() => props.size === 'sm' ? 'gap-1.5' : 'gap-2')
const iconSizeClass = computed(() => props.size === 'sm' ? 'text-xs' : 'text-sm')

const codeRushButtonText = computed(() => {
  if (gameStore.isCodeRushActive) {
    return `${$t('common.codeRushActive')} (${$t('common.codeRushActiveMultiplier')})`
  }
  if (gameStore.isCodeRushReady) {
    return $t('common.activateCodeRush')
  }
  return `${$t('common.manualOverclock')} (${$t('common.manualOverclockCpsPercentage')})`
})

const codeRushFillWidth = computed(() => `${gameStore.codeRushProgress}%`)

const isCodeRushChargedAndReady = computed(() =>
  gameStore.codeRushProgress >= 100 && !gameStore.isCodeRushActive
)

function onClick() {
  if (gameStore.isCodeRushReady) {
    gameStore.activateCodeRush()
  } else {
    emit('manualClick')
  }
}
</script>

<style scoped>
.code-rush-button {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(56, 153, 250, 0.22);
  background:
    linear-gradient(180deg, rgba(19, 37, 54, 0.98), rgba(12, 23, 34, 0.98)),
    radial-gradient(circle at 0% 0%, rgba(76, 165, 255, 0.18), transparent 42%);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04) inset, inset 0 0 22px rgba(0, 0, 0, 0.22);
}

.code-rush-fill {
  background: linear-gradient(90deg, rgba(76, 165, 255, 0.62), rgba(154, 247, 189, 0.52));
  box-shadow: 0 0 16px rgba(76, 165, 255, 0.34);
  transition: width 0.5s ease-out;
}

.code-rush-ready-fill {
  background: linear-gradient(90deg, rgba(76, 165, 255, 0.86), rgba(154, 247, 189, 0.78));
  box-shadow: 0 0 18px rgba(154, 247, 189, 0.46);
}

.code-rush-active-zebra {
  background:
    linear-gradient(90deg, rgba(76, 165, 255, 0.82), rgba(154, 247, 189, 0.72)),
    repeating-linear-gradient(100deg, transparent 0 16px, rgba(255, 255, 255, 0.12) 16px 18px);
  background-size: 100% 100%, 72px 100%;
  animation: energy-scan 0.7s linear infinite;
}

@keyframes energy-scan {
  0%   { background-position: 0 0, 0 0; }
  100% { background-position: 0 0, 72px 0; }
}

.code-rush-animated-border-wrapper {
  position: relative;
  border-radius: 0.5rem;
}

.code-rush-active-shadow {
  box-shadow: 0 0 12px rgba(56, 153, 250, 0.24), 0 0 20px rgba(134, 239, 172, 0.18);
  animation: pulseShadow 1s infinite alternate;
}

@keyframes pulseShadow {
  0%   { box-shadow: 0 0 10px rgba(56, 153, 250, 0.22), 0 0 18px rgba(134, 239, 172, 0.16); }
  100% { box-shadow: 0 0 16px rgba(56, 153, 250, 0.34), 0 0 26px rgba(134, 239, 172, 0.24); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
