<template>
  <Transition name="modal-panel">
    <div v-if="modal.isRevealed.value" class="modal-backdrop" @click.self="modal.hide()">
      <section class="system-modal help-modal">
        <header class="modal-header">
          <div>
            <p>REFERENCE INDEX</p>
            <h2>
              <Icon name="mdi:help-circle-outline" />
              {{ $t('common.helpDocs') }}
            </h2>
          </div>
          <button class="icon-close" @click="modal.hide()">
            <Icon name="mdi:close" />
          </button>
        </header>

        <div class="modal-body">
              <!-- Core Resources -->
              <section class="help-group">
                <h3>{{ $t('common.coreResources') }}</h3>
                <div class="help-list">
                  <div class="help-item">
                    <dt>{{ $t('common.computingPower') }} (CP)</dt>
                    <dd>{{ $t('common.cpDescription') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isRefactorUnlocked">{{ $t('common.refactorPoints') }} (RP)</dt>
                    <dd v-if="gameStore.isRefactorUnlocked">{{ $t('common.rpDescription') }}</dd>
                    <dd v-else class="locked-copy">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isCompileUnlocked">{{ $t('common.version') }}</dt>
                    <dd v-if="gameStore.isCompileUnlocked">{{ $t('common.versionDescription') }}</dd>
                    <dd v-else class="locked-copy">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity">{{ $t('common.singularityPower') }} (SP)</dt>
                    <dd v-if="gameStore.unlockedSingularity">{{ $t('common.spDescription') }}</dd>
                    <dd v-else class="locked-copy">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity">{{ $t('common.genesisShards') }}</dt>
                    <dd class="locked-copy">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                </div>
              </section>

              <!-- Core Mechanics -->
              <section class="help-group">
                <h3>{{ $t('common.coreMechanicsEvents') }}</h3>
                <div class="help-list">
                  <div class="help-item">
                    <dt>{{ $t('common.generators') }}</dt>
                    <dd>{{ $t('common.generatorsDescription') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isRefactorUnlocked">{{ $t('common.refactor') }}</dt>
                    <dd v-if="gameStore.isRefactorUnlocked">{{ $t('common.refactorEventDescription') }}</dd>
                    <dd v-else class="locked-copy">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isCompileUnlocked">{{ $t('common.compileRelease') }}</dt>
                    <dd v-if="gameStore.isCompileUnlocked">{{ $t('common.compileReleaseEventDescription') }}</dd>
                    <dd v-else class="locked-copy">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isRefactorUnlocked">{{ $t('common.architecturalOverhead') }}</dt>
                    <dd v-if="gameStore.isRefactorUnlocked">{{ $t('common.architecturalOverheadDescription') }}</dd>
                    <dd v-else class="locked-copy">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity">{{ $t('common.singularity') }}</dt>
                    <dd v-if="gameStore.unlockedSingularity">{{ $t('common.singularityEventDescription') }}</dd>
                    <dd v-else class="locked-copy">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity">{{ $t('common.becomeGenesis') }}</dt>
                    <dd class="locked-copy">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity">{{ $t('common.technicalDebt') }}</dt>
                    <dd v-if="gameStore.unlockedSingularity">{{ $t('common.technicalDebtDescription') }}</dd>
                    <dd v-else class="locked-copy">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                </div>
              </section>

              <!-- Game Systems -->
              <section class="help-group">
                <h3>{{ $t('common.gameSystems') }}</h3>
                <div class="help-list">
                  <div class="help-item">
                    <dt v-if="gameStore.isChallengesUnlocked">{{ $t('common.challenges') }}</dt>
                    <dd v-if="gameStore.isChallengesUnlocked">{{ $t('common.challengesDescription') }}</dd>
                    <dd v-else class="locked-copy">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isAutomationUnlocked">{{ $t('common.automation') }}</dt>
                    <dd v-if="gameStore.isAutomationUnlocked">{{ $t('common.automationDescription') }}</dd>
                    <dd v-else class="locked-copy">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity">{{ $t('common.programmingParadigms') }}</dt>
                    <dd v-if="gameStore.unlockedSingularity">{{ $t('common.programmingParadigmsDescription') }}</dd>
                    <dd v-else class="locked-copy">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity">{{ $t('common.systemPatches') }}</dt>
                    <dd class="locked-copy">{{ $t('common.notUnlocked') }}</dd>
                  </div>
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
import { useHelpModal } from '~/composables/useHelpModal'
import { useGameStore } from '~/store/game'

const modal = useHelpModal()
const gameStore = useGameStore()
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
  width: min(100%, 720px);
  height: min(82vh, 760px);
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
  border-color: rgba(56, 153, 250, 0.14);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom-width: 1px;
  padding: 14px;
}

.modal-header p,
.help-group h3 {
  color: #3899fa;
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
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px;
}

.help-group + .help-group {
  margin-top: 16px;
}

.help-group h3 {
  border-bottom: 1px solid rgba(56, 153, 250, 0.14);
  padding-bottom: 8px;
}

.help-list {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.help-item {
  border: 1px solid rgba(56, 153, 250, 0.12);
  border-radius: 8px;
  background: rgba(16, 26, 35, 0.68);
  padding: 10px 12px;
}

.help-item dt {
  color: #e5f3ff;
  font-size: 0.78rem;
  font-weight: 800;
}

.help-item dd {
  margin-top: 3px;
  color: #8eadcc;
  font-size: 0.72rem;
  line-height: 1.5;
}

.locked-copy {
  color: #64748b;
  font-style: italic;
}

.modal-footer {
  border-top-width: 1px;
  padding: 12px 14px;
}

.primary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  border: 1px solid rgba(56, 153, 250, 0.38);
  border-radius: 8px;
  background: rgba(56, 153, 250, 0.18);
  color: #e5f3ff;
  font-size: 0.85rem;
  font-weight: 800;
  transition: border-color 0.18s ease, background-color 0.18s ease;
}

.primary-action:hover {
  border-color: rgba(125, 211, 252, 0.58);
  background: rgba(56, 153, 250, 0.28);
}
</style>
