<template>
  <Transition name="modal-fade">
    <div v-if="modal.isRevealed.value" class="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm font-mono" @click.self="modal.hide()">
      <!-- Header -->
      <div class="flex-shrink-0 px-4 py-2 flex items-center justify-between border-b border-green-500/20">
        <div class="text-green-400">[GENESIS_LOG]</div>
        <button @click="modal.hide()" class="text-red-400 hover:text-red-300">
          <Icon name="mdi:close-box" class="h-8 w-8" />
        </button>
      </div>

      <!-- Log Display -->
      <div ref="logContainer" class="flex-1 p-4 overflow-y-auto space-y-2 text-green-400 text-base">
        <div v-for="(entry, index) in displayedLog" :key="entry.id">
          <span class="text-gray-500 select-none">> </span>
          <span v-if="index === displayedLog.length - 1 && isTyping">{{ typingBuffer }}</span>
          <span v-else>{{ $t(entry.textKey) }}</span>
        </div>
      </div>

      <!-- Footer / Command Bar -->
      <div class="flex-shrink-0 px-4 py-2 flex items-center justify-center gap-4 border-t border-green-500/20">
        <button @click="scrollToOrigin" class="border border-green-500/50 px-3 py-1 rounded text-green-400 hover:bg-green-500/20">[SCROLL_TO_ORIGIN]</button>
        <button @click="scrollToLatest" class="border border-green-500/50 px-3 py-1 rounded text-green-400 hover:bg-green-500/20">[SCROLL_TO_LATEST]</button>
      </div>
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
      typingTimeout = setTimeout(typeChar, 30);
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
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
