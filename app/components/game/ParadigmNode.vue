<template>
  <div
    class="w-48 p-3 transition-all duration-300 rounded-lg border-2"
    :class="nodeClass"
  >
    <!-- Top Section -->
    <div class="flex justify-between items-start gap-2">
      <div class="flex-1 min-w-0">
        <p class="text-xs font-medium truncate" :class="statusTextColor">{{ statusText }}</p>
        <h3 class="text-white text-sm font-bold mt-0.5 leading-tight">{{ $t('paradigms.' + paradigm.id + '.name') }}</h3>
        <p class="text-gray-300 text-xs mt-1 line-clamp-2">{{ $t('paradigms.' + paradigm.id + '.description') }}</p>
      </div>
      <div class="flex-shrink-0 text-xl" :class="iconColor">
        <Icon v-if="lockReason === 'school_limit' || lockReason === 'exclusive'" name="ph:lock-bold" />
        <Icon v-else :name="iconName" />
      </div>
    </div>

    <!-- Cost Badge -->
    <div class="mt-2 text-center rounded-md py-1 text-xs font-medium" :class="buttonClass">
      <span>{{ paradigm.cost }} SP</span>
    </div>

    <!-- Refactor Button -->
    <div v-if="isPurchased && !gameStore.activeRefactoring" class="mt-1.5">
      <button @click.stop="$emit('requestRefactor', paradigm.id)" class="w-full text-xs text-center text-gray-400 hover:text-red-400 hover:underline">
        {{ $t('common.requestRefactor') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/store/game';
import type { Paradigm } from '~/types/paradigms'

const gameStore = useGameStore()
const { t } = useI18n()

const props = defineProps<{
  paradigm: Paradigm
  isPurchased: boolean
  isPurchasable: boolean
  lockReason: 'sp' | 'dependency' | 'exclusive' | 'school_limit' | null
}>()

defineEmits(['requestRefactor'])

const ICON_MAP: Record<string, string> = {
  // General trunk
  system_kernel:           'mdi:chip',
  open_source_community:   'mdi:account-group',
  api_interface:           'mdi:api',
  // Efficiency school
  efficiency_starter:      'mdi:lightning-bolt',
  pointer_arithmetic:      'mdi:cursor-pointer',
  memory_management:       'mdi:memory',
  supply_chain_optimization: 'mdi:package-variant-closed',
  bit_manipulation:        'mdi:code-array',
  assembly_instruction:    'mdi:cpu-64-bit',
  compiler_optimization:   'mdi:cog-sync',
  // Abstraction school
  abstraction_starter:     'mdi:layers-triple',
  design_patterns:         'mdi:puzzle',
  polymorphism:            'mdi:shuffle-variant',
  enterprise_architecture: 'mdi:domain',
  dependency_injection:    'mdi:needle',
  continuous_integration:  'mdi:pipe',
  // Agility school
  agility_starter:         'mdi:run-fast',
  dynamic_typing:          'mdi:variable',
  jit_compilation:         'mdi:speedometer',
  code_generation:         'mdi:auto-fix',
  refactoring_tools:       'mdi:wrench',
  metaprogramming:         'mdi:code-json',
}

const SCHOOL_ICON_COLOR: Record<string, string> = {
  general:     'text-blue-400',
  efficiency:  'text-amber-400',
  abstraction: 'text-purple-400',
  agility:     'text-teal-400',
}

const iconName = computed(() => ICON_MAP[props.paradigm.id] ?? 'mdi:code-braces')

const iconColor = computed(() => {
  if (props.lockReason === 'school_limit' || props.lockReason === 'exclusive') return 'text-gray-500'
  if (!props.isPurchased && !props.isPurchasable) return 'text-gray-500'
  return SCHOOL_ICON_COLOR[props.paradigm.school] ?? 'text-white/50'
})

const statusText = computed(() => {
  if (props.isPurchased) return t('common.unlocked')
  if (props.isPurchasable) return t('common.purchasable')

  if (props.lockReason === 'dependency') {
    const missingDeps = props.paradigm.requires
      ?.filter(reqId => !gameStore.paradigms[reqId])
      .map(reqId => `"${t('paradigms.' + reqId + '.name')}"`)
      .join(', ')
    return `${t('common.requires')}: ${missingDeps}`
  }

  if (props.lockReason === 'exclusive') return t('common.mutuallyExclusive')
  if (props.lockReason === 'school_limit') return t('common.schoolLimitReached')
  if (props.lockReason === 'sp') return t('common.insufficientSp')

  return t('common.locked')
})

const nodeClass = computed(() => {
  if (props.isPurchased) return 'bg-green-900/80 border-green-500'
  if (props.isPurchasable) return 'bg-purple-900/80 border-purple-500 cursor-pointer'
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
  if (props.isPurchasable && !props.isPurchased) return 'bg-purple-600 text-white'
  if (props.isPurchased) return 'bg-green-600 text-white'
  return 'bg-gray-700 text-gray-500'
})
</script>
