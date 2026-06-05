<template>
  <Transition name="modal-panel">
    <div v-if="modal.isRevealed.value" class="modal-backdrop" @click.self="modal.hide()">
      <section class="system-modal">
        <header class="modal-header">
          <div>
            <p>GENESIS LOG</p>
            <h2>
              <Icon name="mdi:console-line" />
              {{ $t('common.genesisLog') }}
            </h2>
          </div>
          <button class="icon-close" @click="modal.hide()">
            <Icon name="mdi:close" />
          </button>
        </header>

        <div ref="logContainer" class="log-body">
          <div v-for="(entry, index) in displayedLog" :key="entry.id" class="log-entry">
            <span class="prompt">&gt;</span>
            <span v-if="index === displayedLog.length - 1 && isTyping">{{ typingBuffer }}</span>
            <span v-else>{{ $t(entry.textKey) }}</span>
          </div>
          <div v-if="displayedLog.length === 0" class="empty-log">
            {{ $t('common.noGenesisLog') }}
          </div>
        </div>

        <footer class="modal-footer">
          <button @click="scrollToOrigin">
            <Icon name="mdi:arrow-up" />
            {{ $t('common.scrollToOrigin') }}
          </button>
          <button @click="scrollToLatest">
            <Icon name="mdi:arrow-down" />
            {{ $t('common.scrollToLatest') }}
          </button>
        </footer>
      </section>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useGenesisLogModal } from '~/composables/useGenesisLogModal';
import { useGameStore } from '~/store/game';
import { narrativeMilestones, type NarrativeMilestone } from '~~/game/configs';

const modal = useGenesisLogModal();
const gameStore = useGameStore();
const { t } = useI18n()

const logContainer = ref<HTMLElement | null>(null);
const displayedLog = ref<NarrativeMilestone[]>([]);
const typingBuffer = ref('');
const isTyping = ref(false);
let typingTimeout: NodeJS.Timeout;

const scrollToBottom = () => {
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  });
};

const typeLogEntry = (entry: NarrativeMilestone) => {
  if (!entry) return;
  isTyping.value = true;
  typingBuffer.value = '';
  let charIndex = 0;
  const fullText = t(entry.textKey)

  const typeChar = () => {
    if (charIndex < fullText.length) {
      typingBuffer.value += fullText.charAt(charIndex);
      charIndex++;
      scrollToBottom();
      typingTimeout = setTimeout(typeChar, 18);
    } else {
      isTyping.value = false;
      // Once typing is done, the full entry is part of the displayedLog
      // so the final span can render it completely.
    }
  };

  typeChar();
};

watch(() => modal.isRevealed.value, (isRevealed) => {
  if (isRevealed) {
    clearTimeout(typingTimeout);
    isTyping.value = false;

    const unlockedMilestones = narrativeMilestones.filter(m => gameStore.unlockedNarratives.includes(m.id));
    const lastDisplayed = displayedLog.value[displayedLog.value.length - 1];
    const lastUnlocked = unlockedMilestones[unlockedMilestones.length - 1];

    // If a new milestone has been unlocked since last open
    if (lastUnlocked && (!lastDisplayed || lastDisplayed.id !== lastUnlocked.id)) {
      // Show all previous logs instantly
      displayedLog.value = unlockedMilestones.slice(0, -1);
      // Type out the last one
      nextTick(() => {
        displayedLog.value.push(lastUnlocked);
        typeLogEntry(lastUnlocked);
      });
    } else {
      // Otherwise, just show all unlocked logs instantly
      displayedLog.value = unlockedMilestones;
      scrollToBottom();
    }
  } else {
    clearTimeout(typingTimeout);
    isTyping.value = false;
  }
});

const scrollToOrigin = () => {
  if (logContainer.value) {
    logContainer.value.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const scrollToLatest = () => {
  if (logContainer.value) {
    logContainer.value.scrollTo({ top: logContainer.value.scrollHeight, behavior: 'smooth' });
  }
};

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
    radial-gradient(circle at 12% 0%, rgba(74, 222, 128, 0.08), transparent 34%);
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

.modal-header p {
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

.log-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 14px;
  color: #d1fae5;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.8rem;
}

.log-entry {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 8px;
  border-bottom: 1px solid rgba(56, 153, 250, 0.08);
  padding: 8px 0;
  line-height: 1.55;
}

.prompt {
  color: #3899fa;
  user-select: none;
}

.empty-log {
  border: 1px solid rgba(56, 153, 250, 0.12);
  border-radius: 8px;
  background: rgba(16, 26, 35, 0.68);
  color: #8eadcc;
  padding: 12px;
  text-align: center;
}

.modal-footer {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  border-top-width: 1px;
  padding: 12px 14px;
}

.modal-footer button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 38px;
  border: 1px solid rgba(56, 153, 250, 0.28);
  border-radius: 8px;
  background: rgba(56, 153, 250, 0.12);
  color: #e5f3ff;
  font-size: 0.78rem;
  font-weight: 800;
  transition: border-color 0.18s ease, background-color 0.18s ease;
}

.modal-footer button:hover {
  border-color: rgba(125, 211, 252, 0.52);
  background: rgba(56, 153, 250, 0.22);
}
</style>
