<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '~/store/game'
import { useDraggable } from '@vueuse/core'

const gameStore = useGameStore()

// Menu visibility
const isExpanded = ref(false)

// Drag and drop functionality
const el = ref<HTMLElement | null>(null)
const handle = ref<HTMLElement | null>(null) // Create a ref for the handle

const { style } = useDraggable(el, {
  initialValue: { x: window.innerWidth - 250, y: 40 },
  handle: handle, // Pass the handle ref to useDraggable
})

// Input values - initialize them once
const cpInput = ref('1e500')
const rpInput = ref('10000')

function setCurrency() {
  gameStore._dev_setCurrency(cpInput.value)
}

function setRefactorPoints() {
  gameStore._dev_setRefactorPoints(rpInput.value)
}

// Manually refresh values from store
function refreshValues() {
  cpInput.value = gameStore.currency.toExponential(2)
  rpInput.value = gameStore.refactorPoints.toExponential(2)
}
</script>

<template>
  <div ref="el" :style="style" style="position: fixed;" class="bg-gray-800/80 backdrop-blur-md rounded-lg shadow-2xl text-white font-mono text-sm z-[2000]">
    <!-- Handle for dragging -->
    <div ref="handle" class="handle p-2 border-b border-white/10 flex items-center justify-between" style="touch-action: none;">
      <span class="font-bold">Dev Menu</span>
      <div>
        <button @click="refreshValues" title="Refresh values" class="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs mr-2">
          <Icon name="ph:arrows-clockwise-bold" />
        </button>
        <button @click="isExpanded = !isExpanded" class="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs">
          {{ isExpanded ? 'Hide' : 'Show' }}
        </button>
      </div>
    </div>

    <!-- Collapsible Content -->
    <Transition name="expand">
      <div v-if="isExpanded" class="p-3 space-y-3">
        <!-- CP Input -->
        <div class="space-y-1">
          <label for="cp-input" class="text-xs text-gray-400">CP (Currency)</label>
          <div class="flex gap-2">
            <input id="cp-input" v-model="cpInput" type="text" class="w-full bg-gray-900 rounded px-2 py-1 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <button @click="setCurrency" class="px-3 rounded bg-blue-600 hover:bg-blue-500 text-xs font-bold">Set</button>
          </div>
        </div>

        <!-- RP Input -->
        <div class="space-y-1">
          <label for="rp-input" class="text-xs text-gray-400">RP (Refactor Points)</label>
          <div class="flex gap-2">
            <input id="rp-input" v-model="rpInput" type="text" class="w-full bg-gray-900 rounded px-2 py-1 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-500">
            <button @click="setRefactorPoints" class="px-3 rounded bg-cyan-600 hover:bg-cyan-500 text-xs font-bold">Set</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.handle {
  cursor: move;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}
</style>
