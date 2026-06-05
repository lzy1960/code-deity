<template>
  <div class="multiplier-select" :class="{ open: isOpen }" ref="dropdownRef">
    <button
      ref="triggerRef"
      @click="toggleMenu"
      class="select-trigger"
    >
      <span>{{ activeLabel }}</span>
      <Icon name="mdi:chevron-down" :class="{ open: isOpen }" />
    </button>

    <Teleport to="body">
      <Transition name="dropdown-fade">
        <div
          v-if="isOpen"
          ref="menuRef"
          class="select-menu"
          :style="menuStyle"
        >
          <ul>
            <li
              v-for="multiplier in multipliers"
              :key="multiplier.value"
              @click="handleSelect(multiplier.value)"
              :class="{ active: isActive(multiplier.value) }"
            >
              {{ multiplier.label }}
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted, watch } from 'vue'
import { useGameStore, type BuyMultiplier } from '~/store/game'

const gameStore = useGameStore()
const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuPosition = ref({ top: 0, left: 0, width: 104 })
const MENU_HEIGHT = 152

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

const menuStyle = computed(() => ({
  top: `${menuPosition.value.top}px`,
  left: `${menuPosition.value.left}px`,
  width: `${menuPosition.value.width}px`,
}))

const updateMenuPosition = () => {
  const trigger = triggerRef.value
  if (!trigger) return

  const rect = trigger.getBoundingClientRect()
  const width = rect.width
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8)
  let top = rect.bottom + 8

  if (top + MENU_HEIGHT > window.innerHeight - 8) {
    top = rect.top - MENU_HEIGHT - 8
  }
  if (top < 8) {
    top = 8
  }

  menuPosition.value = { top, left, width }
}

const closeMenu = () => {
  isOpen.value = false
}

const handleDocumentPointerDown = (event: PointerEvent) => {
  const target = event.target as Node | null
  if (!target) return
  if (dropdownRef.value?.contains(target) || menuRef.value?.contains(target)) return
  closeMenu()
}

const addMenuListeners = () => {
  window.addEventListener('resize', updateMenuPosition)
  window.addEventListener('scroll', updateMenuPosition, true)
  document.addEventListener('pointerdown', handleDocumentPointerDown)
}

const removeMenuListeners = () => {
  window.removeEventListener('resize', updateMenuPosition)
  window.removeEventListener('scroll', updateMenuPosition, true)
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
}

const toggleMenu = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    updateMenuPosition()
    await nextTick()
    updateMenuPosition()
  }
}

watch(isOpen, (open) => {
  if (open) {
    addMenuListeners()
  } else {
    removeMenuListeners()
  }
})

onUnmounted(removeMenuListeners)
</script>

<style scoped>
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.multiplier-select {
  position: relative;
  width: 6.5rem;
  flex: 0 0 auto;
}

.multiplier-select.open {
  z-index: 80;
}

.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 38px;
  border: 1px solid rgba(76, 165, 255, 0.32);
  border-radius: 8px;
  background: linear-gradient(180deg, rgba(19, 37, 54, 0.98), rgba(12, 23, 34, 0.98));
  color: #ffffff;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.86rem;
  font-weight: 900;
  padding: 0 10px;
  transition: border-color 0.18s ease, background-color 0.18s ease;
}

.select-trigger:hover,
.select-trigger:focus-visible {
  border-color: rgba(56, 153, 250, 0.38);
  background: rgba(56, 153, 250, 0.2);
  outline: none;
}

.select-trigger .iconify {
  color: #dbeafe;
  font-size: 1.05rem;
  transition: transform 0.18s ease;
}

.select-trigger .iconify.open {
  transform: rotate(180deg);
}

.select-menu {
  position: fixed;
  z-index: 10000;
  overflow: hidden;
  border: 1px solid rgba(76, 165, 255, 0.34);
  border-radius: 8px;
  background: rgba(10, 21, 32, 0.98);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.42);
}

.select-menu li {
  cursor: pointer;
  color: #cfe3f5;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.84rem;
  font-weight: 800;
  padding: 8px 10px;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.select-menu li:hover,
.select-menu li.active {
  background: rgba(76, 165, 255, 0.24);
  color: #ffffff;
}
</style>
