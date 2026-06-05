<template>
  <section class="automation-panel">
    <header class="section-header">
      <div>
        <p>AUTOMATION BUS</p>
        <h2>{{ $t('common.automation') }}</h2>
      </div>
      <span>{{ activeAutomators }}/{{ unlockedGenerators.length }}</span>
    </header>

    <p class="section-hint">{{ $t('common.automationHint') }}</p>

    <div class="automator-list">
      <article v-for="generator in unlockedGenerators" :key="generator.id" class="automator-row">
        <div class="generator-mark">G{{ generator.id }}</div>
        <div class="automator-copy">
          <p>{{ $t('common.autoBuy') }}</p>
          <strong>{{ getLocalizedGameName(generatorConfig(generator.id).name, $i18n.locale) }}</strong>
        </div>

        <label class="terminal-switch">
          <input
            type="checkbox"
            :checked="gameStore.automatorStates[generator.id]"
            @change="toggleAutomator(generator.id)"
          >
          <span>
            <i />
          </span>
        </label>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '~/store/game'
import { getLocalizedGameName } from '~/utils/format'

const gameStore = useGameStore()
const { $saveGameLocal } = useNuxtApp() as any

const unlockedGenerators = computed(() => 
  gameStore.generators.filter(g => gameStore.isGeneratorUnlocked(g.id))
)

const activeAutomators = computed(() =>
  unlockedGenerators.value.filter(g => gameStore.automatorStates[g.id]).length
)

const generatorConfig = (id: number) => gameStore.generatorConfig(id)

const toggleAutomator = (id: number) => {
  gameStore.toggleAutomator(id)
  $saveGameLocal()
}
</script>

<style scoped>
.automation-panel {
  display: grid;
  gap: 10px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(56, 153, 250, 0.18);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(13, 26, 40, 0.92), rgba(8, 15, 24, 0.94)),
    radial-gradient(circle at 0% 0%, rgba(56, 153, 250, 0.12), transparent 36%);
  padding: 12px 14px;
}

.section-header p {
  color: #3899fa;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.section-header h2 {
  color: #e5f3ff;
  font-size: 1rem;
  font-weight: 800;
}

.section-header span {
  color: #86efac;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-weight: 900;
}

.section-hint {
  color: #8eadcc;
  font-size: 0.76rem;
  line-height: 1.5;
}

.automator-list {
  display: grid;
  gap: 8px;
}

.automator-row {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(56, 153, 250, 0.12);
  border-radius: 8px;
  background: rgba(16, 26, 35, 0.72);
  padding: 10px;
  box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.16);
}

.generator-mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  border: 1px solid rgba(56, 153, 250, 0.2);
  border-radius: 8px;
  background: rgba(56, 153, 250, 0.08);
  color: #7dd3fc;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.68rem;
  font-weight: 900;
}

.automator-copy {
  min-width: 0;
  flex: 1;
}

.automator-copy p {
  color: #8eadcc;
  font-size: 0.66rem;
}

.automator-copy strong {
  display: block;
  overflow: hidden;
  color: #e5f3ff;
  font-size: 0.84rem;
  font-weight: 800;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.terminal-switch {
  position: relative;
  flex: 0 0 auto;
  cursor: pointer;
}

.terminal-switch input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.terminal-switch span {
  position: relative;
  display: block;
  width: 48px;
  height: 26px;
  border: 1px solid rgba(142, 173, 204, 0.24);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.78);
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.terminal-switch i {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #8eadcc;
  box-shadow: 0 0 8px rgba(142, 173, 204, 0.28);
  transition: transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.terminal-switch input:checked + span {
  border-color: rgba(74, 222, 128, 0.36);
  background: rgba(5, 46, 22, 0.42);
  box-shadow: 0 0 14px rgba(74, 222, 128, 0.12);
}

.terminal-switch input:checked + span i {
  background: #86efac;
  box-shadow: 0 0 10px rgba(74, 222, 128, 0.46);
  transform: translateX(22px);
}
</style>
