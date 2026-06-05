<template>
  <div class="paradigm-node" :class="nodeClass">
    <div class="node-top">
      <div class="node-copy">
        <p :class="statusTextColor">{{ statusText }}</p>
        <h3>{{ $t('paradigms.' + paradigm.id + '.name') }}</h3>
        <span>{{ $t('paradigms.' + paradigm.id + '.description') }}</span>
      </div>
      <div class="node-icon" :class="iconColor">
        <Icon v-if="lockReason === 'school_limit' || lockReason === 'exclusive'" name="ph:lock-bold" />
        <Icon v-else :name="iconName" />
      </div>
    </div>

    <div class="cost-badge" :class="buttonClass">
      <span>{{ paradigm.cost }} SP</span>
    </div>

    <button
      v-if="isPurchased && !gameStore.activeRefactoring"
      @click.stop="$emit('requestRefactor', paradigm.id)"
      class="refactor-link"
    >
      {{ $t('common.requestRefactor') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/store/game'
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
  system_kernel: 'mdi:chip',
  open_source_community: 'mdi:account-group',
  api_interface: 'mdi:api',
  efficiency_starter: 'mdi:lightning-bolt',
  pointer_arithmetic: 'mdi:cursor-pointer',
  memory_management: 'mdi:memory',
  supply_chain_optimization: 'mdi:package-variant-closed',
  bit_manipulation: 'mdi:code-array',
  assembly_instruction: 'mdi:cpu-64-bit',
  compiler_optimization: 'mdi:cog-sync',
  abstraction_starter: 'mdi:layers-triple',
  design_patterns: 'mdi:puzzle',
  polymorphism: 'mdi:shuffle-variant',
  enterprise_architecture: 'mdi:domain',
  dependency_injection: 'mdi:needle',
  continuous_integration: 'mdi:pipe',
  agility_starter: 'mdi:run-fast',
  dynamic_typing: 'mdi:variable',
  jit_compilation: 'mdi:speedometer',
  code_generation: 'mdi:auto-fix',
  refactoring_tools: 'mdi:wrench',
  metaprogramming: 'mdi:code-json',
}

const SCHOOL_ICON_COLOR: Record<string, string> = {
  general: 'school-blue',
  efficiency: 'school-amber',
  abstraction: 'school-violet',
  agility: 'school-teal',
}

const iconName = computed(() => ICON_MAP[props.paradigm.id] ?? 'mdi:code-braces')

const iconColor = computed(() => {
  if (props.lockReason === 'school_limit' || props.lockReason === 'exclusive') return 'muted'
  if (!props.isPurchased && !props.isPurchasable) return 'muted'
  return SCHOOL_ICON_COLOR[props.paradigm.school] ?? 'muted'
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
  if (props.isPurchased) return 'purchased'
  if (props.isPurchasable) return 'purchasable'
  return 'locked'
})

const statusTextColor = computed(() => {
  if (props.isPurchased) return 'status-positive'
  if (props.isPurchasable) return 'status-ready'
  if (props.lockReason === 'dependency') return 'status-danger'
  if (props.lockReason === 'exclusive') return 'status-warning'
  if (props.lockReason === 'sp') return 'status-warning'
  return 'status-muted'
})

const buttonClass = computed(() => {
  if (props.isPurchasable && !props.isPurchased) return 'ready'
  if (props.isPurchased) return 'done'
  return 'blocked'
})
</script>

<style scoped>
.paradigm-node {
  width: 12rem;
  border: 1px solid rgba(76, 165, 255, 0.2);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(19, 37, 54, 0.96), rgba(12, 23, 34, 0.98)),
    radial-gradient(circle at 0% 0%, rgba(76, 165, 255, 0.1), transparent 42%);
  box-shadow: inset 0 0 22px rgba(0, 0, 0, 0.24);
  padding: 10px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.paradigm-node.purchasable {
  cursor: pointer;
  border-color: rgba(154, 247, 189, 0.42);
  box-shadow: 0 0 18px rgba(134, 239, 172, 0.1), inset 0 0 22px rgba(0, 0, 0, 0.22);
}

.paradigm-node.purchasable:hover {
  transform: translateY(-1px);
}

.paradigm-node.purchased {
  border-color: rgba(134, 239, 172, 0.34);
}

.paradigm-node.locked {
  opacity: 0.86;
}

.node-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.node-copy {
  min-width: 0;
}

.node-copy p {
  overflow: hidden;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-copy h3 {
  margin-top: 3px;
  color: #f8fbff;
  font-size: 0.84rem;
  font-weight: 900;
  line-height: 1.25;
}

.node-copy span {
  display: -webkit-box;
  margin-top: 4px;
  overflow: hidden;
  color: #b9cde0;
  font-size: 0.7rem;
  line-height: 1.35;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.node-icon {
  flex: 0 0 auto;
  font-size: 1.35rem;
}

.school-blue { color: #7dd3fc; }
.school-amber { color: #facc15; }
.school-violet { color: #c4b5fd; }
.school-teal { color: #5eead4; }
.muted { color: #64748b; }

.status-positive { color: #bbf7d0; }
.status-ready { color: #9af7bd; }
.status-danger { color: #fecaca; }
.status-warning { color: #fde68a; }
.status-muted { color: #8ba2b7; }

.cost-badge {
  margin-top: 8px;
  border-radius: 8px;
  padding: 6px;
  text-align: center;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.72rem;
  font-weight: 900;
}

.cost-badge.ready {
  border: 1px solid rgba(154, 247, 189, 0.32);
  background: rgba(22, 101, 52, 0.32);
  color: #dcfce7;
}

.cost-badge.done {
  border: 1px solid rgba(134, 239, 172, 0.24);
  background: rgba(5, 46, 22, 0.34);
  color: #bbf7d0;
}

.cost-badge.blocked {
  border: 1px solid rgba(142, 173, 204, 0.16);
  background: rgba(15, 23, 42, 0.58);
  color: #8ba2b7;
}

.refactor-link {
  margin-top: 7px;
  width: 100%;
  color: #fca5a5;
  font-size: 0.68rem;
  font-weight: 800;
  text-align: center;
}
</style>
