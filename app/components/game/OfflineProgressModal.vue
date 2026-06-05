<template>
  <teleport to="body">
    <Transition name="modal-panel">
      <div v-if="isRevealed" class="modal-backdrop">
        <section class="system-modal">
          <header class="modal-header">
            <p>OFFLINE BUILD</p>
            <h2>
              <Icon name="mdi:timer-sand" />
              {{ $t('common.welcomeBack') }}
            </h2>
          </header>

          <p class="modal-copy">{{ $t('common.offlineGainMessage') }}</p>

          <div class="gain-readout">
            <strong>+{{ formatNumber(cp) }}</strong>
            <span>{{ $t('common.computingPower') }} (CP)</span>
          </div>

          <button class="primary-action" @click="$emit('confirm')">
            {{ $t('common.confirmGains') }}
          </button>
        </section>
      </div>
    </Transition>
  </teleport>
</template>

<script setup lang="ts">
import type Decimal from 'break_infinity.js'
import { formatNumber } from '~/utils/format'

defineProps<{
  isRevealed: boolean
  cp?: Decimal | null
}>()

defineEmits<{
  confirm: []
}>()
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
  width: min(100%, 420px);
  overflow: hidden;
  border: 1px solid rgba(76, 165, 255, 0.28);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(19, 37, 54, 0.98), rgba(12, 23, 34, 0.98)),
    radial-gradient(circle at 12% 0%, rgba(76, 165, 255, 0.16), transparent 36%);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.42), inset 0 0 36px rgba(0, 0, 0, 0.26);
  color: #fff;
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
  justify-content: center;
  gap: 8px;
  margin-top: 3px;
  color: #f8fbff;
  font-size: 1rem;
  font-weight: 900;
}

.modal-copy {
  margin: 12px 0;
  color: #b9cde0;
  font-size: 0.78rem;
  line-height: 1.55;
  text-align: center;
}

.gain-readout {
  border: 1px solid rgba(134, 239, 172, 0.24);
  border-radius: 8px;
  background: rgba(4, 15, 18, 0.56);
  padding: 16px;
  text-align: center;
}

.gain-readout strong {
  display: block;
  color: #dcfce7;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 1.7rem;
  line-height: 1;
}

.gain-readout span {
  display: block;
  margin-top: 6px;
  color: #b9cde0;
  font-size: 0.72rem;
}

.primary-action {
  width: 100%;
  min-height: 42px;
  margin-top: 14px;
  border: 1px solid rgba(76, 165, 255, 0.44);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(56, 153, 250, 0.34), rgba(28, 112, 190, 0.3));
  color: #fff;
  font-size: 0.84rem;
  font-weight: 900;
}
</style>
