<template>
  <div class="bg-gray-800 text-white rounded-lg shadow-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-purple-300">编程范式</h2>
      <div class="text-lg">
        奇点算力 (SP): <span class="font-bold text-green-400">{{ formatNumber(gameStore.singularityPower) }}</span>
      </div>
    </div>

    <div class="relative w-full h-[600px] border border-gray-700 rounded-lg overflow-hidden">
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :fit-view-on-init="true"
        :pan-on-drag="true"
        :zoom-on-scroll="true"
        :zoom-on-pinch="true"
        :min-zoom="0.5"
        :max-zoom="1.5"
        :prevent-scrolling="true"
        :nodes-draggable="false"
        :nodes-connectable="false"
        :elements-selectable="true"
        :default-edge-options="{ type: 'straight' }"
        class="paradigm-flow"
      >
        <template #node-custom="props">
          <ParadigmNode
            :paradigm="props.data.paradigm"
            :is-purchased="props.data.isPurchased"
            :is-purchasable="props.data.isPurchasable"
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
import { paradigmConfigs, type Paradigm } from '~~/game/paradigms.configs'
import { formatNumber } from '~/utils/format'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import type { Node, Edge } from '@vue-flow/core'
import ParadigmNode from './ParadigmNode.vue'
import { useParadigmPurchaseModal } from '~/composables/useParadigmPurchaseModal'
import dagre from 'dagre'

const gameStore = useGameStore()
const purchaseModal = useParadigmPurchaseModal()
const { onNodeClick, getNodes } = useVueFlow()

// --- Dagre Layout State ---
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])
let hasLayoutBeenRun = false

// --- Computed properties for dynamic state ---
const isPurchased = (id: string): boolean => !!gameStore.paradigms[id]
const areDependenciesMet = (p: Paradigm): boolean => !p.requires || p.requires.every(reqId => isPurchased(reqId))
const canAfford = (p: Paradigm): boolean => gameStore.singularityPower.gte(p.cost)
const isPurchasable = (p: Paradigm): boolean => !isPurchased(p.id) && canAfford(p) && areDependenciesMet(p)

// --- Action ---
const handlePurchaseClick = (paradigm: Paradigm) => {
  if (isPurchasable(paradigm)) {
    purchaseModal.show(paradigm, () => gameStore.purchaseParadigm(paradigm.id))
  }
}

onNodeClick((event) => {
  const paradigm = event.node.data.paradigm as Paradigm | undefined
  if (paradigm) handlePurchaseClick(paradigm)
})

// --- Dagre Auto-Layout Logic ---
const runLayout = (nodesToLayout: Node[]) => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: 'TB', nodesep: 25, ranksep: 50 })

  nodesToLayout.forEach(node => {
    dagreGraph.setNode(node.id, { width: node.dimensions.width || 224, height: node.dimensions.height || 120 })
  })

  edges.value.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  nodes.value = nodesToLayout.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
    }
  })

  hasLayoutBeenRun = true
}

// --- Watch for game state changes to update the flow ---
watch(() => [gameStore.paradigms, gameStore.singularityPower], () => {
  // Just update data for reactivity, don't re-run layout
  nodes.value = nodes.value.map(node => ({
    ...node,
    data: {
      ...node.data,
      isPurchased: isPurchased(node.data.paradigm.id),
      isPurchasable: isPurchasable(node.data.paradigm),
    },
  }))
  edges.value = edges.value.map(edge => ({
    ...edge,
    animated: isPurchased(edge.source) && !isPurchased(edge.target) && canAfford(paradigmConfigs.find(p => p.id === edge.target)!),
    style: { stroke: isPurchased(edge.source) ? '#a78bfa' : '#6b7280', strokeWidth: 2 },
  }))
}, { deep: true })

// Initial setup
const initialNodes: Node[] = paradigmConfigs.map(p => ({
  id: p.id,
  type: 'custom',
  position: { x: 0, y: 0 },
  data: {
    paradigm: p,
    isPurchased: isPurchased(p.id),
    isPurchasable: isPurchasable(p),
  },
}))

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
      runLayout(newNodes)
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
