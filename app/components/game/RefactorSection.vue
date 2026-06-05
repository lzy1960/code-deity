<template>
  <section class="system-panel refactor-panel relative overflow-hidden rounded-lg border border-[#3899fa]/20 p-3.5">
    <header class="panel-header relative z-[1] flex items-center justify-between gap-3 border-b border-[#3899fa]/10 pb-3">
      <div>
        <p class="panel-kicker font-mono text-[0.62rem] font-extrabold uppercase tracking-[0.12em] text-[#3899fa]">REFACTOR PROTOCOL</p>
        <h2 class="mt-0.5 text-base font-extrabold text-[#e5f3ff]">{{ $t('common.confirmRefactor') }}</h2>
      </div>
      <span
        class="status-chip inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-mono text-[0.68rem] font-black"
        :class="canRefactor
          ? 'border-green-300/30 bg-green-950/40 text-green-200'
          : 'locked border-slate-300/20 bg-slate-900/50 text-[#8eadcc]'"
      >
        <Icon :name="canRefactor ? 'mdi:source-branch-sync' : 'mdi:lock-outline'" />
        {{ canRefactor ? 'READY' : 'LOCKED' }}
      </span>
    </header>

    <div class="readout relative z-[1] mt-4 rounded-lg border border-green-300/15 bg-[#040f12]/50 p-4 text-center">
      <p class="text-[0.72rem] text-[#8eadcc]">{{ $t('common.gainFromRefactor') }}</p>
      <strong class="my-1.5 block font-mono text-[clamp(2rem,10vw,3.4rem)] leading-none text-emerald-100 drop-shadow-[0_0_18px_rgba(74,222,128,0.28)]">+{{ formatNumber(potentialRpGain) }}</strong>
      <span class="text-[0.72rem] text-[#8eadcc]">{{ $t('common.refactorPoints') }}</span>
    </div>

    <div class="bonus-line relative z-[1] my-3 flex flex-wrap justify-center gap-1 text-[0.72rem] text-[#8eadcc]">
      <span>{{ $t('common.currentBonus') }}</span>
      <b class="font-mono text-green-200">+{{ currentRpBonus.minus(1).times(100).toFixed(2) }}%</b>
      <span>{{ $t('common.toAllProduction') }}</span>
    </div>

    <button
      class="panel-button relative z-[1] inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-lg border text-sm font-extrabold text-[#e5f3ff] transition duration-200"
      :class="canRefactor
        ? 'border-[#3899fa]/40 bg-[#3899fa]/20 hover:-translate-y-px hover:border-sky-200/60 hover:bg-[#3899fa]/30'
        : 'disabled cursor-not-allowed border-[#3899fa]/20 bg-[#3899fa]/10 opacity-50'"
      :disabled="!canRefactor"
      @click="requestRefactor"
    >
      <Icon name="mdi:rocket-launch-outline" />
      <span>{{ $t('common.confirmRefactor') }}</span>
    </button>

    <p v-if="!canRefactor" class="unlock-hint relative z-[1] mt-2.5 text-center text-[0.72rem] text-[#8eadcc]">
      {{ $t('common.refactorUnlockHint', { unlockRequirement: unlockRequirement }) }}
    </p>
  </section>
</template>

<script setup lang="ts">
import Decimal from 'break_infinity.js'
import { formatNumber } from '~/utils/format'
import { useGameStore } from '~/store/game'
import { useRefactorConfirmationModal } from '~/composables/useRefactorConfirmationModal'

const props = defineProps<{
  potentialRpGain: Decimal
  canRefactor: boolean
  currentRpBonus: Decimal
  unlockRequirement: number
}>()

const emit = defineEmits(['refactor'])

const gameStore = useGameStore()
const modal = useRefactorConfirmationModal()

const requestRefactor = () => {
  if (!props.canRefactor) return

  const projectedRp = gameStore.refactorPoints.plus(props.potentialRpGain)
  const versionBonus = new Decimal(1).plus(gameStore.version * 0.2)
  const projectedRpBonus = new Decimal(1).plus(projectedRp.times(0.1).times(versionBonus))

  modal.show(
    {
      potentialRpGain: props.potentialRpGain,
      currentRpBonus: props.currentRpBonus,
      projectedRpBonus,
      currentRefactorPoints: gameStore.refactorPoints,
    },
    () => emit('refactor')
  )
}
</script>

<style scoped>
.system-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(56, 153, 250, 0.18);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(13, 26, 40, 0.96), rgba(8, 15, 24, 0.98)),
    radial-gradient(circle at 18% 0%, rgba(74, 222, 128, 0.12), transparent 34%);
  box-shadow: 0 0 20px rgba(56, 153, 250, 0.06), inset 0 0 36px rgba(0, 0, 0, 0.35);
  padding: 14px;
}

.system-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(255, 255, 255, 0.018) 5px, rgba(255, 255, 255, 0.018) 6px);
}

.panel-header,
.readout,
.bonus-line,
.panel-button,
.unlock-hint {
  position: relative;
  z-index: 1;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(56, 153, 250, 0.12);
  padding-bottom: 12px;
}

.panel-kicker {
  color: #3899fa;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.panel-header h2 {
  margin-top: 2px;
  color: #e5f3ff;
  font-size: 1rem;
  font-weight: 800;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(74, 222, 128, 0.28);
  border-radius: 999px;
  background: rgba(5, 46, 22, 0.38);
  color: #86efac;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.68rem;
  font-weight: 900;
  padding: 6px 10px;
}

.status-chip.locked {
  border-color: rgba(142, 173, 204, 0.18);
  background: rgba(15, 23, 42, 0.52);
  color: #8eadcc;
}

.readout {
  margin-top: 16px;
  border: 1px solid rgba(74, 222, 128, 0.16);
  border-radius: 8px;
  background: rgba(4, 15, 18, 0.52);
  padding: 16px;
  text-align: center;
}

.readout p,
.readout span,
.bonus-line,
.unlock-hint {
  color: #8eadcc;
  font-size: 0.72rem;
}

.readout strong {
  display: block;
  color: #d1fae5;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: clamp(2rem, 10vw, 3.4rem);
  line-height: 1;
  margin: 6px 0;
  text-shadow: 0 0 18px rgba(74, 222, 128, 0.28);
}

.bonus-line {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  margin: 12px 0;
}

.bonus-line b {
  color: #86efac;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
}

.panel-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 42px;
  border: 1px solid rgba(56, 153, 250, 0.38);
  border-radius: 8px;
  background: rgba(56, 153, 250, 0.18);
  color: #e5f3ff;
  font-size: 0.85rem;
  font-weight: 800;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.panel-button:not(.disabled):hover {
  border-color: rgba(125, 211, 252, 0.58);
  background: rgba(56, 153, 250, 0.28);
  transform: translateY(-1px);
}

.panel-button.disabled {
  cursor: not-allowed;
  opacity: 0.52;
}

.unlock-hint {
  margin-top: 10px;
  text-align: center;
}
</style>
