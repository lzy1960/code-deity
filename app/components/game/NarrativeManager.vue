<script setup lang="ts">
import { useGameStore } from '~/store/game'
import type { NarrativeMilestone } from '~~/game/configs'

const gameStore = useGameStore()
const { t } = useI18n()

// State to hold the currently visible narrative and its displayed text
const currentNarrative = ref<NarrativeMilestone | null>(null)
const displayedText = ref('')

let typingInterval: any = null

// Watch for new narratives being pushed to the queue
watch(() => gameStore.narrativeQueue.length, (newLength, oldLength) => {
  // Start processing only when the queue was empty and a new item is added
  if (newLength > 0 && oldLength === 0) {
    processNextInQueue()
  }
})

const randomDelay = computed(() => ({ '--random': Math.random() }))

function processNextInQueue() {
  if (currentNarrative.value) return // Already displaying something

  const narrative = gameStore.shiftNarrativeQueue()
  if (narrative) {
    currentNarrative.value = narrative
    startTypewriter(narrative.textKey)
  }
}

function startTypewriter(textKey: string) {
  const fullText = t(textKey)
  let charIndex = 0
  displayedText.value = ''
  clearInterval(typingInterval)

  typingInterval = setInterval(() => {
    if (charIndex < fullText.length) {
      displayedText.value += fullText.charAt(charIndex)
      charIndex++
    } else {
      clearInterval(typingInterval)
      // Narrative fully displayed, wait before hiding
      setTimeout(hideNarrative, 3500) // Keep visible for 3.5s after typing
    }
  }, 50) // Typing speed: 50ms per character
}

function hideNarrative() {
  currentNarrative.value = null
  // After hiding, wait a bit before showing the next one
  setTimeout(processNextInQueue, 700) // 0.7s pause between narratives
}

</script>

<template>
  <div class="narrative-container">
    <Transition name="narrative-slide">
      <div v-if="currentNarrative" :key="currentNarrative.id" class="narrative-item" :style="randomDelay">
        <div class="narrative-header">
          <div class="header-icon">
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25 35H75" stroke="currentColor" stroke-width="6" stroke-linecap="round" class="line-1"></path>
              <path d="M25 50H75" stroke="currentColor" stroke-width="6" stroke-linecap="round" class="line-2"></path>
              <path d="M25 65H50" stroke="currentColor" stroke-width="6" stroke-linecap="round" class="line-3"></path>
            </svg>
          </div>
          <span>[Genesis.log]:</span>
        </div>
        <p class="narrative-text">{{ displayedText }}<span class="caret"></span></p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.narrative-container {
  position: fixed;
  top: calc(20px + env(safe-area-inset-top));
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 600px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.narrative-item {
  position: relative;
  overflow: hidden; /* Needed for scanline pseudo-element */
  background-color: rgba(16, 26, 35, 0.85);
  backdrop-filter: blur(5px);
  color: #00ff89;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 4px 20px rgba(0, 255, 137, 0.1), 0 0 30px rgba(0, 255, 137, 0.1) inset;
  border: 1px solid rgba(0, 255, 137, 0.3);
  width: 100%;
  font-family: 'Courier New', Courier, monospace;
}

/* Scanline Effect */
.narrative-item::after {
  content: '';
  position: absolute;
  top: -50%; /* Start well above the element */
  left: 0;
  width: 100%;
  height: 3px;
  background: rgba(0, 255, 137, 0.2);
  animation: scanline 2s linear infinite;
  animation-delay: calc(var(--random) * -2s); /* Add random delay */
  box-shadow: 0 0 10px rgba(0, 255, 137, 0.3);
  will-change: top;
}

@keyframes scanline {
  from { top: -50%; }
  to { top: 150%; }
}

.narrative-header {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  color: #00ff89;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon svg {
  width: 20px;
  height: 20px;
  color: #00ff89;
}

.header-icon .line-1 { animation: flicker 1.5s linear infinite alternate; }
.header-icon .line-2 { animation: flicker 2s linear infinite alternate; }
.header-icon .line-3 { animation: flicker 1s linear infinite alternate; }

@keyframes flicker {
  0%, 19.9%, 22%, 62.9%, 64%, 100% { opacity: 1; }
  20%, 21.9%, 63%, 63.9% { opacity: 0.4; }
}

.narrative-text {
  margin: 0;
  font-size: 1rem;
  text-align: left;
  white-space: pre-wrap;
  line-height: 1.4;
}

.caret {
  display: inline-block;
  width: 9px;
  height: 1.2em;
  background-color: #00ff89;
  margin-left: 4px;
  box-shadow: 0 0 5px rgba(0, 255, 137, 0.8);
  animation: blink 0.9s steps(1) infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* --- Transition for slide-down effect --- */
.narrative-slide-enter-active,
.narrative-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.narrative-slide-enter-from,
.narrative-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}


</style>
