<template>
  <div
    class="w-56 p-4 transition-all duration-300 rounded-lg border-2"
    :class="nodeClass"
  >
    <!-- Top Section -->
    <div class="flex justify-between items-start">
      <div>
        <p class="text-sm font-medium" :class="statusTextColor">{{ statusText }}</p>
        <h3 class="text-white text-lg font-bold">{{ $t('paradigms.' + paradigm.id + '.name') }}</h3>
        <p class="text-gray-300 text-sm mt-1">{{ $t('paradigms.' + paradigm.id + '.description') }}</p>
      </div>
      <div class="flex-shrink-0 text-3xl text-white/50">
        <Icon v-if="lockReason === 'school_limit' || lockReason === 'exclusive'" name="ph:lock-bold" />
        <Icon v-else :name="iconName" />
      </div>
    </div>

    <!-- Bottom Section -->
    <div class="mt-3 text-center rounded-md py-1.5 text-sm font-medium" :class="buttonClass">
      <span>{{ paradigm.cost }} SP</span>
    </div>

    <!-- Refactor Button -->
    <div v-if="isPurchased && !gameStore.activeRefactoring" class="mt-2">
      <button @click.stop="$emit('requestRefactor', paradigm.id)" class="w-full text-xs text-center text-gray-400 hover:text-red-400 hover:underline">
        {{ $t('common.requestRefactor') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/store/game';
import type { Paradigm } from '~/types/paradigms'
import { paradigmConfigs } from '~~/game/paradigms.configs'
import { getLocalizedGameName } from '~/utils/format';

const gameStore = useGameStore()
const { t } = useI18n()

const props = defineProps<{
  paradigm: Paradigm
  isPurchased: boolean
  isPurchasable: boolean
  lockReason: 'sp' | 'dependency' | 'exclusive' | 'school_limit' | null
}>()

defineEmits(['requestRefactor'])

const statusText = computed(() => {
  if (props.isPurchased) return t('common.unlocked')
  if (props.isPurchasable) return t('common.purchasable')
  
  if (props.lockReason === 'dependency') {
    const missingDeps = props.paradigm.requires
      ?.filter(reqId => !gameStore.paradigms[reqId])
      .map(reqId => `\"${t('paradigms.' + reqId + '.name')}\"`)
      .join(', ')
    return `${t('common.requires')}: ${missingDeps}`
  }

  if (props.lockReason === 'exclusive') {
    return t('common.mutuallyExclusive')
  }

  if (props.lockReason === 'school_limit') {
    return t('common.schoolLimitReached')
  }

  if (props.lockReason === 'sp') {
    return t('common.insufficientSp')
  }

  return t('common.locked')
})

const iconName = computed(() => {
  if (props.paradigm.id.includes('oop')) return 'mdi:object-group'
  if (props.paradigm.id.includes('procedural')) return 'mdi:arrow-decision-outline'
  if (props.paradigm.id.includes('functional')) return 'mdi:function-variant'
  return 'mdi:code-braces'
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
  if (props.lockReason === 'dependency') return 'text-red-400'
  if (props.lockReason === 'exclusive') return 'text-yellow-400'
  if (props.lockReason === 'sp') return 'text-orange-400'
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
