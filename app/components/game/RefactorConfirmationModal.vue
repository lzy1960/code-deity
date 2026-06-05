<template>
  <Transition name="modal-panel">
    <div v-if="modal.isRevealed.value && modal.gains.value" class="modal-backdrop" @click.self="modal.hide()">
      <section class="system-modal">
        <header class="modal-header">
          <div>
            <p>REFACTOR CONFIRM</p>
            <h2>
              <Icon name="mdi:source-branch-sync" />
              {{ $t('common.confirmRefactor') }}
            </h2>
          </div>
        </header>

        <p class="modal-copy">{{ $t('common.refactorEventDescription') }}</p>

        <div class="gain-readout">
          <span>{{ $t('common.gainFromRefactor') }}</span>
          <strong>+{{ formatNumber(modal.gains.value.potentialRpGain) }} RP</strong>
        </div>

        <div class="metric-grid">
          <div>
            <span>{{ $t('common.totalRefactorPoints') }}</span>
            <b>{{ formatNumber(modal.gains.value.currentRefactorPoints) }}</b>
            <Icon name="mdi:arrow-right" />
            <strong>{{ formatNumber(modal.gains.value.currentRefactorPoints.plus(modal.gains.value.potentialRpGain)) }}</strong>
          </div>
          <div>
            <span>{{ $t('common.currentBonus') }}</span>
            <b>+{{ modal.gains.value.currentRpBonus.minus(1).times(100).toFixed(0) }}%</b>
            <Icon name="mdi:arrow-right" />
            <strong>+{{ modal.gains.value.projectedRpBonus.minus(1).times(100).toFixed(0) }}%</strong>
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
import { useRefactorConfirmationModal } from '~/composables/useRefactorConfirmationModal'
import { formatNumber } from '~/utils/format'

const modal = useRefactorConfirmationModal()
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
  width: min(100%, 460px);
  border: 1px solid rgba(76, 165, 255, 0.28);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(19, 37, 54, 0.98), rgba(12, 23, 34, 0.98)),
    radial-gradient(circle at 12% 0%, rgba(76, 165, 255, 0.16), transparent 36%);
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

.gain-readout {
  border: 1px solid rgba(134, 239, 172, 0.24);
  border-radius: 8px;
  background: rgba(4, 15, 18, 0.56);
  padding: 14px;
  text-align: center;
}

.gain-readout span,
.metric-grid span {
  color: #b9cde0;
  font-size: 0.7rem;
}

.gain-readout strong {
  display: block;
  margin-top: 4px;
  color: #dcfce7;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 1.5rem;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
