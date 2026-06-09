<template>
  <div class="singularity-panel">
    <header class="section-header">
      <div>
        <p>PARADIGM GRAPH</p>
        <h2>{{ $t('common.programmingParadigms') }}</h2>
      </div>
      <div class="resource-strip">
        <div>
          <span>{{ $t('common.singularityPowerShort') }}</span>
          <b>{{ formatNumber(gameStore.singularityPower) }}</b>
        </div>
        <div>
          <span>{{ $t('common.singularity') }}</span>
          <b>{{ formatNumber(gameStore.singularityCount) }}</b>
        </div>
      </div>
    </header>

    <!-- School Limit Banner -->
    <div v-if="lockedSchool" class="school-limit-banner">
      <Icon name="ph:scales-bold" />
      <span>{{ $t('common.youHaveChosenToDevelop') }} <b>{{ purchasedSchools.join(` ${$t('common.and')} `) }}</b> {{ $t('common.school') }}，<b>{{ lockedSchool }}</b> {{ $t('common.schoolSkillsLockedHint') }}</span>
    </div>

    <section v-if="showFirstEntryBriefing" class="starter-recommendation">
      <header>
        <p>SECOND ERA BASICS</p>
        <h3>{{ $t('common.singularityStarterTitle') }}</h3>
      </header>
      <p>{{ $t('common.singularityStarterBody') }}</p>
      <div class="starter-chip-row">
        <span class="starter-chip">{{ $t('common.singularityStarterRulePersistence') }}</span>
        <span class="starter-chip">{{ $t('common.singularityStarterRuleSchoolLimit') }}</span>
        <span class="starter-chip emphasis">{{ $t('common.singularityStarterRuleDebt') }}</span>
      </div>
    </section>

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

const showFirstEntryBriefing = computed(() =>
  gameStore.unlockedSingularity
  && gameStore.singularityCount === 1
  && Object.keys(gameStore.paradigms).length === 0
)

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
  border: 1px solid rgba(76, 165, 255, 0.24);
  border-radius: 8px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(19, 37, 54, 0.94), rgba(12, 23, 34, 0.98)),
    radial-gradient(circle at 0% 0%, rgba(76, 165, 255, 0.12), transparent 36%);
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.26);
}

.flow-inner {
  position: relative;
  z-index: 1;
  background: transparent;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

/* Override Vue Flow's default background */
.paradigm-flow {
  background: transparent;
}

.singularity-panel {
  position: relative;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-header p {
  color: #4ca5ff;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.section-header h2 {
  margin-top: 3px;
  color: #f8fbff;
  font-size: 1.1rem;
  font-weight: 900;
}

.resource-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.resource-strip div {
  min-width: 88px;
  border: 1px solid rgba(76, 165, 255, 0.18);
  border-radius: 8px;
  background: rgba(16, 26, 35, 0.72);
  padding: 7px 10px;
  text-align: right;
}

.resource-strip span {
  display: block;
  color: #b9cde0;
  font-size: 0.64rem;
}

.resource-strip b {
  display: block;
  color: #dcfce7;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.86rem;
}

.school-limit-banner {
  position: absolute;
  top: 58px;
  left: 50%;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  width: min(80vw, 920px);
  border: 1px solid rgba(248, 113, 113, 0.34);
  border-radius: 8px;
  background: rgba(127, 29, 29, 0.82);
  color: #fee2e2;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.32);
  padding: 10px 12px;
  font-size: 0.8rem;
  transform: translateX(-50%);
}

.starter-recommendation {
  margin-bottom: 12px;
  border: 1px solid rgba(96, 165, 250, 0.22);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(15, 31, 46, 0.92), rgba(9, 19, 29, 0.96)),
    radial-gradient(circle at 0% 0%, rgba(96, 165, 250, 0.14), transparent 34%);
  box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.22);
  padding: 12px;
}

.starter-recommendation header p {
  color: #93c5fd;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.starter-recommendation header h3 {
  margin-top: 2px;
  color: #f8fbff;
  font-size: 0.98rem;
  font-weight: 900;
}

.starter-recommendation > p {
  margin-top: 8px;
  color: #c7d8e7;
  font-size: 0.76rem;
  line-height: 1.55;
}

.starter-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.starter-chip {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(96, 165, 250, 0.18);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.62);
  color: #dbeafe;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 6px 10px;
}

.starter-chip.emphasis {
  border-color: rgba(251, 191, 36, 0.22);
  background: rgba(69, 48, 12, 0.36);
  color: #fde68a;
}

@media (max-width: 640px) {
  .section-header {
    align-items: stretch;
    flex-direction: column;
  }

  .resource-strip div {
    flex: 1 1 0;
    text-align: left;
  }
}
</style>
