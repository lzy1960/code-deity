import Decimal from 'break_infinity.js'
import type { useGameStore } from '~/store/game'

/**
 * GameEngine 把"时间推进 + 自动化 + 离线收益"等纯逻辑从 Pinia store 中剥离出来。
 * store 只负责持有状态，engine 负责按 tick 把状态推进到下一个时刻。
 *
 * 这样做的好处：
 *  - store 不再持有 setInterval，启停由调用方控制
 *  - 单元测试可以用 fixed delta 调用 engine.tick()，无需 fake timers
 *  - 未来若要在其他渲染框架（React Native 等）复用核心逻辑，只需导入 engine
 */

type GameStore = ReturnType<typeof useGameStore>

const TICK_INTERVAL_MS = 50
const OFFLINE_THRESHOLD_SECONDS = 10
const OFFLINE_CAP_SECONDS = 3600

export class GameEngine {
  private intervalId: ReturnType<typeof setInterval> | null = null

  constructor(private readonly store: GameStore) {}

  /** 启动游戏循环。重复调用是安全的（已运行时不会创建多个 interval）。 */
  start() {
    if (this.intervalId !== null) return
    this.intervalId = setInterval(() => this.tick(), TICK_INTERVAL_MS)
  }

  /** 停止游戏循环。 */
  stop() {
    if (this.intervalId === null) return
    clearInterval(this.intervalId)
    this.intervalId = null
  }

  /** 推进一帧。可由外部测试代码直接调用（传入 deltaMs 可控）。 */
  tick() {
    const store = this.store
    const now = Date.now()
    store.currentTime = now
    const deltaMs = now - store.lastUpdateTime
    this.simulateProgress(deltaMs)

    // Code Rush 过期检查
    if (store.codeRushActiveExpiry !== null && store.codeRushActiveExpiry <= now) {
      store.endCodeRush()
    }

    if (store.isAutomationUnlocked) {
      this.runAutomators()
    }

    store.lastUpdateTime = now
    store.checkNarrativeMilestones()
  }

  /**
   * 推进生成器链 durationMs 毫秒。直接 mutate store。
   * 公开为 method 是因为 store.simulateProgress 仍被多个调用点引用，先做兼容。
   */
  simulateProgress(durationMs: number) {
    const store = this.store
    const diff = new Decimal(durationMs).div(1000)
    if (diff.lte(0)) return

    // 两步遍历：先快照所有产出，再 apply。避免同帧内级联。
    const productions: Decimal[] = []
    for (let i = 8; i >= 1; i--) {
      productions[i - 1] = store.generatorProduction(i)
    }

    for (let i = 8; i > 1; i--) {
      store.generators[i - 2]!.amount = store.generators[i - 2]!.amount.plus(
        productions[i - 1]!.times(diff)
      )
    }

    let cpGain = productions[0]!
    const penalty = store.architecturalOverheadPenalty
    if (penalty < 1) cpGain = cpGain.times(penalty)
    store.currency = store.currency.plus(cpGain.times(diff))

    // ## Abstraction School: Supply Chain Optimization ##
    if (store.paradigms.supply_chain_optimization) {
      const bonusForClass = productions[3]!.times(0.05).times(diff)
      store.generators[2]!.amount = store.generators[2]!.amount.plus(bonusForClass)
    }
  }

  /**
   * 计算离线收益并存入 store.pendingOfflineGains。
   * 生成离线收益快照后立即推进 lastUpdateTime，避免弹窗打开期间游戏循环再次补同一段时间。
   */
  calculateOfflineProgress(): boolean {
    const store = this.store
    const now = Date.now()
    const diffSeconds = (now - store.lastUpdateTime) / 1000

    if (diffSeconds < OFFLINE_THRESHOLD_SECONDS) {
      store.lastUpdateTime = now
      return false
    }

    const effectiveDiff = Math.min(diffSeconds, OFFLINE_CAP_SECONDS)

    let cpPerSecond = store.generatorProduction(1)
    const penalty = store.architecturalOverheadPenalty
    if (penalty < 1) cpPerSecond = cpPerSecond.times(penalty)

    const totalCpGained = cpPerSecond.times(effectiveDiff)
    if (totalCpGained.gt(0)) {
      store.pendingOfflineGains = { cp: totalCpGained, diff: effectiveDiff }
      store.lastUpdateTime = now
      return true
    }
    store.lastUpdateTime = now
    return false
  }

  // --- Automation ---
  private runAutomators() {
    const store = this.store
    if (store.paradigms.continuous_integration) {
      this.runIntelligentAutomator()
    } else {
      this.runDefaultAutomator()
    }
  }

  private runIntelligentAutomator() {
    const store = this.store
    let bestTarget: { id: number; cost: Decimal } | null = null
    for (let i = 8; i >= 1; i--) {
      if (!store.automatorStates[i]) continue
      const progressInfo = store.getProgressInfo(i)
      if (progressInfo.nextBonus <= 0) continue
      const cost = store.costForAmount(i, new Decimal(progressInfo.nextBonus))
      if (store.currency.gte(cost)) {
        if (!bestTarget || cost.lt(bestTarget.cost)) {
          bestTarget = { id: i, cost }
        }
      }
    }
    if (bestTarget) store.buyGenerator(bestTarget.id)
  }

  private runDefaultAutomator() {
    const store = this.store
    for (let i = 8; i >= 1; i--) {
      if (!store.automatorStates[i]) continue
      const original = store.buyMultiplier
      store.setBuyMultiplier('max')
      store.buyGenerator(i)
      store.setBuyMultiplier(original)
    }
  }
}

const _engineByStore = new WeakMap<object, GameEngine>()

/** 返回与 store 绑定的 GameEngine 实例。同一 store 始终复用，不同 store（测试场景）各自独立。 */
export function getGameEngine(store: GameStore): GameEngine {
  let e = _engineByStore.get(store as object)
  if (!e) {
    e = new GameEngine(store)
    _engineByStore.set(store as object, e)
  }
  return e
}
