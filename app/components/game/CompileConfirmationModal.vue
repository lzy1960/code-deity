<template>
  <Transition name="modal-panel">
    <div v-if="modal.isRevealed.value && modal.preview.value" class="modal-backdrop" @click.self="modal.hide()">
      <section class="system-modal">
        <header class="modal-header">
          <div>
            <p>RELEASE CONFIRM</p>
            <h2>
              <Icon name="mdi:upload-network-outline" />
              {{ $t('common.confirmCompileRelease') }}
            </h2>
          </div>
        </header>

        <p class="modal-copy">{{ $t('common.compileReleaseEventDescription') }}</p>

        <div class="version-readout">
          <span>{{ $t('common.compileReleaseNewVersion') }}</span>
          <strong>{{ modal.preview.value.currentVersion }} <Icon name="mdi:arrow-right" /> {{ modal.preview.value.nextVersion }}</strong>
        </div>

        <div class="metric-grid">
          <div>
            <span>{{ $t('common.remainingRefactorPoints') }}</span>
            <b>{{ formatNumber(modal.preview.value.currentRefactorPoints) }}</b>
            <Icon name="mdi:arrow-right" />
            <strong>{{ formatNumber(modal.preview.value.remainingRefactorPoints) }}</strong>
          </div>
          <div>
            <span>{{ $t('common.currentBonus') }}</span>
            <b>+{{ modal.preview.value.currentRpBonus.minus(1).times(100).toFixed(0) }}%</b>
            <Icon name="mdi:arrow-right" />
            <strong>+{{ modal.preview.value.projectedRpBonus.minus(1).times(100).toFixed(0) }}%</strong>
          </div>
          <div>
            <span>{{ $t('common.breakthroughReadiness') }}</span>
            <b>{{ modal.preview.value.readinessBefore.toFixed(0) }}</b>
            <Icon name="mdi:arrow-right" />
            <strong>{{ modal.preview.value.readinessAfter.toFixed(0) }}</strong>
          </div>
        </div>

        <p v-if="bonusDropsAfterCompile" class="warning-copy">
          {{ $t('common.compileBonusDropWarning') }}
        </p>

        <div v-if="unlockChips.length > 0" class="unlock-panel">
          <span>{{ $t('common.unlocksAfterCompile') }}</span>
          <div class="unlock-chip-row">
            <b v-for="chip in unlockChips" :key="chip">{{ chip }}</b>
          </div>
        </div>

        <footer class="action-row">
          <button class="secondary-action" @click="modal.hide()">{{ $t('common.cancel') }}</button>
          <button class="primary-action" @click="modal.confirm()">{{ $t('common.confirm') }}</button>
        </footer>
      </section>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCompileConfirmationModal } from '~/composables/useCompileConfirmationModal'
import { formatNumber } from '~/utils/format'

const modal = useCompileConfirmationModal()
const { t } = useI18n()

const bonusDropsAfterCompile = computed(() => {
  if (!modal.preview.value) return false
  return modal.preview.value.projectedRpBonus.lt(modal.preview.value.currentRpBonus)
})

const unlockChips = computed(() => {
  if (!modal.preview.value) return []

  const chips: string[] = []
  if (modal.preview.value.unlockAutomation) chips.push(t('common.automation'))
  if (modal.preview.value.unlockChallenges) chips.push(t('common.challenges'))
  chips.push(t('common.breakthroughReadinessGainChip', { amount: 20 }))
  return chips
})
</script>

<style scoped>
.modal-panel-enter-active,
.modal-panel-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.modal-panel-enter-from,
.modal-panel-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(8px);
  padding: 16px;
}

.system-modal {
  width: min(100%, 480px);
  border: 1px solid rgba(76, 165, 255, 0.28);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(19, 37, 54, 0.98), rgba(12, 23, 34, 0.98)),
    radial-gradient(circle at 12% 0%, rgba(45, 212, 191, 0.14), transparent 36%);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.42), inset 0 0 36px rgba(0, 0, 0, 0.26);
  padding: 16px;
}

.modal-header {
  border-bottom: 1px solid rgba(76, 165, 255, 0.18);
  padding-bottom: 12px;
}

.modal-header p {
  color: #4ca5ff;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.modal-header h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 3px;
  color: #f8fbff;
  font-size: 1rem;
  font-weight: 900;
}

.modal-copy {
  margin: 12px 0;
  color: #b9cde0;
  font-size: 0.76rem;
  line-height: 1.55;
}

.version-readout {
  border: 1px solid rgba(45, 212, 191, 0.24);
  border-radius: 8px;
  background: rgba(4, 15, 18, 0.56);
  padding: 14px;
  text-align: center;
}

.version-readout span,
.metric-grid span {
  color: #b9cde0;
  font-size: 0.7rem;
}

.version-readout strong {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  color: #ccfbf1;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 1.4rem;
}

.metric-grid {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}

.metric-grid div {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(76, 165, 255, 0.16);
  border-radius: 8px;
  background: rgba(16, 26, 35, 0.7);
  padding: 10px;
}

.metric-grid span {
  grid-column: 1 / -1;
}

.metric-grid b,
.metric-grid strong {
  overflow: hidden;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-grid b {
  color: #8ba2b7;
}

.metric-grid strong {
  color: #f8fbff;
}

.metric-grid .iconify {
  color: #4ca5ff;
}

.warning-copy {
  margin-top: 10px;
  border: 1px solid rgba(251, 146, 60, 0.24);
  border-radius: 8px;
  background: rgba(67, 20, 7, 0.32);
  color: #fdba74;
  font-size: 0.74rem;
  font-weight: 800;
  line-height: 1.5;
  padding: 10px;
}

.unlock-panel {
  margin-top: 10px;
  border: 1px solid rgba(134, 239, 172, 0.18);
  border-radius: 8px;
  background: rgba(5, 46, 22, 0.2);
  padding: 10px;
}

.unlock-panel span {
  display: block;
  color: #b9cde0;
  font-size: 0.7rem;
}

.unlock-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.unlock-chip-row b {
  border: 1px solid rgba(134, 239, 172, 0.22);
  border-radius: 999px;
  background: rgba(20, 83, 45, 0.35);
  color: #dcfce7;
  font-size: 0.68rem;
  font-weight: 900;
  padding: 5px 9px;
}

.action-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.secondary-action,
.primary-action {
  min-height: 40px;
  border-radius: 8px;
  font-size: 0.84rem;
  font-weight: 900;
  transition: border-color 0.18s ease, background-color 0.18s ease;
}

.secondary-action {
  border: 1px solid rgba(142, 173, 204, 0.26);
  background: rgba(15, 23, 42, 0.56);
  color: #cfe3f5;
}

.primary-action {
  border: 1px solid rgba(76, 165, 255, 0.44);
  background: linear-gradient(180deg, rgba(56, 153, 250, 0.34), rgba(28, 112, 190, 0.3));
  color: #fff;
}
</style>
