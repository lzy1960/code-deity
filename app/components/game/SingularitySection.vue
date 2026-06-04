<template>
  <div>
    <div class="flex flex-wrap justify-between items-center gap-4 mb-4 px-4">
      <h2 class="text-2xl font-bold text-purple-300" style="text-shadow: 0 0 5px rgba(192, 132, 252, 0.5);">{{ $t('common.programmingParadigms') }}</h2>
      <div class="flex items-center gap-3 text-sm">
        <div class="bg-black/20 px-3 py-1 rounded-lg text-center">
          <span class="text-gray-400">{{ $t('common.singularityPowerShort') }}: </span>
          <span class="font-bold text-green-400">{{ formatNumber(gameStore.singularityPower) }}</span>
        </div>
        <div class="bg-black/20 px-3 py-1 rounded-lg text-center">
          <span class="text-gray-400">{{ $t('common.singularity') }}: </span>
          <span class="font-bold text-purple-400">{{ formatNumber(gameStore.singularityCount) }}</span>
        </div>
      </div>
    </div>

    <!-- School Limit Banner -->
    <div v-if="lockedSchool" class="absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-red-900/80 backdrop-blur-sm border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm shadow-lg flex items-center gap-2 w-[80vw] max-w-4xl">
      <Icon name="ph:scales-bold" />
      <span>{{ $t('common.youHaveChosenToDevelop') }} <b>{{ purchasedSchools.join(` ${$t('common.and')} `) }}</b> {{ $t('common.school') }}，<b>{{ lockedSchool }}</b> {{ $t('common.schoolSkillsLockedHint') }}</span>
    </div>

    <div class="flow-container w-full h-[70vh]">
      <div class="flow-inner">
        <VueFlow
          v-model:nodes="nodes"
          v-model:edges="edges"
          :pan-on-drag="true"
          :zoom-on-scroll="true"
          :zoom-on-pinch="true"
          :min-zoom="0.5"
          :max-zoom="1.5"
          :prevent-scrolling="true"
          :nodes-draggable="false"
          :nodes-connectable="false"
          :elements-selectable="true"
          :default-edge-options="{ type: 'straight', markerEnd: 'arrowclosed' }"
          class="paradigm-flow"
        >
          <template #node-custom="props">
            <ParadigmNode
              :paradigm="props.data.paradigm"
              :is-purchased="props.data.isPurchased"
              :is-purchasable="props.data.isPurchasable"
              :lock-reason="props.data.lockReason"
              @request-refactor="gameStore.requestParadigmRefactor"
            />
          </template>

          <Background :variant="BackgroundVariant.Dots" :gap="24" :size="1" />
        </VueFlow>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, nextTick, onMounted } from 'vue'
import { useGameStore } from '~/store/game'
import { paradigmConfigs } from '~~/game/paradigms.configs'
import type { Paradigm } from '~/types/paradigms'
import { formatNumber } from '~/utils/format'
import { VueFlow, useVueFlow, MarkerType, Position } from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import type { Node, Edge } from '@vue-flow/core'
import ParadigmNode from './ParadigmNode.vue'

const gameStore = useGameStore()
const purchaseModal = useParadigmPurchaseModal()
const { onNodeClick, fitView } = useVueFlow()
const { t } = useI18n()

const schoolStarterIds = [
  'efficiency_starter',
  'abstraction_starter',
  'agility_starter',
]

const purchasedSchools = computed(() => {
  return schoolStarterIds
    .filter(id => gameStore.paradigms[id])
    .map(id => t(`paradigms.${id}.name`))
})

const lockedSchool = computed(() => {
  if (purchasedSchools.value.length < 2) return null
  const lockedStarterId = schoolStarterIds.find(id => !gameStore.paradigms[id])
  return lockedStarterId ? t(`paradigms.${lockedStarterId}.name`) : null
})

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

// --- Computed properties for dynamic state ---
const isPurchased = (id: string): boolean => !!gameStore.paradigms[id]

const getAnalysis = (paradigmId: string) => gameStore.paradigmPurchaseAnalysis(paradigmId)

// --- Action ---
const handlePurchaseClick = (paradigm: Paradigm) => {
  const analysis = getAnalysis(paradigm.id)
  if (analysis.purchasable) {
    purchaseModal.show(paradigm, () => gameStore.purchaseParadigm(paradigm.id))
  }
}

onNodeClick((event) => {
  const paradigm = event.node.data.paradigm as Paradigm | undefined
  if (paradigm) {
    // Add a check to prevent clicking on school-limited nodes
    const analysis = getAnalysis(paradigm.id)
    if (analysis.reason !== 'school_limit') {
      handlePurchaseClick(paradigm)
    }
  }
})

// --- Watch for game state changes to update the flow ---
watch(() => [gameStore.paradigms, gameStore.singularityPower], () => {
  // Just update data for reactivity, don't re-run layout
  nodes.value = nodes.value.map(node => {
    const analysis = getAnalysis(node.data.paradigm.id)
    return {
      ...node,
      data: {
        ...node.data,
        isPurchased: isPurchased(node.data.paradigm.id),
        isPurchasable: analysis.purchasable,
        lockReason: analysis.reason,
      },
    }
  })
  edges.value = edges.value.map(edge => {
    const isSourcePurchased = isPurchased(edge.source)
    const isTargetPurchased = isPurchased(edge.target)
    const targetParadigm = paradigmConfigs.find(p => p.id === edge.target)!
    const canAfford = gameStore.singularityPower.gte(targetParadigm.cost)

    return {
      ...edge,
      animated: isSourcePurchased && !isTargetPurchased && canAfford,
      style: { stroke: isSourcePurchased ? '#a78bfa' : '#6b7280', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: isSourcePurchased ? '#a78bfa' : '#6b7280' },
    }
  })
}, { deep: true })

// Initial setup — positions are baked into paradigmConfigs (formerly computed by dagre)
const initialNodes: Node[] = paradigmConfigs.map(p => {
  const analysis = getAnalysis(p.id)
  return {
    id: p.id,
    type: 'custom',
    position: { x: p.x, y: p.y },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    data: {
      paradigm: p,
      isPurchased: isPurchased(p.id),
      isPurchasable: analysis.purchasable,
      lockReason: analysis.reason,
    },
  }
})

const initialEdges: Edge[] = []
paradigmConfigs.forEach(p => {
  if (p.requires) {
    p.requires.forEach(reqId => {
      initialEdges.push({
        id: `e-${reqId}-${p.id}`,
        source: reqId,
        target: p.id,
      })
    })
  }
})

nodes.value = initialNodes
edges.value = initialEdges

onMounted(() => {
  nextTick(() => {
    fitView({ duration: 400, padding: 0.2, maxZoom: 0.65 })
  })
})

</script>

<style>
/* Import Vue Flow styles */
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

.paradigm-flow .vue-flow__pane {
  cursor: grab;
}

.paradigm-flow .vue-flow__node {
  cursor: default;
}
</style>

<style scoped>
.flow-container {
  position: relative;
  border-radius: 1rem; /* 16px */
  overflow: hidden;
  background-color: #0d151c; /* Match sidebar */
  padding: 2px; /* Creates space for the animated border */
  border: 1px solid rgba(192, 132, 252, 0.2);
}

.flow-container::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 250%; /* Make it larger to ensure the gradient is smooth */
  height: 250%;
  background: conic-gradient(
    transparent,
    rgba(192, 132, 252, 0.7), /* purple-400 */
    transparent 15%
  );
  transform: translate(-50%, -50%);
  animation: rotate 8s linear infinite;
}

@keyframes rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.flow-inner {
  position: relative; /* Establish stacking context */
  z-index: 1;         /* Sit on top of the ::before pseudo-element */
  background-color: #0d151c; /* Match sidebar */
  border-radius: 0.875rem; /* 14px, slightly smaller than container */
  height: 100%;
  width: 100%;
  overflow: hidden; /* Crucial for VueFlow to respect the rounded corners */
}

/* Override Vue Flow's default background */
.paradigm-flow {
  background: transparent;
}
</style>
