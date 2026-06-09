<template>
  <Transition name="modal-panel">
    <div v-if="gameStore.activeRefactoring" class="modal-backdrop">
      <section class="system-modal danger">
        <header class="modal-header">
          <p>TECH DEBT</p>
          <h3>
            <Icon name="mdi:alert-octagon" />
            {{ $t('common.technicalDebtRepayment') }}
          </h3>
        </header>

        <div class="debt-readout">
          <p>{{ $t('common.refactoringInProgress') }} <b>{{ paradigmName }}</b></p>
          <span>{{ $t('common.willRefund') }} <b class="positive">{{ formatNumber(gameStore.activeRefactoring.frozenSP) }}</b> SP</span>
          <span>{{ $t('common.needsRepayment') }} <b class="negative">{{ formatNumber(gameStore.activeRefactoring.cpCost) }}</b> CP</span>
          <span>{{ $t('common.currentlyHave') }} <b>{{ formatNumber(gameStore.currency) }}</b> CP</span>
          <span v-if="remainingCost.gt(0)">{{ $t('common.stillNeeds') }} <b class="negative">{{ formatNumber(remainingCost) }}</b> CP</span>
          <small>{{ $t('common.globalCpPenalty') }}</small>
        </div>

        <div class="frozen-list">
          <span>{{ $t('common.frozenSkills') }}</span>
          <div class="chip-list">
            <b v-for="name in frozenParadigmNames" :key="name">{{ name }}</b>
          </div>
        </div>

        <p class="debt-guidance" :class="{ ready: canConfirm }">
          {{ canConfirm ? $t('common.techDebtReadyHint') : $t('common.techDebtWaitHint') }}
        </p>

        <footer class="action-row">
          <button class="secondary-action" @click="gameStore.cancelParadigmRefactor">
            {{ $t('common.cancel') }}
          </button>
          <button
            class="danger-action"
            @click="gameStore.confirmParadigmRefactor"
            :disabled="!canConfirm"
          >
            {{ $t('common.confirmRepayment') }}
          </button>
        </footer>
      </section>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Decimal from 'break_infinity.js'
import { useGameStore } from '~/store/game'
import { formatNumber } from '~/utils/format'

const gameStore = useGameStore()

const paradigmName = computed(() => {
  if (!gameStore.activeRefactoring) return ''
  return $t('paradigms.' + gameStore.activeRefactoring!.paradigmId + '.name') || $t('common.unknownSkill')
})

const frozenParadigmNames = computed(() => {
  if (!gameStore.activeRefactoring) return []
  return gameStore.activeRefactoring.frozenParadigms.map((id) => $t('paradigms.' + id + '.name') || $t('common.unknownSkill'))
})

const canConfirm = computed(() => {
  if (!gameStore.activeRefactoring) return false
  return gameStore.currency.gte(gameStore.activeRefactoring.cpCost)
})

const remainingCost = computed(() => {
  if (!gameStore.activeRefactoring) return new Decimal(0)
  const remaining = gameStore.activeRefactoring.cpCost.minus(gameStore.currency)
  return remaining.gt(0) ? remaining : new Decimal(0)
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
  width: min(100%, 500px);
  border: 1px solid rgba(248, 113, 113, 0.28);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(38, 20, 24, 0.98), rgba(18, 18, 24, 0.98)),
    radial-gradient(circle at 12% 0%, rgba(248, 113, 113, 0.14), transparent 36%);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.42), inset 0 0 36px rgba(0, 0, 0, 0.26);
  padding: 16px;
}

.modal-header {
  border-bottom: 1px solid rgba(248, 113, 113, 0.18);
  padding-bottom: 12px;
}

.modal-header p {
  color: #f87171;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 3px;
  color: #fee2e2;
  font-size: 1rem;
  font-weight: 900;
}

.debt-readout {
  display: grid;
  gap: 7px;
  margin-top: 12px;
  border: 1px solid rgba(248, 113, 113, 0.18);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.44);
  padding: 12px;
}

.debt-readout p,
.debt-readout span {
  color: #cfe3f5;
  font-size: 0.82rem;
}

.debt-readout b {
  color: #fff;
}

.debt-readout .positive {
  color: #bbf7d0;
}

.debt-readout .negative {
  color: #fecaca;
}

.debt-readout small {
  color: #fde68a;
  font-size: 0.72rem;
}

.frozen-list {
  margin-top: 12px;
  border: 1px solid rgba(248, 113, 113, 0.14);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.32);
  padding: 12px;
}

.frozen-list > span {
  display: block;
  color: #fca5a5;
  font-size: 0.72rem;
  font-weight: 900;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.chip-list b {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(248, 113, 113, 0.16);
  border-radius: 999px;
  background: rgba(127, 29, 29, 0.32);
  color: #fee2e2;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 5px 9px;
}

.debt-guidance {
  margin-top: 12px;
  border: 1px solid rgba(250, 204, 21, 0.18);
  border-radius: 8px;
  background: rgba(113, 63, 18, 0.16);
  color: #fde68a;
  font-size: 0.74rem;
  font-weight: 700;
  line-height: 1.5;
  padding: 10px;
}

.debt-guidance.ready {
  border-color: rgba(74, 222, 128, 0.22);
  background: rgba(5, 46, 22, 0.18);
  color: #bbf7d0;
}

.action-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.secondary-action,
.danger-action {
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

.danger-action {
  border: 1px solid rgba(248, 113, 113, 0.34);
  background: rgba(127, 29, 29, 0.42);
  color: #fee2e2;
}

.danger-action:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
</style>
