<template>
  <Transition name="modal-panel">
    <div v-if="modal.isRevealed.value" class="modal-backdrop" @click.self="modal.hide()">
      <section class="system-modal settings-modal">
        <header class="modal-header">
          <div>
            <p>SYSTEM SETTINGS</p>
            <h2>{{ $t('common.settings') }}</h2>
          </div>
          <button class="icon-close" @click="modal.hide()">
            <Icon name="mdi:close" />
          </button>
        </header>

        <div class="modal-body">
          <section class="settings-row">
            <div>
              <p>{{ $t('common.language') }}</p>
              <span>{{ $t('common.current') }} {{ currentLocaleName }}</span>
            </div>
            <button @click="languageModal.show()" class="panel-action">
              {{ $t('common.switch') }}
            </button>
          </section>

          <section class="settings-row">
            <div>
              <p>{{ $t('onboarding.resetTour') }}</p>
              <span>{{ $t('onboarding.resetTourHint') }}</span>
            </div>
            <button @click="handleResetTour" class="panel-action">
              {{ $t('onboarding.resetTour') }}
            </button>
          </section>

          <section class="danger-panel">
            <div class="danger-header">
              <p>{{ $t('common.dangerZone') }}</p>
            </div>
            <div class="danger-body">
              <div>
                <p>{{ $t('common.wipeAllData') }}</p>
                <span>{{ $t('common.wipeDataHint') }}</span>
              </div>
              <button @click="wipeAllData" class="danger-action">
                {{ $t('common.wipeData') }}
              </button>
            </div>
          </section>
        </div>

        <footer class="modal-footer">
          <button class="primary-action" @click="modal.hide()">
            {{ $t('common.close') }}
          </button>
        </footer>
      </section>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useLanguageModal } from '~/composables/useLanguageModal'
import { useOnboarding } from '~/composables/useOnboarding'
import { useSettingsModal } from '~/composables/useSettingsModal'

const modal = useSettingsModal()
const languageModal = useLanguageModal()
const { resetTour } = useOnboarding()
const { locales, locale } = useI18n()
const { $wipeData } = useNuxtApp() as any

const currentLocaleName = computed(() => {
  const current = locales.value.find(l => l.code === locale.value)
  return current ? current.name : locale.value
})

const reloadIntoFreshShell = () => {
  window.location.href = '/'
}

const handleResetTour = () => {
  resetTour()
  modal.hide()
  reloadIntoFreshShell()
}

const wipeAllData = async () => {
  if (window.confirm($t('toast.wipeDataConfirm'))) {
    await $wipeData()
    resetTour()
    modal.hide()
    alert($t('toast.dataWiped'))
    reloadIntoFreshShell()
  }
}
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
  display: flex;
  flex-direction: column;
  width: min(100%, 560px);
  max-height: min(82vh, 760px);
  overflow: hidden;
  border: 1px solid rgba(56, 153, 250, 0.18);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(13, 26, 40, 0.96), rgba(8, 15, 24, 0.98)),
    radial-gradient(circle at 12% 0%, rgba(56, 153, 250, 0.11), transparent 34%);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.42), inset 0 0 36px rgba(0, 0, 0, 0.32);
}

.modal-header,
.modal-footer {
  flex: 0 0 auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(56, 153, 250, 0.14);
  padding: 14px;
}

.modal-header p {
  color: #3899fa;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.modal-header h2 {
  margin-top: 3px;
  color: #e5f3ff;
  font-size: 1rem;
  font-weight: 800;
}

.icon-close {
  display: grid;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 1px solid rgba(142, 173, 204, 0.18);
  border-radius: 8px;
  color: #8eadcc;
  transition: border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease;
}

.icon-close:hover {
  border-color: rgba(56, 153, 250, 0.34);
  background: rgba(56, 153, 250, 0.12);
  color: #e5f3ff;
}

.modal-body {
  display: grid;
  gap: 10px;
  overflow-y: auto;
  padding: 14px;
}

.settings-row,
.danger-panel {
  overflow: hidden;
  border: 1px solid #253f56;
  border-radius: 8px;
  background: rgba(13, 25, 36, 0.88);
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
}

.settings-row p,
.danger-body p {
  color: #e5f3ff;
  font-size: 0.78rem;
  font-weight: 800;
}

.settings-row span,
.danger-body span {
  display: block;
  margin-top: 3px;
  color: #8eadcc;
  font-size: 0.68rem;
  line-height: 1.45;
}

.panel-action,
.danger-action,
.primary-action {
  flex: 0 0 auto;
  min-height: 34px;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0 12px;
  transition: border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease;
}

.panel-action,
.primary-action {
  border: 1px solid #3d6f92;
  background: #12304a;
  color: #e5f3ff;
}

.panel-action:hover,
.primary-action:hover {
  border-color: #5896c4;
  background: #173a55;
}

.danger-panel {
  border-color: #6b3030;
}

.danger-header {
  border-bottom: 1px solid #6b3030;
  background: #2a1418;
  padding: 9px 12px;
}

.danger-header p {
  color: #fca5a5;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.danger-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
}

.danger-action {
  border: 1px solid #7a3d3d;
  background: #3a1b20;
  color: #fca5a5;
}

.danger-action:hover {
  border-color: #9a5555;
  background: #4a2026;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid rgba(56, 153, 250, 0.14);
  padding: 12px 14px 14px;
}

@media (max-width: 640px) {
  .settings-row,
  .danger-body {
    flex-direction: column;
    align-items: flex-start;
  }

  .panel-action,
  .danger-action,
  .primary-action {
    width: 100%;
    justify-content: center;
  }
}
</style>
