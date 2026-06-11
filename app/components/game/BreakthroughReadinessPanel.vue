<template>
  <section class="system-panel breakthrough-panel">
    <header class="panel-header">
      <div>
        <p class="panel-kicker">SINGULARITY PREP</p>
        <h2>{{ $t('common.breakthroughReadiness') }}</h2>
      </div>
      <span class="status-chip" :class="{ ready: isFullyReady, charging: !isFullyReady && isReadinessReady }">
        <Icon :name="isFullyReady ? 'mdi:creation-outline' : isReadinessReady ? 'mdi:flash-outline' : 'mdi:timer-sand'" />
        {{ isFullyReady ? 'READY' : isReadinessReady ? 'CHARGING' : 'BUILDING' }}
      </span>
    </header>

    <div class="readiness-readout">
      <div class="readiness-copy">
        <span>{{ $t('common.currentReadiness') }}</span>
        <strong>{{ progressLabel }}</strong>
      </div>
      <div class="readiness-track" aria-hidden="true">
        <span :style="{ width: `${progressPercent}%` }" />
      </div>
    </div>

    <div class="requirement-grid">
      <article class="requirement-card cp-card" :class="{ ready: isCpReady }" :style="cpRequirementStyle">
        <div class="requirement-copy">
          <span>{{ $t('common.singularityCpRequirement') }}</span>
          <strong>{{ cpProgressLabel }}</strong>
        </div>
        <b>{{ isCpReady ? $t('common.requirementReady') : $t('common.requirementMissing') }}</b>
      </article>
      <article
        v-if="requiresReadiness"
        class="requirement-card readiness-card"
        :class="{ ready: isReadinessReady }"
        :style="readinessRequirementStyle"
      >
        <div class="requirement-copy">
          <span>{{ $t('common.singularityReadinessRequirement') }}</span>
          <strong>{{ progressLabel }}</strong>
        </div>
        <b>{{ isReadinessReady ? $t('common.requirementReady') : $t('common.requirementMissing') }}</b>
      </article>
    </div>

    <div class="source-grid">
      <article>
        <Icon name="mdi:source-branch-sync" />
        <span>{{ $t('common.breakthroughRefactorSource') }}</span>
      </article>
      <article>
        <Icon name="mdi:package-variant-closed-check" />
        <span>{{ $t('common.breakthroughCompileSource') }}</span>
      </article>
      <article>
        <Icon name="mdi:trophy-variant-outline" />
        <span>{{ $t('common.breakthroughChallengeSource') }}</span>
      </article>
      <article>
        <Icon name="mdi:cpu-64-bit" />
        <span>{{ $t('common.breakthroughPressureSource') }}</span>
      </article>
    </div>

    <p class="hint">{{ readinessHint }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Decimal from 'break_infinity.js'
import { useGameStore } from '~/store/game'
import { prestigeThresholds } from '~~/game/configs'
import { formatNumber } from '~/utils/format'

const gameStore = useGameStore()
const { t } = useI18n()

const required = prestigeThresholds.BREAKTHROUGH_READINESS_REQUIRED
const cpRequired = new Decimal('1e120')
const requiresReadiness = computed(() => gameStore.singularityCount === 0)
const currentReadiness = computed(() => Math.min(required, Math.max(0, gameStore.effectiveBreakthroughReadiness)))
const progressPercent = computed(() => (currentReadiness.value / required) * 100)
const cpProgressPercent = computed(() => {
  if (gameStore.currency.lte(0)) return 0
  return Math.min(100, Math.max(0, (gameStore.currency.log10() / cpRequired.log10()) * 100))
})
const progressLabel = computed(() => {
  const value = currentReadiness.value
  const displayValue = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)
  return `${displayValue}/${required}`
})
const cpProgressLabel = computed(() => `${formatNumber(gameStore.currency)} / 1e120`)
const isReadinessReady = computed(() => gameStore.effectiveBreakthroughReadiness >= required)
const isCpReady = computed(() => gameStore.currency.gte(cpRequired))
const isFullyReady = computed(() => isCpReady.value && (!requiresReadiness.value || isReadinessReady.value))
const cpRequirementStyle = computed(() => ({
  '--progress-fill': `${cpProgressPercent.value}%`,
}))
const readinessRequirementStyle = computed(() => ({
  '--progress-fill': `${progressPercent.value}%`,
}))
const readinessHint = computed(() =>
  isFullyReady.value
    ? t('common.singularityTriggerHint')
    : requiresReadiness.value && isReadinessReady.value
      ? t('common.singularityNeedCpHint', { target: '1e120' })
      : isCpReady.value
        ? t('common.singularityNeedReadinessHint', { target: required })
        : t('common.breakthroughBuildingHint')
)
</script>

<style scoped>
.system-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(251, 191, 36, 0.22);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(18, 27, 32, 0.96), rgba(9, 16, 21, 0.98)),
    radial-gradient(circle at 18% 0%, rgba(251, 191, 36, 0.14), transparent 36%);
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.06), inset 0 0 36px rgba(0, 0, 0, 0.35);
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
.readiness-readout,
.source-grid,
.hint {
  position: relative;
  z-index: 1;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(251, 191, 36, 0.16);
  padding-bottom: 12px;
}

.panel-kicker {
  color: #fbbf24;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.panel-header h2 {
  margin-top: 2px;
  color: #f8fbff;
  font-size: 1rem;
  font-weight: 800;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(251, 191, 36, 0.32);
  border-radius: 999px;
  background: rgba(69, 48, 12, 0.42);
  color: #fde68a;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.66rem;
  font-weight: 900;
  padding: 6px 10px;
}

.status-chip.ready {
  border-color: rgba(74, 222, 128, 0.32);
  background: rgba(5, 46, 22, 0.38);
  color: #bbf7d0;
}

.status-chip.charging {
  border-color: rgba(96, 165, 250, 0.28);
  background: rgba(23, 37, 84, 0.4);
  color: #bfdbfe;
}

.readiness-readout {
  margin-top: 14px;
  border: 1px solid rgba(251, 191, 36, 0.16);
  border-radius: 8px;
  background: rgba(4, 15, 18, 0.54);
  padding: 12px;
}

.readiness-copy {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.readiness-copy span,
.hint,
.source-grid span {
  color: #b9cde0;
  font-size: 0.72rem;
}

.readiness-copy strong {
  color: #fde68a;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 1.15rem;
  font-weight: 900;
}

.readiness-track {
  height: 9px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.9);
  margin-top: 10px;
}

.readiness-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #fbbf24, #86efac);
  transition: width 0.25s ease;
}

.requirement-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.requirement-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid rgba(251, 191, 36, 0.12);
  border-radius: 8px;
  background: rgba(16, 26, 35, 0.66);
  padding: 10px;
  isolation: isolate;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.requirement-card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background:
    linear-gradient(90deg, var(--progress-color) 0, var(--progress-color) var(--progress-fill, 0%), transparent var(--progress-fill, 0%), transparent 100%);
  opacity: 0.9;
  pointer-events: none;
}

.requirement-card.ready {
  border-color: rgba(74, 222, 128, 0.18);
  background: rgba(5, 46, 22, 0.22);
}

.requirement-card > * {
  position: relative;
  z-index: 1;
}

.cp-card {
  --progress-color: rgba(56, 153, 250, 0.18);
}

.readiness-card {
  --progress-color: rgba(251, 191, 36, 0.18);
}

.requirement-card.ready::before {
  background:
    linear-gradient(90deg, rgba(74, 222, 128, 0.24) 0, rgba(74, 222, 128, 0.24) var(--progress-fill, 100%), transparent var(--progress-fill, 100%), transparent 100%);
}

.requirement-copy {
  min-width: 0;
}

.requirement-copy span {
  display: block;
  color: #8eadcc;
  font-size: 0.65rem;
}

.requirement-copy strong {
  display: block;
  margin-top: 4px;
  color: #f8fbff;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.8rem;
  font-weight: 800;
  line-height: 1.25;
  word-break: break-word;
}

.requirement-card b {
  flex: 0 0 auto;
  color: #fde68a;
  font-size: 0.68rem;
  font-weight: 900;
}

.requirement-card.ready b {
  color: #bbf7d0;
}

.source-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.source-grid article {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  border: 1px solid rgba(251, 191, 36, 0.12);
  border-radius: 8px;
  background: rgba(16, 26, 35, 0.66);
  padding: 9px;
}

.source-grid .iconify {
  flex: 0 0 auto;
  color: #fbbf24;
}

.hint {
  margin-top: 10px;
  line-height: 1.5;
  text-align: center;
}

@media (max-width: 640px) {
  .requirement-grid {
    grid-template-columns: 1fr;
  }
}
</style>
