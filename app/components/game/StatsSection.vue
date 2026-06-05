<template>
  <section class="stats-panel">
    <header class="stats-header">
      <div>
        <p class="stats-kicker">SYSTEM TELEMETRY</p>
        <h2>{{ $t('common.statistics') }}</h2>
      </div>
      <div class="status-chip" :class="{ degraded: !isArchitectureEfficient }">
        <Icon :name="isArchitectureEfficient ? 'mdi:check-decagram-outline' : 'mdi:alert-circle-outline'" />
        <span>{{ architectureEfficiency }}</span>
      </div>
    </header>

    <div class="metrics-grid">
      <article
        v-for="metric in metrics"
        :key="metric.label"
        class="metric-tile"
      >
        <div class="metric-icon">
          <Icon :name="metric.icon" />
        </div>
        <div class="metric-copy">
          <p>{{ metric.label }}</p>
          <strong>{{ metric.value }}</strong>
        </div>
      </article>
    </div>

    <div class="signal-grid">
      <article class="signal-tile accent-rp">
        <div>
          <p>{{ $t('common.rpVersionBonus') }}</p>
          <strong>+{{ rpVersionBonus }}%</strong>
        </div>
        <span class="signal-bar" />
      </article>

      <article class="signal-tile" :class="isArchitectureEfficient ? 'accent-ok' : 'accent-warning'">
        <div>
          <p>{{ $t('common.architectureEfficiency') }}</p>
          <strong>{{ architectureEfficiency }}</strong>
        </div>
        <span class="signal-bar" />
      </article>
    </div>

    <article class="overhead-detail" :class="{ active: !isArchitectureEfficient }">
      <header>
        <div>
          <p class="detail-kicker">{{ $t('common.architecturalOverhead') }}</p>
          <h3>{{ overheadStatus }}</h3>
        </div>
        <Icon :name="isArchitectureEfficient ? 'mdi:shield-check-outline' : 'mdi:alert-decagram-outline'" />
      </header>

      <div class="detail-grid">
        <div>
          <span>{{ $t('common.currentAiCores') }}</span>
          <b>{{ formatNumber(aiCoreCount) }}</b>
        </div>
        <div>
          <span>{{ $t('common.overheadThreshold') }}</span>
          <b>{{ prestigeThresholds.ARCHITECTURAL_OVERHEAD_AI_CORES }}</b>
        </div>
        <div>
          <span>{{ $t('common.currentOutputMultiplier') }}</span>
          <b>{{ architectureEfficiency }}</b>
        </div>
        <div>
          <span>{{ $t('common.apiMitigation') }}</span>
          <b>{{ apiMitigation }}</b>
        </div>
      </div>

      <p>{{ $t('common.architecturalOverheadDescription') }}</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '~/store/game'
import { formatNumber } from '~/utils/format'
import { prestigeThresholds } from '~~/game/configs'

const gameStore = useGameStore()
const { t } = useI18n()

const architectureEfficiency = computed(() => `${(gameStore.architecturalOverheadPenalty * 100).toFixed(1)}%`)
const isArchitectureEfficient = computed(() => gameStore.architecturalOverheadPenalty >= 1)
const rpVersionBonus = computed(() => formatNumber(gameStore.rpBonus.minus(1).times(100)))
const aiCoreCount = computed(() => gameStore.generators[7]?.bought ?? 0)
const overheadStatus = computed(() =>
  isArchitectureEfficient.value ? t('common.overheadNotTriggered') : t('common.overheadTriggered')
)
const apiMitigation = computed(() =>
  gameStore.paradigms.api_interface ? t('common.apiMitigationActive') : t('common.apiMitigationInactive')
)

const metrics = computed(() => [
  {
    label: t('common.totalRefactors'),
    value: formatNumber(gameStore.refactorCount),
    icon: 'mdi:source-branch',
  },
  {
    label: t('common.totalRefactorPoints'),
    value: formatNumber(gameStore.refactorPoints),
    icon: 'mdi:hexagon-multiple-outline',
  },
  {
    label: t('common.currentVersion'),
    value: formatNumber(gameStore.version),
    icon: 'mdi:tag-outline',
  },
  {
    label: t('common.cps'),
    value: formatNumber(gameStore.cps),
    icon: 'mdi:pulse',
  },
])
</script>

<style scoped>
.stats-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(56, 153, 250, 0.18);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(13, 26, 40, 0.96), rgba(8, 15, 24, 0.98)),
    radial-gradient(circle at 12% 0%, rgba(56, 153, 250, 0.14), transparent 34%);
  box-shadow: 0 0 20px rgba(56, 153, 250, 0.06), inset 0 0 36px rgba(0, 0, 0, 0.35);
  padding: 14px;
}

.stats-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 5px,
    rgba(255, 255, 255, 0.018) 5px,
    rgba(255, 255, 255, 0.018) 6px
  );
}

.stats-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(56, 153, 250, 0.12);
  padding-bottom: 12px;
}

.stats-kicker {
  color: #3899fa;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  opacity: 0.82;
}

.stats-header h2 {
  margin-top: 2px;
  color: #e5f3ff;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  border: 1px solid rgba(74, 222, 128, 0.28);
  border-radius: 999px;
  background: rgba(5, 46, 22, 0.38);
  color: #86efac;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0 10px;
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.32);
}

.status-chip.degraded {
  border-color: rgba(251, 146, 60, 0.34);
  background: rgba(67, 20, 7, 0.42);
  color: #fdba74;
  text-shadow: 0 0 8px rgba(251, 146, 60, 0.28);
}

.metrics-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.metric-tile {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  border: 1px solid rgba(56, 153, 250, 0.12);
  border-radius: 8px;
  background: rgba(16, 26, 35, 0.78);
  padding: 11px;
  box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.18);
}

.metric-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border: 1px solid rgba(56, 153, 250, 0.22);
  border-radius: 8px;
  background: rgba(56, 153, 250, 0.08);
  color: #7dd3fc;
  font-size: 1rem;
}

.metric-copy {
  min-width: 0;
}

.metric-copy p,
.signal-tile p {
  color: #8eadcc;
  font-size: 0.68rem;
  line-height: 1.2;
}

.metric-copy strong {
  display: block;
  overflow: hidden;
  color: #d1fae5;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.94rem;
  font-weight: 800;
  line-height: 1.35;
  text-overflow: ellipsis;
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.22);
  white-space: nowrap;
}

.signal-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.overhead-detail {
  position: relative;
  z-index: 1;
  margin-top: 10px;
  border: 1px solid rgba(56, 153, 250, 0.13);
  border-radius: 8px;
  background: rgba(7, 18, 28, 0.78);
  padding: 12px;
}

.overhead-detail.active {
  border-color: rgba(251, 146, 60, 0.28);
}

.overhead-detail header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.detail-kicker {
  color: #3899fa;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.overhead-detail h3 {
  color: #e5f3ff;
  font-size: 0.92rem;
  font-weight: 900;
}

.overhead-detail.active h3,
.overhead-detail.active > header .iconify {
  color: #fdba74;
}

.overhead-detail > header .iconify {
  color: #86efac;
  font-size: 1.2rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.detail-grid div {
  min-width: 0;
  border: 1px solid rgba(56, 153, 250, 0.1);
  border-radius: 8px;
  background: rgba(16, 26, 35, 0.62);
  padding: 8px;
}

.detail-grid span,
.overhead-detail > p {
  color: #8eadcc;
  font-size: 0.66rem;
  line-height: 1.4;
}

.detail-grid b {
  display: block;
  overflow: hidden;
  margin-top: 3px;
  color: #d1fae5;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.82rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.overhead-detail.active .detail-grid b {
  color: #fdba74;
}

.overhead-detail > p {
  margin-top: 10px;
}

.signal-tile {
  position: relative;
  overflow: hidden;
  min-height: 74px;
  border: 1px solid rgba(56, 153, 250, 0.13);
  border-radius: 8px;
  background: rgba(7, 18, 28, 0.78);
  padding: 12px;
}

.signal-tile strong {
  display: block;
  margin-top: 4px;
  color: #e0f2fe;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 1.1rem;
  line-height: 1.2;
  text-shadow: 0 0 10px rgba(56, 153, 250, 0.24);
}

.signal-bar {
  position: absolute;
  inset-inline: 12px;
  bottom: 9px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, #3899fa, transparent);
  opacity: 0.8;
}

.accent-rp .signal-bar {
  background: linear-gradient(90deg, transparent, #a78bfa, #3899fa, transparent);
}

.accent-ok .signal-bar {
  background: linear-gradient(90deg, transparent, #4ade80, transparent);
}

.accent-warning {
  border-color: rgba(251, 146, 60, 0.22);
}

.accent-warning strong {
  color: #fdba74;
  text-shadow: 0 0 10px rgba(251, 146, 60, 0.25);
}

.accent-warning .signal-bar {
  background: linear-gradient(90deg, transparent, #fb923c, transparent);
}

@media (max-width: 420px) {
  .stats-panel {
    padding: 12px;
  }

  .stats-header {
    align-items: flex-start;
  }

  .metrics-grid,
  .signal-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
