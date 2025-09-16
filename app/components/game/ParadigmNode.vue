<template>
  <div
    class="w-56 p-4 transition-all duration-300 rounded-lg border-2"
    :class="nodeClass"
  >
    <!-- Top Section -->
    <div class="flex justify-between items-start">
      <div>
        <p class="text-sm font-medium" :class="statusTextColor">{{ statusText }}</p>
        <h3 class="text-white text-lg font-bold">{{ paradigm.name }}</h3>
        <p class="text-gray-300 text-sm mt-1">{{ paradigm.description }}</p>
      </div>
      <div class="flex-shrink-0 text-3xl text-white/50">
        <Icon :name="iconName" />
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="mt-3 text-center rounded-md py-1.5 text-sm font-medium" :class="buttonClass">
      <span>{{ paradigm.cost }} SP</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Paradigm } from '~~/game/paradigms.configs'

const props = defineProps<{
  paradigm: Paradigm
  isPurchased: boolean
  isPurchasable: boolean
}>()

const iconName = computed(() => {
  if (props.paradigm.id.includes('oop')) return 'mdi:object-group'
  if (props.paradigm.id.includes('procedural')) return 'mdi:arrow-decision-outline'
  if (props.paradigm.id.includes('functional')) return 'mdi:function-variant'
  return 'mdi:code-braces'
})

const statusText = computed(() => {
  if (props.isPurchased) return '已解锁'
  if (props.isPurchasable) return '可解锁'
  return '已锁定'
})

const nodeClass = computed(() => {
  if (props.isPurchased) {
    return 'bg-green-900/80 border-green-500'
  }
  if (props.isPurchasable) {
    return 'bg-purple-900/80 border-purple-500 cursor-pointer'
  }
  return 'bg-gray-800/90 border-gray-600'
})

const statusTextColor = computed(() => {
  if (props.isPurchased) return 'text-green-400'
  if (props.isPurchasable) return 'text-purple-400'
  return 'text-gray-500'
})

const buttonClass = computed(() => {
  if (props.isPurchasable && !props.isPurchased) {
    return 'bg-purple-600 text-white'
  }
  if (props.isPurchased) {
    return 'bg-green-600 text-white'
  }
  return 'bg-gray-700 text-gray-500'
})
</script>
