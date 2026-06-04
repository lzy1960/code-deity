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
        :class="isCodeRushChargedAndReady ? 'bg-gradient-to-r from-purple-600 to-purple-500' : 'bg-gradient-to-r from-purple-600 to-blue-500'"
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
