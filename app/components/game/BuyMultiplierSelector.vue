<template>
  <div class="relative w-24" ref="dropdownRef">
    <button
      @click="isOpen = !isOpen"
      class="w-full flex items-center justify-between bg-[#182635] rounded-full p-2 px-4 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#3899fa]"
    >
      <span>{{ activeLabel }}</span>
      <svg class="h-4 w-4 fill-current text-gray-400 transition-transform" :class="{ 'rotate-180': isOpen }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
    </button>

    <Transition name="dropdown-fade">
      <div
        v-if="isOpen"
        class="absolute z-10 top-full mt-2 w-full bg-[#182635] border border-gray-700 rounded-lg shadow-lg overflow-hidden"
      >
        <ul>
          <li
            v-for="multiplier in multipliers"
            :key="multiplier.value"
            @click="handleSelect(multiplier.value)"
            class="px-4 py-2 text-sm text-gray-300 hover:bg-[#3899fa] hover:text-white cursor-pointer transition-colors"
            :class="{ 'bg-[#3899fa] text-white': isActive(multiplier.value) }"
          >
            {{ multiplier.label }}
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore, type BuyMultiplier } from '~/store/game'
import { onClickOutside } from '@vueuse/core'

const gameStore = useGameStore()
const isOpen = ref(false)
const dropdownRef = ref(null)

const multipliers: { label: string; value: BuyMultiplier }[] = [
  { label: 'x1', value: 'x1' },
  { label: 'x10', value: 'x10' },
  { label: 'x100', value: 'x100' },
  { label: 'Max', value: 'max' }
]

const activeLabel = computed(() => {
  return multipliers.find(m => m.value === gameStore.buyMultiplier)?.label
})

const isActive = (multiplier: BuyMultiplier) => {
  return gameStore.buyMultiplier === multiplier
}

const handleSelect = (multiplier: BuyMultiplier) => {
  gameStore.setBuyMultiplier(multiplier)
  isOpen.value = false
}

onClickOutside(dropdownRef, () => {
  isOpen.value = false
})
</script>

<style scoped>
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease-out;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>