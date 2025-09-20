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
    <div v-if="lockedSchool" class="absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-red-900/80 backdrop-blur-sm border border-red-500/50 text-red-300 px-4 py-2 rounded-lg text-sm shadow-lg flex items-center gap-2">
      <Icon name="ph:scales-bold" />
      <span>{{ $t('common.youHaveChosenToDevelop') }} <b>{{ purchasedSchools.join(` ${$t('common.and')} `) }}</b> {{ $t('common.school') }}，<b>{{ lockedSchool }}</b> {{ $t('common.schoolSkillsLockedHint') }}</span>
    </div>

    <div class="relative w-full h-[70vh]">
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
</template>

<script setup lang="ts">
import { watch, ref, nextTick } from 'vue'
import { useGameStore } from '~/store/game'
import { paradigmConfigs } from '~~/game/paradigms.configs'
import type { Paradigm } from '~/types/paradigims'
import { formatNumber } from '~/utils/format'
import { VueFlow, useVueFlow, MarkerType } from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import type { Node, Edge } from '@vue-flow/core'
import ParadigmNode from './ParadigmNode.vue'
import dagre from 'dagre'

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

// --- Dagre Layout State ---
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])
let hasLayoutBeenRun = false

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

// --- Dagre Auto-Layout Logic ---
const runLayout = () => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: 'LR', ranker: 'longest-path', nodesep: 25, ranksep: 40 })

  const internalNodeMap = new Map(internalNodes.value.map(n => [n.id, n]))

  nodes.value.forEach(node => {
    const internalNode = internalNodeMap.get(node.id)
    const width = internalNode?.dimensions.width || 224
    const height = internalNode?.dimensions.height || 120
    dagreGraph.setNode(node.id, { width, height })
  })

  edges.value.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  nodes.value = nodes.value.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node, // This correctly spreads our node object, preserving source/targetPosition
      position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
    }
  })

  if (!hasLayoutBeenRun) {
    nextTick(() => {
      fitView({ nodes: ['system_kernel'], duration: 800, maxZoom: 1.2 });
    });
  }

  hasLayoutBeenRun = true
}

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

// Initial setup
const initialNodes: Node[] = paradigmConfigs.map(p => {
  const analysis = getAnalysis(p.id)
  return {
    id: p.id,
    type: 'custom',
    position: { x: 0, y: 0 },
    sourcePosition: 'right',
    targetPosition: 'left',
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

// Watch for Vue Flow's internal nodes to get their dimensions
const { nodes: internalNodes } = useVueFlow()
watch(internalNodes, (newNodes) => {
  if (!hasLayoutBeenRun && newNodes.length > 0 && newNodes.every(n => n.dimensions.width > 0 && n.dimensions.height > 0)) {
    nextTick(() => {
      runLayout()
    })
  }
}, { deep: true })

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
