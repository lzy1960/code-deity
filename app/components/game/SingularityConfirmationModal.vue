<template>
  <Transition name="modal-panel">
    <div
      v-if="modal.isRevealed.value"
      class="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      @click.self="modal.hide()"
    >
      <section class="system-modal w-full max-w-[440px] rounded-lg border border-[#4ca5ff]/30 bg-[#132536] p-4 shadow-2xl">
        <header class="modal-header border-b border-[#4ca5ff]/20 pb-3">
          <p class="font-mono text-[0.62rem] font-black tracking-[0.12em] text-[#4ca5ff]">SINGULARITY RESET</p>
          <h2 class="mt-1 flex items-center gap-2 text-base font-black text-[#f8fbff]">
            <Icon name="mdi:creation" />
            {{ $t('singularity.confirmTitle') }}
          </h2>
        </header>

        <p class="modal-copy my-3 text-[0.78rem] leading-relaxed text-[#b9cde0]">
          <i18n-t keypath="singularity.description" tag="span">
            <template #keep><b class="keep font-black text-[#bbf7d0]">{{ $t('singularity.keepText') }}</b></template>
            <template #sp><span class="keep font-black text-[#bbf7d0]">{{ $t('singularity.spText') }}</span></template>
          </i18n-t>
        </p>
        <p class="warning-copy rounded-lg border border-yellow-300/25 bg-yellow-950/20 p-2.5 text-center text-[0.76rem] font-extrabold text-yellow-200">{{ $t('singularity.irreversible') }}</p>

        <footer class="action-row mt-3.5 grid grid-cols-2 gap-2.5">
          <button class="secondary-action min-h-10 rounded-lg border border-slate-300/25 bg-slate-950/50 text-sm font-black text-[#cfe3f5]" @click="modal.hide()">{{ $t('common.cancel') }}</button>
          <button class="primary-action min-h-10 rounded-lg border border-[#4ca5ff]/45 bg-[#3899fa]/30 text-sm font-black text-white" @click="modal.confirm()">{{ $t('common.confirm') }}</button>
        </footer>
      </section>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useSingularityModal } from '~/composables/useSingularityModal'

const modal = useSingularityModal()
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
  width: min(100%, 440px);
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
  font-size: 0.78rem;
  line-height: 1.6;
}

.keep {
  color: #bbf7d0;
  font-weight: 900;
}

.warning-copy {
  border: 1px solid rgba(250, 204, 21, 0.24);
  border-radius: 8px;
  background: rgba(113, 63, 18, 0.18);
  color: #fde68a;
  font-size: 0.76rem;
  font-weight: 800;
  padding: 10px;
  text-align: center;
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
</style>
