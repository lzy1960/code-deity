<template>
  <section class="system-panel deploy-panel">
    <header class="panel-header">
      <div>
        <p class="panel-kicker">RELEASE PIPELINE</p>
        <h2>{{ $t('common.compileRelease') }}</h2>
      </div>
      <span class="status-chip" :class="{ locked: !canCompile }">
        <Icon :name="canCompile ? 'mdi:package-variant-closed-check' : 'mdi:lock-outline'" />
        {{ canCompile ? 'READY' : 'WAITING' }}
      </span>
    </header>

    <div class="release-readout">
      <p>{{ $t('common.compileReleaseNewVersion') }}</p>
      <strong>+1</strong>
      <span>{{ $t('common.version') }}</span>
    </div>

    <div class="deploy-meta">
      <div>
        <span>{{ $t('common.currentVersion') }}</span>
        <b>{{ version }}</b>
      </div>
      <div>
        <span>{{ $t('common.cost') }}</span>
        <b class="cost">{{ formatNumber(cost) }} RP</b>
      </div>
    </div>

    <button
      class="panel-button"
      :class="{ disabled: !canCompile }"
      :disabled="!canCompile"
      @click="$emit('compileAndRelease')"
    >
      <Icon name="mdi:upload-network-outline" />
      <span>{{ $t('common.compileRelease') }}</span>
    </button>

    <p v-if="!canCompile && version === 0" class="unlock-hint">
      {{ $t('common.firstCompileHint') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import type Decimal from 'break_infinity.js'
import { formatNumber } from '~/utils/format'

defineProps<{
  version: number
  cost: Decimal
  canCompile: boolean
}>()

defineEmits(['compileAndRelease'])
</script>

<style scoped>
.system-panel {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(56, 153, 250, 0.18);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(13, 26, 40, 0.96), rgba(8, 15, 24, 0.98)),
    radial-gradient(circle at 18% 0%, rgba(45, 212, 191, 0.12), transparent 34%);
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
.release-readout,
.deploy-meta,
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
  color: #38bdf8;
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
  border: 1px solid rgba(45, 212, 191, 0.3);
  border-radius: 999px;
  background: rgba(20, 83, 75, 0.32);
  color: #99f6e4;
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

.release-readout {
  margin-top: 16px;
  border: 1px solid rgba(45, 212, 191, 0.16);
  border-radius: 8px;
  background: rgba(4, 15, 18, 0.52);
  padding: 16px;
  text-align: center;
}

.release-readout p,
.release-readout span,
.deploy-meta span,
.unlock-hint {
  color: #8eadcc;
  font-size: 0.72rem;
}

.release-readout strong {
  display: block;
  color: #ccfbf1;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: clamp(2.4rem, 12vw, 4rem);
  line-height: 1;
  margin: 5px 0;
  text-shadow: 0 0 18px rgba(45, 212, 191, 0.28);
}

.deploy-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 12px 0;
}

.deploy-meta div {
  border: 1px solid rgba(56, 153, 250, 0.12);
  border-radius: 8px;
  background: rgba(16, 26, 35, 0.68);
  padding: 10px;
}

.deploy-meta b {
  display: block;
  overflow: hidden;
  color: #d1fae5;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.86rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deploy-meta .cost {
  color: #fdba74;
}

.panel-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 42px;
  border: 1px solid rgba(45, 212, 191, 0.38);
  border-radius: 8px;
  background: rgba(45, 212, 191, 0.16);
  color: #e5f3ff;
  font-size: 0.85rem;
  font-weight: 800;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.panel-button:not(.disabled):hover {
  border-color: rgba(153, 246, 228, 0.58);
  background: rgba(45, 212, 191, 0.25);
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
