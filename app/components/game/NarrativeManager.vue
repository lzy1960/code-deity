<script setup lang="ts">
import { useGameStore } from '~/store/game'
import type { NarrativeMilestone } from '~/game/configs'

const gameStore = useGameStore()

const visibleNarratives = ref<NarrativeMilestone[]>([])

// Watch for new narratives being pushed to the queue
watch(() => gameStore.narrativeQueue.length, (newLength) => {
  if (newLength > 0) {
    // Display one narrative at a time
    if (visibleNarratives.value.length === 0) {
      const narrative = gameStore.shiftNarrativeQueue()
      if (narrative) {
        displayNarrative(narrative)
      }
    }
  }
})

function displayNarrative(narrative: NarrativeMilestone) {
  visibleNarratives.value.push(narrative)

  // Hide the narrative after a delay
  setTimeout(() => {
    visibleNarratives.value = visibleNarratives.value.filter(n => n.id !== narrative.id)
    
    // Check if there are more narratives to display after a short pause
    setTimeout(() => {
      const nextNarrative = gameStore.shiftNarrativeQueue()
      if (nextNarrative) {
        displayNarrative(nextNarrative)
      }
    }, 500) // 0.5s pause between narratives

  }, 5000) // Show each narrative for 5 seconds
}

</script>

<template>
  <div class="narrative-container">
    <TransitionGroup name="narrative-slide">
      <div v-for="narrative in visibleNarratives" :key="narrative.id" class="narrative-item">
        <p class="narrative-text">{{ narrative.text }}</p>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.narrative-container {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 600px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.narrative-item {
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
}

.narrative-text {
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 1rem;
  text-align: center;
}

/* --- Transition for slide-down effect --- */
.narrative-slide-enter-active,
.narrative-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.narrative-slide-enter-from,
.narrative-slide-leave-to {
  opacity: 0;
  transform: scale(0.5);
  filter: blur(10px);
}
</style>
