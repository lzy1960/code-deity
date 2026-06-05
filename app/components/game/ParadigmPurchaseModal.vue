<template>
  <Transition name="modal-panel">
    <div
      v-if="modal.isRevealed.value"
      class="modal-backdrop"
      @click.self="modal.hide()"
    >
      <section class="system-modal">
        <header class="modal-header">
          <p>PARADIGM UNLOCK</p>
          <h2>{{ $t('paradigmModal.title') }}</h2>
        </header>

        <div v-if="modal.paradigmToPurchase.value" class="paradigm-readout">
          <p>{{ $t('paradigms.' + modal.paradigmToPurchase.value.id + '.name') }}</p>
          <span>{{ $t('paradigms.' + modal.paradigmToPurchase.value.id + '.description') }}</span>
          <b>{{ $t('common.cost') }}: {{ modal.paradigmToPurchase.value.cost }} SP</b>
        </div>

        <div v-if="analysis && (!analysis.purchasable || analysis.conflictingParadigm)" class="analysis-box" :class="analysisTone">
          <p>
            <Icon :name="analysisIcon" />
            {{ analysisTitle }}
          </p>
          <span>{{ analysisText }}</span>
        </div>

        <p v-else class="modal-copy">
          {{ $t('paradigmModal.info') }}
        </p>

        <footer class="action-row">
          <button class="secondary-action" @click="modal.hide()">
            {{ $t('common.cancel') }}
          </button>
          <button
            class="primary-action"
            @click="modal.confirm()"
            :disabled="!!(analysis && !analysis.purchasable)"
          >
            {{ (analysis && !analysis.purchasable) ? $t('paradigmModal.cannotUnlock') : $t('paradigmModal.confirmUnlock') }}
          </button>
        </footer>
      </section>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useParadigmPurchaseModal } from '~/composables/useParadigmPurchaseModal'
import { useGameStore } from '~/store/game'

const modal = useParadigmPurchaseModal()
const gameStore = useGameStore()
const { t } = useI18n()

const analysis = computed(() => {
  if (!modal.paradigmToPurchase.value) return null
  return gameStore.paradigmPurchaseAnalysis(modal.paradigmToPurchase.value.id)
})

const analysisTitle = computed(() => {
  if (!analysis.value) return ''
  switch (analysis.value.reason) {
    case 'school_limit': return t('paradigmModal.ruleRestriction')
    case 'exclusive': return t('paradigmModal.exclusiveChoiceWarning')
    default: return ''
  }
})

const analysisText = computed(() => {
  if (!analysis.value) return ''
  switch (analysis.value.reason) {
    case 'school_limit':
      return t('paradigmModal.schoolLimitInfo')
    case 'exclusive':
      const conflictingParadigmName = t(`paradigms.${analysis.value.conflictingParadigm}.name`)
      return t('paradigmModal.exclusiveChoiceInfo', { conflictingParadigmName })
    default:
      return ''
  }
})

const analysisTone = computed(() => {
  if (!analysis.value) return ''
  switch (analysis.value.reason) {
    case 'school_limit': return 'danger'
    case 'exclusive': return 'warning'
    default: return ''
  }
})

const analysisIcon = computed(() => {
  if (!analysis.value) return ''
  switch (analysis.value.reason) {
    case 'school_limit': return 'ph:scales-bold'
    case 'exclusive': return 'ph:warning-octagon-bold'
    default: return ''
  }
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
  margin-top: 3px;
  color: #f8fbff;
  font-size: 1rem;
  font-weight: 900;
}

.paradigm-readout,
.analysis-box {
  border-radius: 8px;
  margin-top: 12px;
  padding: 12px;
}

.paradigm-readout {
  border: 1px solid rgba(76, 165, 255, 0.18);
  background: rgba(16, 26, 35, 0.72);
}

.paradigm-readout p {
  color: #f8fbff;
  font-size: 0.92rem;
  font-weight: 900;
}

.paradigm-readout span,
.modal-copy,
.analysis-box span {
  color: #b9cde0;
  font-size: 0.76rem;
  line-height: 1.55;
}

.paradigm-readout span {
  display: block;
  margin-top: 5px;
}

.paradigm-readout b {
  display: inline-flex;
  margin-top: 10px;
  border: 1px solid rgba(134, 239, 172, 0.24);
  border-radius: 999px;
  background: rgba(4, 15, 18, 0.56);
  color: #dcfce7;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.72rem;
  padding: 5px 10px;
}

.modal-copy {
  margin: 12px 0 0;
}

.analysis-box {
  border: 1px solid rgba(250, 204, 21, 0.24);
  background: rgba(113, 63, 18, 0.18);
}

.analysis-box.danger {
  border-color: rgba(248, 113, 113, 0.28);
  background: rgba(127, 29, 29, 0.22);
}

.analysis-box p {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fde68a;
  font-size: 0.78rem;
  font-weight: 900;
}

.analysis-box.danger p {
  color: #fecaca;
}

.analysis-box span {
  display: block;
  margin-top: 6px;
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

.primary-action:disabled {
  cursor: not-allowed;
  border-color: rgba(142, 173, 204, 0.18);
  background: rgba(15, 23, 42, 0.56);
  color: #8ba2b7;
}
</style>
