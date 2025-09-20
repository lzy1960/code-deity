<template>
  <Transition name="modal-bounce">
    <div v-if="modal.isRevealed.value" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="modal.hide()">
      <div class="relative w-full max-w-2xl h-[80vh] m-4 rounded-2xl bg-transparent p-0 shadow-2xl shadow-cyan-500/20 overflow-hidden border border-cyan-500/20">
        <div class="animated-border"></div>
        <div class="relative z-10 rounded-[14px] bg-gray-900 m-[2px] h-full overflow-hidden">
          <div class="p-6 h-full flex flex-col">
            <h2 class="mb-4 text-center text-2xl font-bold text-cyan-300 shrink-0">
              <Icon name="mdi:help-circle" class="mr-2" />
              {{ $t('common.helpDocs') }}
            </h2>
            
            <div class="flex-1 overflow-y-auto pr-2 space-y-6 text-gray-300">
              <!-- Core Resources -->
              <div>
                <h3 class="text-lg font-bold text-cyan-400 mb-3 border-b border-cyan-500/30 pb-1">{{ $t('common.coreResources') }}</h3>
                <div class="space-y-3">
                  <div class="help-item">
                    <dt class="font-bold text-white">{{ $t('common.computingPower') }} (CP)</dt>
                    <dd class="text-sm">{{ $t('common.cpDescription') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isRefactorUnlocked" class="font-bold text-white">{{ $t('common.refactorPoints') }} (RP)</dt>
                    <dd v-if="gameStore.isRefactorUnlocked" class="text-sm">{{ $t('common.rpDescription') }}</dd>
                    <dd v-else class="text-sm text-gray-500 italic">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isCompileUnlocked" class="font-bold text-white">{{ $t('common.version') }}</dt>
                    <dd v-if="gameStore.isCompileUnlocked" class="text-sm">{{ $t('common.versionDescription') }}</dd>
                    <dd v-else class="text-sm text-gray-500 italic">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity" class="font-bold text-white">{{ $t('common.singularityPower') }} (SP)</dt>
                    <dd v-if="gameStore.unlockedSingularity" class="text-sm">{{ $t('common.spDescription') }}</dd>
                    <dd v-else class="text-sm text-gray-500 italic">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity" class="font-bold text-white">{{ $t('common.genesisShards') }}</dt>
                    <dd class="text-sm text-gray-500 italic">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                </div>
              </div>

              <!-- Core Mechanics -->
              <div>
                <h3 class="text-lg font-bold text-cyan-400 mb-3 border-b border-cyan-500/30 pb-1">{{ $t('common.coreMechanicsEvents') }}</h3>
                <div class="space-y-3">
                  <div class="help-item">
                    <dt class="font-bold text-white">{{ $t('common.generators') }}</dt>
                    <dd class="text-sm">{{ $t('common.generatorsDescription') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isRefactorUnlocked" class="font-bold text-white">{{ $t('common.refactor') }}</dt>
                    <dd v-if="gameStore.isRefactorUnlocked" class="text-sm">{{ $t('common.refactorEventDescription') }}</dd>
                    <dd v-else class="text-sm text-gray-500 italic">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isCompileUnlocked" class="font-bold text-white">{{ $t('common.compileRelease') }}</dt>
                    <dd v-if="gameStore.isCompileUnlocked" class="text-sm">{{ $t('common.compileReleaseEventDescription') }}</dd>
                    <dd v-else class="text-sm text-gray-500 italic">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isRefactorUnlocked" class="font-bold text-white">{{ $t('common.architecturalOverhead') }}</dt>
                    <dd v-if="gameStore.isRefactorUnlocked" class="text-sm">{{ $t('common.architecturalOverheadDescription') }}</dd>
                    <dd v-else class="text-sm text-gray-500 italic">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity" class="font-bold text-white">{{ $t('common.singularity') }}</dt>
                    <dd v-if="gameStore.unlockedSingularity" class="text-sm">{{ $t('common.singularityEventDescription') }}</dd>
                    <dd v-else class="text-sm text-gray-500 italic">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity" class="font-bold text-white">{{ $t('common.becomeGenesis') }}</dt>
                    <dd class="text-sm text-gray-500 italic">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity" class="font-bold text-white">{{ $t('common.technicalDebt') }}</dt>
                    <dd v-if="gameStore.unlockedSingularity" class="text-sm">{{ $t('common.technicalDebtDescription') }}</dd>
                    <dd v-else class="text-sm text-gray-500 italic">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                </div>
              </div>

              <!-- Game Systems -->
              <div>
                <h3 class="text-lg font-bold text-cyan-400 mb-3 border-b border-cyan-500/30 pb-1">{{ $t('common.gameSystems') }}</h3>
                <div class="space-y-3">
                  <div class="help-item">
                    <dt v-if="gameStore.isChallengesUnlocked" class="font-bold text-white">{{ $t('common.challenges') }}</dt>
                    <dd v-if="gameStore.isChallengesUnlocked" class="text-sm">{{ $t('common.challengesDescription') }}</dd>
                    <dd v-else class="text-sm text-gray-500 italic">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.isAutomationUnlocked" class="font-bold text-white">{{ $t('common.automation') }}</dt>
                    <dd v-if="gameStore.isAutomationUnlocked" class="text-sm">{{ $t('common.automationDescription') }}</dd>
                    <dd v-else class="text-sm text-gray-500 italic">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity" class="font-bold text-white">{{ $t('common.programmingParadigms') }}</dt>
                    <dd v-if="gameStore.unlockedSingularity" class="text-sm">{{ $t('common.programmingParadigmsDescription') }}</dd>
                    <dd v-else class="text-sm text-gray-500 italic">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                  <div class="help-item">
                    <dt v-if="gameStore.unlockedSingularity" class="font-bold text-white">{{ $t('common.systemPatches') }}</dt>
                    <dd class="text-sm text-gray-500 italic">{{ $t('common.notUnlocked') }}</dd>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 text-center shrink-0">
              <button
                class="rounded-lg bg-cyan-600 px-8 py-3 font-bold text-white shadow-lg shadow-cyan-600/30 transition-colors hover:bg-cyan-700"
                @click="modal.hide()"
              >
                {{ $t('common.close') }}
              </button>
            </div>
          </div>
        </div>
      </div>
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
.modal-bounce-enter-active,
.modal-bounce-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.modal-bounce-enter-from,
.modal-bounce-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.animated-border {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    transparent,
    rgba(34, 211, 238, 0.7), /* cyan-400 */
    transparent 35%
  );
  transform: translate(-50%, -50%);
  animation: rotate 5s cubic-bezier(0.65, -0.5, 0.25, 1.5) infinite;
  z-index: 0;
}

@keyframes rotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate(-50%, -50%) rotate(180deg) scale(1.1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg) scale(1);
    opacity: 0.7;
  }
}

.help-item {
  padding: 12px 16px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0));
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}
</style>