<template>
  <div class="code-scene flex flex-col select-none" :class="sceneClass">

    <!-- ── 顶部标题栏 ── -->
    <div class="scene-header flex items-center justify-between px-3 py-1 shrink-0">
      <div class="flex items-center gap-2">
        <span class="header-icon">⬡</span>
        <span class="header-title">DEITY ENGINE</span>
        <span class="header-dot" />
        <span class="header-status">{{ statusLabel }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span v-if="gameStore.isCodeRushActive" class="rush-badge">⚡ RUSH ×100</span>
        <span v-if="gameStore.activeChallenge !== 'none'" class="challenge-badge">⚠ CHALLENGE</span>
      </div>
    </div>

    <!-- ── 数据条 ── -->
    <div class="data-bar flex items-center justify-between px-3 py-1 shrink-0" data-onboarding="data-bar">
      <div class="flex items-baseline gap-3 flex-1 min-w-0">
        <!-- CP -->
        <span class="data-cp">
          {{ formatNumber(gameStore.currency) }}
          <span class="data-unit">{{ $t('common.computingPowerShort') }}</span>
        </span>
        <!-- RP（有重构才显示） -->
        <span v-if="gameStore.refactorCount > 0 || gameStore.refactorPoints.gt(0)" class="data-rp">
          {{ formatNumber(gameStore.refactorPoints) }}
          <span class="data-unit">{{ $t('common.refactorPointsShort') }}</span>
        </span>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <!-- 效率警告 -->
        <span v-if="gameStore.architecturalOverheadPenalty < 1" class="efficiency-warn">
          <Icon name="mdi:alert-circle-outline" class="text-xs" />
          {{ (gameStore.architecturalOverheadPenalty * 100).toFixed(0) }}%
        </span>
        <!-- CPS -->
        <span class="data-cps">
          +{{ formatNumber(gameStore.cps) }}<span class="data-unit"> {{ $t('common.cpsShort') }}</span>
        </span>
      </div>
    </div>

    <!-- ── 代码流区域 ── -->
    <div
      ref="codeAreaEl"
      class="relative flex-1 overflow-hidden cursor-crosshair"
      data-onboarding="code-area"
      @click="handleClick"
    >
      <!-- 背景扫描线 -->
      <div class="scanlines absolute inset-0 pointer-events-none" />

      <!-- 顶部渐隐 -->
      <div class="top-fade absolute left-0 right-0 top-0 pointer-events-none" />

      <!-- 代码行 -->
      <div class="lines-scroll absolute inset-0 overflow-hidden px-2 py-1 flex flex-col justify-end">
        <div
          v-for="line in visibleLines"
          :key="line.id"
          class="line-row flex items-baseline gap-2"
        >
          <span class="ln-num shrink-0 select-none">{{ line.lineNum }}</span>
          <span class="line-prompt shrink-0 select-none">›</span>
          <span class="code-text flex-1" v-html="line.html" />
          <span v-if="line.isCursor" class="cursor-char">█</span>
        </div>
      </div>

      <!-- 粒子层 -->
      <div ref="particlesEl" class="absolute inset-0 pointer-events-none overflow-hidden" />

      <!-- Ripple -->
      <span
        v-for="r in ripples"
        :key="r.id"
        class="ripple-ring absolute rounded-full pointer-events-none"
        :style="r.style"
      />

      <!-- 点击闪光 -->
      <div class="click-flash absolute inset-0 pointer-events-none" :class="{ active: flashing }" />
    </div>

    <!-- ── 底部状态条 ── -->
    <div class="scene-footer flex items-center justify-between px-3 py-1 shrink-0">
      <span class="footer-left">SRC {{ displayLineNum }} lines · {{ maxGenOwned === 0 ? 'BOOT' : maxGenOwned < 4 ? 'DEV' : maxGenOwned < 7 ? 'ADV' : 'GOD' }} MODE</span>
      <span class="footer-right">{{ $t('common.clickSceneToCode') }}</span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useGameStore } from '~/store/game'
import { formatNumber } from '~/utils/format'

const emit = defineEmits<{ manualClick: [e: MouseEvent] }>()
const gameStore = useGameStore()

// ── Code pool (pre-highlighted HTML, tiered by generator id) ──────────────
const POOL: { html: string; gen: number }[] = [
  // gen 0 — always
  { html: `<span class="ck">let</span> computePower = <span class="cn">0</span>;`, gen: 0 },
  { html: `<span class="ck">const</span> MAX_POWER = <span class="cn">1024</span>;`, gen: 0 },
  { html: `x += delta;`, gen: 0 },
  { html: `power = power + gain;`, gen: 0 },
  { html: `<span class="ck">var</span> tick = <span class="cn">0</span>;`, gen: 0 },
  { html: `result = <span class="ck">null</span>;`, gen: 0 },
  { html: `<span class="cc">// Processing...</span>`, gen: 0 },
  { html: `i++;`, gen: 0 },
  { html: `n = n * <span class="cn">2</span>;`, gen: 0 },
  { html: `<span class="cc">// tick: ${Date.now()}</span>`, gen: 0 },
  // gen 2 — Function
  { html: `<span class="ck">function</span> <span class="cf">processUnit</span>(n) {`, gen: 2 },
  { html: `  <span class="ck">return</span> n * MULTIPLIER;`, gen: 2 },
  { html: `}`, gen: 2 },
  { html: `<span class="ck">const</span> compute = (x) => x * <span class="cn">2</span>;`, gen: 2 },
  { html: `<span class="ck">function</span> <span class="cf">tick</span>() { <span class="cf">update</span>(); }`, gen: 2 },
  { html: `  <span class="ck">return</span> this.power.<span class="cf">plus</span>(gain);`, gen: 2 },
  { html: `<span class="cf">setTimeout</span>(<span class="cf">update</span>, <span class="cn">50</span>);`, gen: 2 },
  // gen 3 — Class
  { html: `<span class="ck">class</span> DataProcessor {`, gen: 3 },
  { html: `  <span class="ck">constructor</span>(opts) {`, gen: 3 },
  { html: `    <span class="ck">this</span>.power = <span class="ck">new</span> Decimal(<span class="cn">0</span>);`, gen: 3 },
  { html: `  }`, gen: 3 },
  { html: `<span class="ck">class</span> Engine <span class="ck">extends</span> BaseModule {`, gen: 3 },
  { html: `  <span class="cf">compute</span>() { <span class="ck">return</span> this.power; }`, gen: 3 },
  // gen 4 — Module
  { html: `<span class="ck">import</span> { optimize } <span class="ck">from</span> <span class="cs">'./core'</span>;`, gen: 4 },
  { html: `<span class="ck">export default</span> { name: <span class="cs">'deity'</span> };`, gen: 4 },
  { html: `<span class="ck">import type</span> { GameState } <span class="ck">from</span> <span class="cs">'~/store'</span>;`, gen: 4 },
  { html: `<span class="ck">export const</span> VERSION = <span class="cs">'2.0.0'</span>;`, gen: 4 },
  // gen 5 — Library
  { html: `<span class="ck">import</span> Decimal <span class="ck">from</span> <span class="cs">'break_infinity.js'</span>;`, gen: 5 },
  { html: `<span class="ck">const</span> lib = require(<span class="cs">'quantum-lib'</span>);`, gen: 5 },
  { html: `<span class="cc">// npm install @deity/core</span>`, gen: 5 },
  { html: `pinia.<span class="cf">use</span>(DeityPlugin);`, gen: 5 },
  // gen 6 — Framework
  { html: `@Injectable() <span class="ck">class</span> ApiService {}`, gen: 6 },
  { html: `<span class="cf">defineStore</span>(<span class="cs">'game'</span>, { state: () => ({`, gen: 6 },
  { html: `app.<span class="cf">use</span>(router);`, gen: 6 },
  { html: `<span class="ck">const</span> { data } = <span class="cf">useFetch</span>(<span class="cs">'/api'</span>);`, gen: 6 },
  // gen 7 — Compiler
  { html: `<span class="cc">// ✓ Compiled in 1.2s</span>`, gen: 7 },
  { html: `<span class="cc">// Building for production...</span>`, gen: 7 },
  { html: `<span class="cc">// ████████░░ 83% Optimizing...</span>`, gen: 7 },
  { html: `<span class="cc">// ✓ 147 modules transformed.</span>`, gen: 7 },
  { html: `<span class="cc">// WARNING: unused variable 'x'</span>`, gen: 7 },
  // gen 8 — AI Core
  { html: `<span class="cc">// [AI] Analyzing pattern...</span>`, gen: 8 },
  { html: `<span class="cc">// [AI] Optimal path: O(log n)</span>`, gen: 8 },
  { html: `<span class="cc">// [AI] Quality score: 99.7%</span>`, gen: 8 },
  { html: `<span class="cc">// [AI] Generating solution...</span>`, gen: 8 },
  { html: `<span class="cc">// [AI] Training: epoch 1024/1024</span>`, gen: 8 },
  // challenge-only lines (amber warning style, not error)
  { html: `<span class="cw">⚠ constraint active: output capped</span>`, gen: -1 },
  { html: `<span class="cw">⚠ challenge protocol engaged</span>`, gen: -1 },
  { html: `<span class="cc">// running under restriction...</span>`, gen: -1 },
]

const CODE_CHARS = ['{}', '<>', '=>', '//', '[ ]', '()', '/*', '*/', '01', ';;']

// ── Refs ──────────────────────────────────────────────────────────────────
const codeAreaEl = ref<HTMLElement>()
const particlesEl = ref<HTMLElement>()

interface Line { id: number; lineNum: number; html: string; isCursor: boolean }

const visibleLines = ref<Line[]>([])
const displayLineNum = ref(1000)
let nextLineId = 0
const LINE_HEIGHT = 24 // ~1.5em at 0.72rem ≈ 24px per line
let maxVisible = 12

// cursor blink
const cursorVisible = ref(true)
let cursorTimer: ReturnType<typeof setInterval> | null = null

// ripple effects
interface Ripple { id: number; style: string }
const ripples = ref<Ripple[]>([])
let rippleCounter = 0

// flash overlay
const flashing = ref(false)

// ── Computed ──────────────────────────────────────────────────────────────
const maxGenOwned = computed(() =>
  gameStore.generators.reduce((m, g) => (g.bought > 0 ? Math.max(m, g.id) : m), 0)
)

const availablePool = computed(() => {
  const isChallenge = gameStore.activeChallenge !== 'none'
  return POOL.filter(l => {
    if (l.gen === -1) return isChallenge
    return l.gen <= maxGenOwned.value
  })
})

// Lines per second — logarithmic scale based on CPS
const linesPerSec = computed(() => {
  const cps = gameStore.cps.toNumber()
  if (cps <= 0) return 0.25
  const base = Math.max(0.3, Math.min(12, Math.log10(cps + 1) * 2.2))
  return gameStore.isCodeRushActive ? base * 8 : base
})

const sceneClass = computed(() => ({
  'rush-mode': gameStore.isCodeRushActive,
  'challenge-mode': gameStore.activeChallenge !== 'none',
}))

const statusLabel = computed(() => {
  if (gameStore.isCodeRushActive) return 'OVERCLOCKING'
  if (gameStore.activeChallenge !== 'none') return 'CONSTRAINED'
  const cps = gameStore.cps.toNumber()
  if (cps <= 0) return 'IDLE'
  if (cps < 1e6) return 'COMPILING'
  if (cps < 1e12) return 'OPTIMIZING'
  return 'ASCENDING'
})

// ── Helpers ───────────────────────────────────────────────────────────────
function randomLine(): string {
  const pool = availablePool.value
  return pool[Math.floor(Math.random() * pool.length)]?.html ?? POOL[0]!.html
}

function calcMaxVisible() {
  if (!codeAreaEl.value) return
  const h = codeAreaEl.value.clientHeight
  maxVisible = Math.max(8, Math.floor(h / LINE_HEIGHT))
}

function addLine(html?: string) {
  displayLineNum.value++
  if (visibleLines.value.length > 0) {
    visibleLines.value[visibleLines.value.length - 1]!.isCursor = false
  }
  visibleLines.value.push({
    id: nextLineId++,
    lineNum: displayLineNum.value,
    html: html ?? randomLine(),
    isCursor: true,
  })
  if (visibleLines.value.length > maxVisible) {
    visibleLines.value.shift()
  }
}

// ── Line generation timer ─────────────────────────────────────────────────
let lineAccum = 0
let lineTimer: ReturnType<typeof setInterval> | null = null

const TICK_MS = 100 // 10 ticks/s

function startTimer() {
  lineTimer = setInterval(() => {
    lineAccum += linesPerSec.value / 10
    while (lineAccum >= 1) {
      addLine()
      lineAccum -= 1
    }
  }, TICK_MS)
}

// ── Click handling ────────────────────────────────────────────────────────
function handleClick(event: MouseEvent) {
  const rect = codeAreaEl.value!.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  spawnParticles(x, y)
  spawnRipple(x, y)

  // Burst: add lines immediately
  const burst = Math.min(5, Math.max(2, Math.floor(linesPerSec.value) + 2))
  for (let i = 0; i < burst; i++) addLine()

  // Flash
  flashing.value = true
  setTimeout(() => { flashing.value = false }, 250)

  emit('manualClick', event)
}

function spawnParticles(x: number, y: number) {
  if (!particlesEl.value) return
  const count = gameStore.isCodeRushActive ? 14 : 9
  const color = gameStore.isCodeRushActive ? '#fbbf24' : '#4ade80'
  const shadow = `${color}99`
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span')
    el.textContent = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)] ?? '{}'
    const sx = x + (Math.random() - 0.5) * 16
    const sy = y + (Math.random() - 0.5) * 10
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.7
    const dist = 45 + Math.random() * 65
    const dx = Math.cos(angle) * dist
    const dy = Math.sin(angle) * dist - 35
    const duration = 0.65 + Math.random() * 0.45
    el.className = 'click-particle'
    el.style.left = `${sx}px`
    el.style.top = `${sy}px`
    el.style.color = color
    el.style.fontSize = `${9 + Math.random() * 7}px`
    el.style.textShadow = `0 0 6px ${shadow}`
    el.style.setProperty('--px', `${dx}px`)
    el.style.setProperty('--py', `${dy}px`)
    el.style.animation = `particle-fly ${duration}s cubic-bezier(0.22, 1, 0.36, 1) forwards`
    particlesEl.value.appendChild(el)
    const node = el
    setTimeout(() => node.remove(), duration * 1000 + 50)
  }
}

function spawnRipple(x: number, y: number) {
  const id = rippleCounter++
  ripples.value.push({
    id,
    style: `left:${x}px;top:${y}px;width:4px;height:4px;transform:translate(-50%,-50%);`,
  })
  setTimeout(() => {
    ripples.value = ripples.value.filter(r => r.id !== id)
  }, 520)
}

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(() => {
  calcMaxVisible()
  for (let i = 0; i < maxVisible; i++) addLine()
  startTimer()
  cursorTimer = setInterval(() => { cursorVisible.value = !cursorVisible.value }, 530)
  window.addEventListener('resize', calcMaxVisible)
})

onUnmounted(() => {
  if (lineTimer) clearInterval(lineTimer)
  if (cursorTimer) clearInterval(cursorTimer)
  window.removeEventListener('resize', calcMaxVisible)
})

// Boost scroll speed on Code Rush state change
watch(() => gameStore.isCodeRushActive, (active) => {
  if (active) {
    for (let i = 0; i < 6; i++) addLine()
  }
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════
   BASE — matches the game's dark navy palette
═══════════════════════════════════════════════════════ */
.code-scene {
  background: #080f18;
  border: 1px solid rgba(56, 153, 250, 0.2);
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
  box-shadow: 0 0 20px rgba(56, 153, 250, 0.06), inset 0 0 40px rgba(0,0,0,0.4);
}

/* ── Data Bar ───────────────────────────────────────── */
.data-bar {
  background: rgba(6, 12, 20, 0.95);
  border-bottom: 1px solid rgba(56, 153, 250, 0.1);
}

.data-cp {
  color: #4ade80;
  font-size: 0.85rem;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
}

.data-rp {
  color: #a78bfa;
  font-size: 0.72rem;
  font-weight: 600;
  text-shadow: 0 0 6px rgba(167, 139, 250, 0.3);
}

.data-cps {
  color: #4ade80;
  font-size: 0.72rem;
  font-weight: 600;
  opacity: 0.75;
}

.data-unit {
  font-size: 0.6rem;
  font-weight: 400;
  opacity: 0.65;
}

.efficiency-warn {
  color: #fb923c;
  font-size: 0.65rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.15rem;
  text-shadow: 0 0 5px rgba(251, 146, 60, 0.4);
}

/* ── Header ─────────────────────────────────────────── */
.scene-header {
  background: linear-gradient(90deg, #0d1a28 0%, #0a1520 100%);
  border-bottom: 1px solid rgba(56, 153, 250, 0.15);
}

.header-icon {
  color: #3899fa;
  font-size: 0.9rem;
  text-shadow: 0 0 8px rgba(56, 153, 250, 0.8);
}

.header-title {
  color: #93c5fd;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.header-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px #4ade80;
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 4px #4ade80; }
  50%       { opacity: 0.5; box-shadow: 0 0 10px #4ade80; }
}

.header-status {
  color: #4ade80;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  opacity: 0.8;
}

.cps-text {
  color: #4ade80;
  font-size: 0.72rem;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
}

.cps-unit {
  color: #4ade8099;
  font-size: 0.6rem;
  font-weight: 400;
}

.rush-badge {
  color: #fbbf24;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.8);
  animation: rush-glow 0.6s infinite alternate;
}

@keyframes rush-glow {
  from { text-shadow: 0 0 6px rgba(251,191,36,0.6); }
  to   { text-shadow: 0 0 14px rgba(251,191,36,1); }
}

.challenge-badge {
  color: #fb923c;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

/* ── Code area background effects ───────────────────── */
.scanlines {
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0, 0, 0, 0.12) 3px,
    rgba(0, 0, 0, 0.12) 4px
  );
  z-index: 1;
  pointer-events: none;
}

.top-fade {
  height: 32px;
  background: linear-gradient(to bottom, #080f18, transparent);
  z-index: 2;
}

/* ── Lines ──────────────────────────────────────────── */
.lines-scroll {
  scrollbar-width: none;
  -ms-overflow-style: none;
  z-index: 0;
}
.lines-scroll::-webkit-scrollbar { display: none; }

.line-row {
  line-height: 1.5;
  min-height: 1.5em;
  opacity: 0;
  animation: line-in 0.18s ease-out forwards;
}

@keyframes line-in {
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
}

.ln-num {
  color: #1e4a30;
  font-size: 0.65rem;
  min-width: 1.8rem;
  text-align: right;
}

.line-prompt {
  color: #166534;
  font-size: 0.72rem;
}

.code-text {
  color: #4ade80;
  font-size: 0.72rem;
  text-shadow: 0 0 6px rgba(74, 222, 128, 0.35);
}

.cursor-char {
  color: #4ade80;
  font-size: 0.72rem;
  text-shadow: 0 0 8px rgba(74, 222, 128, 0.9);
  animation: blink 1.06s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

/* ── Syntax colours (monochrome green palette) ──────── */
:deep(.ck) { color: #6ee7b7; text-shadow: 0 0 5px rgba(110,231,183,0.4); } /* keyword — brighter */
:deep(.cf) { color: #a7f3d0; }                                               /* fn name — lightest */
:deep(.cs) { color: #34d399; }                                               /* string — emerald */
:deep(.cn) { color: #6ee7b7; }                                               /* number */
:deep(.cc) { color: #166534; text-shadow: none; }                           /* comment — dimmest */
:deep(.cw) { color: #fb923c; text-shadow: 0 0 5px rgba(251,146,60,0.4); }  /* warning — amber */

/* ── Click particles ─────────────────────────────────── */
:deep(.click-particle) {
  position: absolute;
  font-family: monospace;
  pointer-events: none;
  z-index: 50;
  white-space: nowrap;
  transform: translate(-50%, -50%);
  will-change: transform, opacity;
}

@keyframes particle-fly {
  from {
    transform: translate(-50%, -50%) translate(0, 0) scale(1);
    opacity: 1;
  }
  to {
    transform: translate(-50%, -50%) translate(var(--px), var(--py)) scale(0.4);
    opacity: 0;
  }
}

/* ── Ripple ─────────────────────────────────────────── */
.ripple-ring {
  border: 1.5px solid rgba(74, 222, 128, 0.6);
  animation: ripple-out 0.5s ease-out forwards;
}

@keyframes ripple-out {
  to { width: 160px; height: 160px; opacity: 0; }
}

/* ── Click flash ────────────────────────────────────── */
.click-flash {
  background: radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease-out;
}
.click-flash.active { opacity: 1; }

/* ── Footer ─────────────────────────────────────────── */
.scene-footer {
  background: #0a1520;
  border-top: 1px solid rgba(56, 153, 250, 0.1);
  font-size: 0.6rem;
}

.footer-left {
  color: #1e4d7a;
  letter-spacing: 0.06em;
}

.footer-right {
  color: #1a3a52;
  font-style: italic;
}

/* ═══════════════════════════════════════════════════════
   CODE RUSH MODE — amber / gold theme
═══════════════════════════════════════════════════════ */
.rush-mode {
  border-color: rgba(251, 191, 36, 0.35);
  box-shadow: 0 0 24px rgba(251, 191, 36, 0.1), inset 0 0 40px rgba(0,0,0,0.4);
}

.rush-mode .scene-header {
  background: linear-gradient(90deg, #1a1500 0%, #120f00 100%);
  border-bottom-color: rgba(251, 191, 36, 0.2);
}

.rush-mode .header-dot {
  background: #fbbf24;
  box-shadow: 0 0 8px #fbbf24;
}

.rush-mode .header-icon  { color: #fbbf24; text-shadow: 0 0 8px rgba(251,191,36,0.9); }
.rush-mode .header-title { color: #fde68a; }
.rush-mode .header-status { color: #fbbf24; }
.rush-mode .cps-text { color: #fbbf24; text-shadow: 0 0 8px rgba(251,191,36,0.7); }

.rush-mode .code-text {
  color: #fde68a;
  text-shadow: 0 0 6px rgba(253, 230, 138, 0.4);
}
.rush-mode .line-prompt { color: #92400e; }
.rush-mode .cursor-char { color: #fbbf24; text-shadow: 0 0 10px rgba(251,191,36,1); }

.rush-mode :deep(.ck) { color: #fb923c; text-shadow: 0 0 5px rgba(251,146,60,0.5); }
.rush-mode :deep(.cf) { color: #fde68a; }
.rush-mode :deep(.cs) { color: #fcd34d; }
.rush-mode :deep(.cn) { color: #fb923c; }
.rush-mode :deep(.cc) { color: #78350f; text-shadow: none; }

.rush-mode .data-bar { border-bottom-color: rgba(251, 191, 36, 0.1); }
.rush-mode .data-cp { color: #fbbf24; text-shadow: 0 0 8px rgba(251,191,36,0.6); }
.rush-mode .data-cps { color: #fbbf24; }
.rush-mode .data-rp { color: #fcd34d; }

.rush-mode .ripple-ring { border-color: rgba(251, 191, 36, 0.7); }
.rush-mode .click-flash {
  background: radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%);
}
.rush-mode .scene-footer { border-top-color: rgba(251,191,36,0.15); }

/* ═══════════════════════════════════════════════════════
   CHALLENGE MODE — amber / orange warning (not red)
═══════════════════════════════════════════════════════ */
.challenge-mode {
  border-color: rgba(251, 146, 60, 0.3);
}

.challenge-mode .scene-header {
  background: linear-gradient(90deg, #1a0d00 0%, #130a00 100%);
  border-bottom-color: rgba(251, 146, 60, 0.2);
}

.challenge-mode .header-dot {
  background: #fb923c;
  box-shadow: 0 0 6px #fb923c;
}

.challenge-mode .header-status { color: #fb923c; }
</style>
