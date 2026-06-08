import { defineStore } from 'pinia'
import Decimal from 'break_infinity.js'
import { generatorConfigs, prestigeThresholds, type GeneratorConfig, type NarrativeMilestone, narrativeMilestones } from '~~/game/configs'
import { paradigmConfigs } from '~~/game/paradigms.configs'
import { getGameEngine } from '~~/game/engine'

// #region -------- Interfaces and Types --------

export type BuyMultiplier = 'x1' | 'x10' | 'x100' | 'max'

export interface Generator {
  id: number
  amount: Decimal
  bought: number
}

export interface ChallengeCompletion {
  challenge1: boolean
  challenge2: boolean
  challenge3: boolean
  challenge4: boolean
}

export interface OfflineGains {
  cp: Decimal; // 离线期间获得的总CP
  diff: number; // 离线了多少秒
  generatorGains: {
    id: number;
    amount: Decimal;
  }[];
}

export interface GameState {
  saveVersion: string
  lastUpdateTime: number
  lastCloudSync: number | null // Timestamp of the last successful cloud sync
  currentTime: number // Added for reactivity of time-dependent getters
  currency: Decimal // CP, Code Power
  generators: Generator[]
  buyMultiplier: BuyMultiplier

  // Prestige Layers
  refactorPoints: Decimal // RP, Refactor Points
  refactorCount: number
  version: number // Prestige layer 2

  // Singularity
  singularityPower: Decimal // SP, Singularity Power
  unlockedSingularity: boolean
  paradigms: Record<string, boolean>
  singularityCount: number
  breakthroughReadiness: number

  // Challenges
  challengeCompletions: ChallengeCompletion
  activeChallenge: 'none' | 'challenge1' | 'challenge2' | 'challenge3' | 'challenge4'

  // Automation
  automatorStates: Record<number, boolean>

  // Offline Gains
  pendingOfflineGains: OfflineGains | null

  // Narrative
  unlockedNarratives: string[]
  narrativeQueue: NarrativeMilestone[]

  // Technical Debt
  activeRefactoring: {
    paradigmId: string;
    frozenParadigms: string[];
    frozenSP: Decimal;
    cpCost: Decimal;
  } | null

  // Code Rush
  codeRushCharge: number // Current charge level (0 to 100)
  codeRushActiveExpiry: number | null // Timestamp when Code Rush active state ends
  codeRushClickCount: number // Total manual clicks since last Code Rush activation or reset
}

// #endregion

// Plain (serializable) shape of GameState — Decimal becomes string when persisted.
// 用于 hydrate 的入参类型，强制编译期对齐字段，新增 state 字段时若忘记 hydrate 编译器会告警。
type DecimalToString<T> = {
  [K in keyof T]: T[K] extends Decimal
    ? string
    : T[K] extends Decimal | null
      ? string | null
      : T[K] extends Array<infer U>
        ? Array<DecimalToString<U>>
        : T[K] extends object | null
          ? T[K] extends null ? DecimalToString<NonNullable<T[K]>> | null : DecimalToString<T[K]>
          : T[K]
}

export type SerializableGameState = DecimalToString<GameState>

const CURRENT_SAVE_VERSION = '1.0.6'

const defaultChallengeCompletions = (): ChallengeCompletion => ({
  challenge1: false,
  challenge2: false,
  challenge3: false,
  challenge4: false,
})

const isBuyMultiplier = (value: unknown): value is BuyMultiplier => {
  return value === 'x1' || value === 'x10' || value === 'x100' || value === 'max'
}

const isActiveChallenge = (value: unknown): value is GameState['activeChallenge'] => {
  return value === 'none' || value === 'challenge1' || value === 'challenge2' || value === 'challenge3' || value === 'challenge4'
}

export const useGameStore = defineStore('game', {
  // #region -------- STATE --------
  state: (): GameState => ({
    saveVersion: CURRENT_SAVE_VERSION, // version up for state change
    lastUpdateTime: Date.now(),
    lastCloudSync: null,
    currentTime: Date.now(), // Initialize with current time
    currency: new Decimal(0),
    generators: generatorConfigs.map(config => ({
      id: config.id,
      amount: new Decimal(0),
      bought: 0
    })),
    buyMultiplier: 'x1',

    refactorPoints: new Decimal(0),
    refactorCount: 0,
    version: 0,

    singularityPower: new Decimal(0),
    unlockedSingularity: false,
    paradigms: {},
    singularityCount: 0,
    breakthroughReadiness: 0,

    challengeCompletions: {
      challenge1: false,
      challenge2: false,
      challenge3: false,
      challenge4: false
    },
    activeChallenge: 'none',

    automatorStates: {},
    pendingOfflineGains: null,

    unlockedNarratives: [],
    narrativeQueue: [],

    activeRefactoring: null,

    // Code Rush
    codeRushCharge: 0,
    codeRushActiveExpiry: null,
    codeRushClickCount: 0,
  }),
  // #endregion

  // #region -------- GETTERS --------
  getters: {
    // --- System Unlocks ---
    isGeneratorUnlocked: state => (id: number): boolean => {
      if (id === 1) return true
      const prevGenerator = state.generators[id - 2]
      return prevGenerator ? prevGenerator.bought > 0 : false
    },
    isRefactorUnlocked: state => {
      const aiCore = state.generators[7]
      return (aiCore?.bought ?? 0) >= prestigeThresholds.REFACTOR_UNLOCK_AI_CORES || state.refactorCount > 0
    },
    canRefactor: state => {
      const aiCore = state.generators[7]
      return (aiCore?.bought ?? 0) >= prestigeThresholds.REFACTOR_UNLOCK_AI_CORES
    },
    isCompileUnlocked: state => state.refactorPoints.gte(prestigeThresholds.COMPILE_UNLOCK_RP) || state.version > 0,
    isAutomationUnlocked: state => {
      if (state.paradigms.dependency_injection) {
        return true
      }
      return state.version > 0
    },
    isChallengesUnlocked: state => state.version >= 2,
    isBreakthroughReadinessUnlocked(): boolean {
      return this.version > 0 || this.effectiveBreakthroughReadiness > 0 || this.singularityCount > 0
    },
    isMultiplierUnlocked: state => {
      const moduleGenerator = state.generators[3]
      return (moduleGenerator?.bought ?? 0) > 0 || state.refactorCount > 0
    },
    // --- Soft Cap: Architectural Overhead ---
    architecturalOverheadPenalty: state => {
      const aiCores = state.generators[7]!.bought
      if (aiCores <= prestigeThresholds.ARCHITECTURAL_OVERHEAD_AI_CORES) return 1

      let penaltyFactor = 0.3
      if (state.paradigms.api_interface) {
        penaltyFactor *= 0.5 // Penalty effect is reduced by 50%
      }

      return 1 / (1 + penaltyFactor * Math.log10(aiCores - (prestigeThresholds.ARCHITECTURAL_OVERHEAD_AI_CORES - 1)))
    },

    // --- Core Production Calculation ---
    generatorConfig: () => (id: number) => {
      return generatorConfigs.find(c => c.id === id)!
    },

    effectiveGeneratorConfig(): (id: number) => GeneratorConfig {
      // 基于响应式依赖一次性预计算所有生成器的有效配置，Pinia 会按依赖（paradigms / challengeCompletions / activeChallenge）缓存。
      // 取代了原本每次调用都 spread 创建对象的实现，游戏循环中调用 8+ 次/tick 的开销显著降低。
      const memoryManagement = this.paradigms.memory_management
      const challenge4Completed = this.challengeCompletions.challenge4
      const challenge4Active = this.activeChallenge === 'challenge4'

      const map = new Map<number, GeneratorConfig>()
      for (const original of generatorConfigs) {
        let baseCost = original.baseCost
        let costMultiplier = original.costMultiplier
        if (memoryManagement) baseCost = baseCost.times(0.8)
        if (challenge4Completed) baseCost = baseCost.times(0.95)
        if (challenge4Active) costMultiplier = costMultiplier.plus(0.08)
        map.set(original.id, {
          ...original,
          baseCost,
          costMultiplier,
        })
      }
      return (id: number) => map.get(id)!
    },

    // --- Cost & Amount Calculation for Multi-buy ---
    buyAmount() {
      return (id: number): Decimal => {
        if (this.buyMultiplier !== 'max') {
          return new Decimal(parseInt(this.buyMultiplier.slice(1)))
        }
        
        const config = this.effectiveGeneratorConfig(id)
        const generator = this.generators[id - 1]!
        const r = config.costMultiplier
        const k = generator.bought
        const B = config.baseCost

        if (this.currency.lt(B.times(r.pow(k)))) return new Decimal(0)

        // n <= log_r(C * (r - 1) / (B * r^k) + 1)
        const num = this.currency.times(r.minus(1)).div(B.times(r.pow(k))).plus(1)
        const n = Decimal.floor(num.log(r.toNumber()))
        return n.max(0)
      }
    },
    costForAmount() {
      return (id: number, amount: Decimal): Decimal => {
        if (amount.eq(0)) return new Decimal(0)
        const config = this.effectiveGeneratorConfig(id)
        const generator = this.generators[id - 1]!
        const r = config.costMultiplier
        const k = generator.bought
        const B = config.baseCost
        
        // cost = B * r^k * (r^n - 1) / (r - 1)
        return B.times(r.pow(k)).times(r.pow(amount).minus(1)).div(r.minus(1))
      }
    },
    generatorCost() {
      return (id: number): Decimal => {
        const amount = this.buyAmount(id)
        return this.costForAmount(id, amount)
      }
    },

    getBuyBonus() {
      return (bought: number): number => {
        let bonuses = 0
        const tier1BonusCap = this.challengeCompletions.challenge3 ? 12 : 10
        const tier1MaxBought = tier1BonusCap * 10

        // 0-100 (or 120 with reward): every 10
        bonuses += Math.min(tier1BonusCap, Math.floor(Math.max(0, bought) / 10))
        
        // 101 (or 121) - 1000: every 20
        const tier2BonusCount = Math.floor(Math.max(0, bought - tier1MaxBought) / 20)
        bonuses += Math.min(45, tier2BonusCount) // This cap might need adjustment if tier1MaxBought changes, but for now it's a simple extension.
        
        // 1001-5000: every 50
        bonuses += Math.min(80, Math.floor(Math.max(0, bought - 1000) / 50))
        // 5001+: every 100
        bonuses += Math.floor(Math.max(0, bought - 5000) / 100)
        return bonuses
      }
    },

    buy10Bonus() {
      return (id: number): Decimal => {
        const generator = this.generators[id - 1]!
        
        // Base bonus
        let bonusPerLevel = this.challengeCompletions.challenge1 ? 1.8 : 1.65
        
        const bonusLevels = this.getBuyBonus(generator.bought)
        let bonus = Decimal.pow(bonusPerLevel, bonusLevels)

        if (this.activeChallenge === 'challenge1' && id <= 7) {
          bonus = bonus.pow(0.5)
        }
        if (this.activeChallenge === 'challenge3') {
          bonus = bonus.pow(0.4)
        }

        // ## Abstraction School: Polymorphism ##
        if (this.paradigms.polymorphism && id > 1) {
          const prevGenerator = this.generators[id - 2]!
          const prevBonusLevels = this.getBuyBonus(prevGenerator.bought)
          const prevBonus = Decimal.pow(bonusPerLevel, prevBonusLevels)
          const inheritedBonus = prevBonus.minus(1).times(0.05).plus(1).min(3)
          bonus = bonus.times(inheritedBonus)
        }
        
        return bonus
      }
    },

    getProgressInfo() {
      return (id: number): { progress: number, nextBonus: number } => {
        const generator = this.generators[id - 1]!
        const bought = generator.bought
        if (bought < 100) {
          return { progress: (bought % 10) / 10 * 100, nextBonus: 10 - (bought % 10) }
        }
        if (bought < 1000) {
          return { progress: ((bought - 100) % 20) / 20 * 100, nextBonus: 20 - ((bought - 100) % 20) }
        }
        if (bought < 5000) {
          return { progress: ((bought - 1000) % 50) / 50 * 100, nextBonus: 50 - ((bought - 1000) % 50) }
        }
        return { progress: ((bought - 5000) % 100) / 100 * 100, nextBonus: 100 - ((bought - 5000) % 100) }
      }
    },
    
    rpBonus(): Decimal {
      if (this.activeChallenge === 'challenge2') return new Decimal(1)

      let versionMultiplier = this.paradigms.enterprise_architecture ? 1.5 : 1
      const versionBonus = Decimal.pow(1.2, this.version * versionMultiplier)
      
      let baseBonus = this.refactorPoints.times(0.1)

      // ## Agility School: JIT Compilation ##
      if (this.paradigms.jit_compilation) {
        baseBonus = baseBonus.times(1.25)
      }

      let finalBonus = new Decimal(1).plus(baseBonus.times(versionBonus))

      // ## Efficiency School: Compiler Optimization ##
      if (this.paradigms.compiler_optimization) {
        let totalBuyBonusLevels = 0
        for (const gen of this.generators) {
          totalBuyBonusLevels += this.getBuyBonus(gen.bought)
        }
        finalBonus = finalBonus.times(1 + totalBuyBonusLevels * 0.01)
      }

      return finalBonus
    },

    globalMultiplier(): Decimal {
      if (this.activeChallenge === 'challenge2') return new Decimal(1)

      let totalBonus = new Decimal(0)
      for (const gen of this.generators) {
        const config = this.generatorConfig(gen.id)
        if (config.globalMultiplierBonus && config.globalMultiplierBonus > 0) {
          totalBonus = totalBonus.plus(gen.bought * config.globalMultiplierBonus)
        }
      }
      return new Decimal(1).plus(totalBonus)
    },
    
    challenge2Bonus(): Decimal {
        return this.challengeCompletions.challenge2 ? new Decimal(1.5) : new Decimal(1)
    },

    generatorProductionForAmount() {
      return (id: number, amount: Decimal): Decimal => {
        const config = this.effectiveGeneratorConfig(id)

        let production = config.baseProduction
          .times(amount)
          .times(this.buy10Bonus(id))
          .times(this.rpBonus)
          .times(this.globalMultiplier)

        // --- Apply Paradigm Bonuses ---
        // ## General School ##
        if (this.paradigms.system_kernel) {
          production = production.times(1.25)
        }
        if (this.paradigms.open_source_community) {
          const schoolStarters = ['efficiency_starter', 'abstraction_starter', 'agility_starter']
          const learnedStarters = schoolStarters.filter(s => this.paradigms[s]).length
          production = production.times(1 + 0.15 * learnedStarters)
        }

        // ## Efficiency School ##
        if (this.paradigms.pointer_arithmetic && (id === 1 || id === 2)) {
          production = production.times(10)
        }
        if (this.paradigms.bit_manipulation) {
          production = production.times(1.5)
        }
        if (this.paradigms.assembly_instruction) {
          production = production.times(Math.min(500, Math.max(1, this.refactorCount * 4)))
        }

        // ## Abstraction School: Design Patterns ##
        if (this.paradigms.design_patterns) {
          production = production.times(1.2)
        }

        return production
      }
    },

    generatorProduction() {
      return (id: number): Decimal => {
        const generator = this.generators[id - 1]!
        return this.generatorProductionForAmount(id, generator.amount)
      }
    },
    
    cps(): Decimal {
      let finalCps = this.generatorProduction(1)
      const penalty = this.architecturalOverheadPenalty
      if (penalty < 1) {
        finalCps = finalCps.times(penalty)
      }
      // Apply Technical Debt penalty
      if (this.activeRefactoring) {
        finalCps = finalCps.times(0.9) // 10% penalty
      }
      return finalCps
    },

    manualClickPower(): Decimal {
      let baseClickPower = this.cps.times(this.paradigms.code_generation ? 0.08 : 0.05);
      // Ensure baseClickPower is at least 1, even if CPS is very small
      if (baseClickPower.lt(1)) {
        baseClickPower = new Decimal(1);
      }

      if (this.isCodeRushActive) {
        baseClickPower = baseClickPower.times(prestigeThresholds.CODE_RUSH_MULTIPLIER);
      }
      return baseClickPower;
    },

    // --- Code Rush ---
    isCodeRushActive: state => {
      return state.codeRushActiveExpiry !== null && state.codeRushActiveExpiry > state.currentTime;
    },
    isCodeRushReady: state => {
      const isActive = state.codeRushActiveExpiry !== null && state.codeRushActiveExpiry > state.currentTime;
      return state.codeRushCharge >= 100 && !isActive;
    },
    codeRushProgress: state => {
      const isActive = state.codeRushActiveExpiry !== null && state.codeRushActiveExpiry > state.currentTime;
      if (isActive) {
        const remaining = Math.max(0, state.codeRushActiveExpiry! - state.currentTime);
        return (remaining / (prestigeThresholds.CODE_RUSH_DURATION_SECONDS * 1000)) * 100;
      } else {
        return state.codeRushCharge;
      }
    },
    codeRushTimeRemaining: state => {
      const isActive = state.codeRushActiveExpiry !== null && state.codeRushActiveExpiry > state.currentTime;
      if (isActive) {
        return Math.max(0, Math.floor((state.codeRushActiveExpiry! - state.currentTime) / 1000));
      }
      return 0;
    },

    // --- Prestige Gain Calculation ---
    refactorGain(): Decimal {
      if (this.currency.log10() < 20) return new Decimal(0)
      let gain = Decimal.floor(
        Decimal.pow(this.currency.log10() / 20, 1.8)
      ).times(this.challenge2Bonus)

      // ## Agility School ##
      if (this.paradigms.refactoring_tools) {
        gain = gain.plus(1)
      }
      if (this.paradigms.metaprogramming) {
        gain = gain.times(1.2)
      }

      return gain
    },

    compileCost(): Decimal {
      return new Decimal(10).times(Math.pow(this.version + 1, 2))
    },

    hasPendingOfflineGains: (state): boolean => {
      return state.pendingOfflineGains !== null
    },

    // --- Singularity ---
    earnedBreakthroughReadiness: state => {
      const completedChallenges = Object.values(state.challengeCompletions).filter(Boolean).length
      return Math.min(
        prestigeThresholds.BREAKTHROUGH_READINESS_REQUIRED,
        state.version * prestigeThresholds.BREAKTHROUGH_COMPILE_REWARD +
          completedChallenges * prestigeThresholds.BREAKTHROUGH_CHALLENGE_REWARD
      )
    },

    effectiveBreakthroughReadiness(): number {
      return Math.min(
        prestigeThresholds.BREAKTHROUGH_READINESS_REQUIRED,
        Math.max(this.breakthroughReadiness, this.earnedBreakthroughReadiness)
      )
    },

    canSingularity(): boolean {
      if (this.singularityCount > 0) return this.currency.gte('1e120')
      return this.currency.gte('1e120') && this.effectiveBreakthroughReadiness >= prestigeThresholds.BREAKTHROUGH_READINESS_REQUIRED
    },

    singularityGain(): Decimal {
      if (!this.canSingularity) return new Decimal(0)
      // SP = floor(sqrt(log10(CP) - 120) * 6). The first breakthrough needs to feel transformative.
      const gain = Decimal.floor(
        Decimal.sqrt(this.currency.log10() - 120).times(6)
      )
      return gain.max(this.singularityCount === 0 ? 3 : 1)
    },

    paradigmPurchaseAnalysis() {
      return (paradigmId: string) => {
        const config = paradigmConfigs.find(p => p.id === paradigmId)!
        const starterIds = ['efficiency_starter', 'abstraction_starter', 'agility_starter']
        const purchasedStarters = starterIds.filter(id => this.paradigms[id])

        // Rule: Max two schools
        if (purchasedStarters.length >= 2 && starterIds.includes(paradigmId) && !this.paradigms[paradigmId]) {
          return { purchasable: false, reason: 'school_limit', conflictingParadigm: null }
        }

        // Rule: Dependencies
        if (config.requires) {
          for (const reqId of config.requires) {
            if (!this.paradigms[reqId]) {
              return { purchasable: false, reason: 'dependency', conflictingParadigm: null }
            }
          }
        }

        // Rule: Cost
        if (this.singularityPower.lt(config.cost)) {
          return { purchasable: false, reason: 'sp', conflictingParadigm: null }
        }

        // Rule: Mutual Exclusion
        const forks: Record<string, string[]> = {
          'design_patterns': ['polymorphism', 'dependency_injection'],
          'dynamic_typing': ['jit_compilation', 'refactoring_tools'],
        }
        for (const parent in forks) {
          const children = forks[parent]!
          if (children.includes(paradigmId)) {
            const otherChild = children.find(c => c !== paradigmId)!
            if (this.paradigms[otherChild]) {
              return { purchasable: false, reason: 'exclusive', conflictingParadigm: otherChild }
            }
          }
        }

        return { purchasable: true, reason: null, conflictingParadigm: null }
      }
    }
  },
  // #endregion

  // #region -------- ACTIONS --------
  actions: {
    /**
     * Hydrates the store from a plain JavaScript object (e.g., from a save file).
     * 显式列出每个字段，新增 GameState 字段时编译器会强制提醒在此处补充加载逻辑。
     */
    hydrate(s: Partial<SerializableGameState>) {
      this.saveVersion = CURRENT_SAVE_VERSION
      this.lastUpdateTime = s.lastUpdateTime ?? Date.now()
      this.lastCloudSync = s.lastCloudSync ?? null
      this.currency = new Decimal(s.currency ?? 0)
      this.refactorPoints = new Decimal(s.refactorPoints ?? 0)
      this.refactorCount = s.refactorCount ?? 0
      this.version = s.version ?? 0
      this.buyMultiplier = isBuyMultiplier(s.buyMultiplier) ? s.buyMultiplier : 'x1'

      const savedGenerators = new Map((s.generators ?? []).map(g => [g.id, g]))
      this.generators = generatorConfigs.map(config => {
        const saved = savedGenerators.get(config.id)
        return {
          id: config.id,
          amount: new Decimal(saved?.amount ?? 0),
          bought: saved?.bought ?? 0,
        }
      })

      this.singularityPower = new Decimal(s.singularityPower ?? 0)
      this.unlockedSingularity = s.unlockedSingularity ?? false
      this.paradigms = s.paradigms ?? {}
      this.singularityCount = s.singularityCount ?? 0
      this.breakthroughReadiness = Math.min(prestigeThresholds.BREAKTHROUGH_READINESS_REQUIRED, Math.max(0, s.breakthroughReadiness ?? 0))

      this.challengeCompletions = {
        ...defaultChallengeCompletions(),
        ...(s.challengeCompletions ?? {}),
      }
      this.activeChallenge = isActiveChallenge(s.activeChallenge) ? s.activeChallenge : 'none'
      this.reconcileBreakthroughReadiness()

      this.automatorStates = s.automatorStates ?? {}
      this.pendingOfflineGains = s.pendingOfflineGains
        ? {
            cp: new Decimal(s.pendingOfflineGains.cp),
            diff: s.pendingOfflineGains.diff,
            generatorGains: (s.pendingOfflineGains.generatorGains ?? []).map(gain => ({
              id: gain.id,
              amount: new Decimal(gain.amount),
            })),
          }
        : null

      this.unlockedNarratives = s.unlockedNarratives ?? []
      this.narrativeQueue = (s.narrativeQueue ?? []) as NarrativeMilestone[]

      this.activeRefactoring = s.activeRefactoring
        ? {
            paradigmId: s.activeRefactoring.paradigmId,
            frozenParadigms: s.activeRefactoring.frozenParadigms,
            frozenSP: new Decimal(s.activeRefactoring.frozenSP),
            cpCost: new Decimal(s.activeRefactoring.cpCost),
          }
        : null

      this.codeRushCharge = s.codeRushCharge ?? 0
      this.codeRushActiveExpiry = s.codeRushActiveExpiry ?? null
      this.codeRushClickCount = s.codeRushClickCount ?? 0

      // currentTime 不来自存档，每次重新启动时取当前时间
      this.currentTime = Date.now()
    },

    /**
     * Returns a serializable plain object — Decimal 字段直接 toString，避免双序列化。
     */
    toJSON(): SerializableGameState {
      const decToStr = (d: Decimal): string => d.toString()
      return {
        saveVersion: this.saveVersion,
        lastUpdateTime: this.lastUpdateTime,
        lastCloudSync: this.lastCloudSync,
        currentTime: this.currentTime,
        currency: decToStr(this.currency),
        generators: this.generators.map(g => ({
          id: g.id,
          amount: decToStr(g.amount),
          bought: g.bought,
        })),
        buyMultiplier: this.buyMultiplier,
        refactorPoints: decToStr(this.refactorPoints),
        refactorCount: this.refactorCount,
        version: this.version,
        singularityPower: decToStr(this.singularityPower),
        unlockedSingularity: this.unlockedSingularity,
        paradigms: { ...this.paradigms },
        singularityCount: this.singularityCount,
        breakthroughReadiness: this.breakthroughReadiness,
        challengeCompletions: { ...this.challengeCompletions },
        activeChallenge: this.activeChallenge,
        automatorStates: { ...this.automatorStates },
        pendingOfflineGains: this.pendingOfflineGains
          ? {
              cp: decToStr(this.pendingOfflineGains.cp),
              diff: this.pendingOfflineGains.diff,
              generatorGains: this.pendingOfflineGains.generatorGains.map(gain => ({
                id: gain.id,
                amount: decToStr(gain.amount),
              })),
            }
          : null,
        unlockedNarratives: [...this.unlockedNarratives],
        narrativeQueue: this.narrativeQueue.map(m => ({ ...m })) as any,
        activeRefactoring: this.activeRefactoring
          ? {
              paradigmId: this.activeRefactoring.paradigmId,
              frozenParadigms: [...this.activeRefactoring.frozenParadigms],
              frozenSP: decToStr(this.activeRefactoring.frozenSP),
              cpCost: decToStr(this.activeRefactoring.cpCost),
            }
          : null,
        codeRushCharge: this.codeRushCharge,
        codeRushActiveExpiry: this.codeRushActiveExpiry,
        codeRushClickCount: this.codeRushClickCount,
      }
    },

    gameLoop() {
      // 实际 tick 逻辑见 game/engine.ts。该方法保留是为了向后兼容（测试与历史调用点）。
      getGameEngine(this as any).tick()
    },

    simulateProgress(durationInMs: number) {
      // 实际推进逻辑见 game/engine.ts。
      getGameEngine(this as any).simulateProgress(durationInMs)
    },

    manualClick() {
      const clickPower = this.manualClickPower;
      this.currency = this.currency.plus(clickPower)
      this.checkNarrativeMilestones()

      // Code Rush charging logic
      if (!this.isCodeRushActive) {
        this.codeRushClickCount++;
        const chargePerClick = (100 / prestigeThresholds.CODE_RUSH_CHARGE_CLICKS) * (this.paradigms.code_generation ? 1.5 : 1);
        this.codeRushCharge = Math.min(100, this.codeRushCharge + chargePerClick);
      }
    },

    buyGenerator(id: number) {
      const amountToBuy = this.buyAmount(id)
      if (amountToBuy.eq(0)) return

      const cost = this.costForAmount(id, amountToBuy)

      if (this.currency.gte(cost)) {
        this.currency = this.currency.minus(cost)
        const generator = this.generators[id - 1]!
        generator.amount = generator.amount.plus(amountToBuy)
        generator.bought += amountToBuy.toNumber()

        // ## Agility School: Dynamic Typing ##
        if (this.paradigms.dynamic_typing && id > 1) {
          const prevGenerator = this.generators[id - 2]!
          prevGenerator.amount = prevGenerator.amount.plus(amountToBuy)
        }
      }
      this.checkNarrativeMilestones()
    },

    setBuyMultiplier(multiplier: BuyMultiplier) {
      this.buyMultiplier = multiplier
    },

    toggleAutomator(id: number) {
      this.automatorStates[id] = !this.automatorStates[id]
    },
    
    // --- Code Rush Actions ---
    activateCodeRush() {
      if (!this.isCodeRushReady) return;

      const duration = prestigeThresholds.CODE_RUSH_DURATION_SECONDS * 1000; // in ms
      this.codeRushActiveExpiry = Date.now() + duration;
      this.codeRushCharge = 0;
      this.codeRushClickCount = 0;
    },

    endCodeRush() {
      this.codeRushActiveExpiry = null;
    },

    // --- Prestige Actions ---
    _resetForPrestige(startingCurrency: Decimal = new Decimal(10)) {
      this.currency = startingCurrency
      this.generators.forEach(g => {
        g.amount = new Decimal(0)
        g.bought = 0
      })
      this.lastUpdateTime = Date.now()
    },

    refactor() {
      if (!this.canRefactor) return

      const gain = this.refactorGain
      if (gain.lte(0)) return
      const completedChallenge = this.activeChallenge !== 'none'

      // --- Challenge Completion Check ---
      if (this.activeChallenge === 'challenge1') {
        this.challengeCompletions.challenge1 = true
        this.activeChallenge = 'none' // Auto-exit challenge on completion
      } else if (this.activeChallenge === 'challenge2') {
        this.challengeCompletions.challenge2 = true
        this.activeChallenge = 'none'
      } else if (this.activeChallenge === 'challenge3') {
        this.challengeCompletions.challenge3 = true
        this.activeChallenge = 'none'
      } else if (this.activeChallenge === 'challenge4') {
        this.challengeCompletions.challenge4 = true
        this.activeChallenge = 'none'
      }

      if (gain.gt(0)) {
        this.refactorPoints = this.refactorPoints.plus(gain)
        this.refactorCount += 1
      }
      if (completedChallenge) {
        this.addBreakthroughReadiness(prestigeThresholds.BREAKTHROUGH_CHALLENGE_REWARD)
      } else if (gain.gte(prestigeThresholds.BREAKTHROUGH_REFACTOR_GAIN_THRESHOLD)) {
        this.addBreakthroughReadiness(prestigeThresholds.BREAKTHROUGH_REFACTOR_REWARD)
      }

      this._resetForPrestige()
      this.checkNarrativeMilestones()
    },

    compileAndRelease() {
      if (!this.isCompileUnlocked) return
      const cost = this.compileCost
      if (this.refactorPoints.lt(cost)) return

      this.refactorPoints = this.refactorPoints.minus(cost)
      this.version += 1

      // A "Compile & Release" is a type of refactor, so we increment the count.
      this.refactorCount += 1
      this.addBreakthroughReadiness(prestigeThresholds.BREAKTHROUGH_COMPILE_REWARD)
      // Then, we perform the reset, but without generating new RP.
      this._resetForPrestige()

      this.checkNarrativeMilestones()
    },

    performSingularityReset() {
      if (!this.canSingularity) return

      const spGain = this.singularityGain

      if (spGain.gt(0)) {
        this.singularityPower = this.singularityPower.plus(spGain)
        this.singularityCount += 1
        this.unlockedSingularity = true
      }

      // --- SOFT RESET ---
      // Only reset active progress, keeping first-era prestige layers.
      this.currency = new Decimal(10)
      this.generators.forEach(g => {
        g.amount = new Decimal(0)
        g.bought = 0
      })
      this.lastUpdateTime = Date.now()

      // Exit any active challenge, but keep completions
      this.activeChallenge = 'none'

      this.checkNarrativeMilestones()
    },

    purchaseParadigm(paradigmId: string) {
      const config = paradigmConfigs.find(p => p.id === paradigmId)
      if (!config) {
        console.error(`Paradigm with id ${paradigmId} not found.`)
        return
      }

      // 1. Check if already purchased
      if (this.paradigms[paradigmId]) return

      const analysis = this.paradigmPurchaseAnalysis(paradigmId)
      if (!analysis.purchasable) {
        console.warn(`Cannot purchase ${paradigmId}. Reason: ${analysis.reason}`)
        return
      }

      // All checks passed, purchase the paradigm
      this.singularityPower = this.singularityPower.minus(config.cost)
      this.paradigms[paradigmId] = true
    },

    startChallenge(challenge: 'challenge1' | 'challenge2' | 'challenge3' | 'challenge4') {
      if (this.challengeCompletions[challenge]) return // Cannot start a completed challenge
      this.activeChallenge = challenge
      this._resetForPrestige()
    },

    exitChallenge() {
      if (this.activeChallenge === 'none') return
      this.activeChallenge = 'none'
      this._resetForPrestige()
    },

    hardReset() {
      // Manually reset all state properties to their initial values
      // This is more robust than this.$reset() and avoids potential issues.
      this.saveVersion = CURRENT_SAVE_VERSION
      this.lastUpdateTime = Date.now()
      this.lastCloudSync = null
      this.currency = new Decimal(0)
      this.generators = generatorConfigs.map(config => ({
        id: config.id,
        amount: new Decimal(0),
        bought: 0
      }))
      this.buyMultiplier = 'x1'
      this.refactorPoints = new Decimal(0)
      this.refactorCount = 0
      this.version = 0
      this.singularityPower = new Decimal(0)
      this.unlockedSingularity = false
      this.paradigms = {}
      this.singularityCount = 0
      this.breakthroughReadiness = 0
      this.challengeCompletions = defaultChallengeCompletions()
      this.activeChallenge = 'none'
      this.automatorStates = {}
      this.pendingOfflineGains = null
      this.unlockedNarratives = []
      this.narrativeQueue = []
      this.activeRefactoring = null

      // Reset Code Rush state
      this.codeRushCharge = 0;
      this.codeRushActiveExpiry = null;
      this.codeRushClickCount = 0;

      console.log('Game state has been manually reset to initial values.')
    },

    startGameLoop() {
      // 委托给 engine 单例。重复调用安全。
      this.reconcileBreakthroughReadiness()
      getGameEngine(this as any).start()
    },

    stopGameLoop() {
      getGameEngine(this as any).stop()
    },

    calculateOfflineProgress(): boolean {
      this.reconcileBreakthroughReadiness()
      return getGameEngine(this as any).calculateOfflineProgress()
    },

    addBreakthroughReadiness(amount: number) {
      if (amount <= 0 || this.singularityCount > 0) return
      this.breakthroughReadiness = Math.min(
        prestigeThresholds.BREAKTHROUGH_READINESS_REQUIRED,
        Math.max(0, this.breakthroughReadiness + amount)
      )
    },

    reconcileBreakthroughReadiness() {
      if (this.singularityCount > 0) return

      this.breakthroughReadiness = Math.min(
        prestigeThresholds.BREAKTHROUGH_READINESS_REQUIRED,
        Math.max(this.breakthroughReadiness, this.earnedBreakthroughReadiness)
      )
    },

    applyOfflineGains() {
      if (!this.pendingOfflineGains) return

      this.currency = this.currency.plus(this.pendingOfflineGains.cp)
      for (const gain of this.pendingOfflineGains.generatorGains ?? []) {
        const generator = this.generators[gain.id - 1]
        if (generator) {
          generator.amount = generator.amount.plus(gain.amount)
        }
      }
      this.lastUpdateTime = Date.now()
      this.pendingOfflineGains = null
    },

    // --- Narrative Actions ---
    checkNarrativeMilestones() {
      // 全部解锁后直接 return，避免游戏循环每 50ms 都遍历整个里程碑列表
      if (this.unlockedNarratives.length >= narrativeMilestones.length) return

      const unlocked = new Set(this.unlockedNarratives)
      for (const milestone of narrativeMilestones) {
        if (unlocked.has(milestone.id)) continue

        let conditionMet = false
        const { type, value, generatorId } = milestone.condition

        switch (type) {
          case 'game_start':
            // This is a special case that should only trigger once at the very beginning.
            // The check for `unlockedNarratives` at the start of the loop handles this.
            conditionMet = true
            break
          case 'currency':
            if (this.currency.gte(value as number)) {
              conditionMet = true
            }
            break
          case 'generator_bought':
            if (generatorId) {
              const generator = this.generators[generatorId - 1]
              if (generator && generator.bought >= (value as number)) {
                conditionMet = true
              }
            }
            break
          case 'refactor_count':
            if (this.refactorCount >= (value as number)) {
              conditionMet = true
            }
            break
          case 'version_count':
            if (this.version >= (value as number)) {
              conditionMet = true
            }
            break
          case 'singularity_count':
            if (this.singularityCount >= (value as number)) {
              conditionMet = true
            }
            break
        }

        if (conditionMet) {
          this.unlockedNarratives.push(milestone.id)
          this.narrativeQueue.push(milestone)
          unlocked.add(milestone.id)
        }
      }
    },

    shiftNarrativeQueue(): NarrativeMilestone | undefined {
      return this.narrativeQueue.shift()
    },

    // --- Technical Debt Actions ---
    calculateRefactorCost(paradigmId: string) {
      // 1. Find all downstream paradigms to be frozen
      const toFreeze = new Set<string>([paradigmId])
      const queue = [paradigmId]
      while (queue.length > 0) {
        const currentId = queue.shift()!
        for (const p of paradigmConfigs) {
          if (p.requires?.includes(currentId) && this.paradigms[p.id] && !toFreeze.has(p.id)) {
            toFreeze.add(p.id)
            queue.push(p.id)
          }
        }
      }
      const frozenParadigms = Array.from(toFreeze)

      // 2. Calculate frozen SP and CP cost
      let frozenSP = new Decimal(0)
      for (const id of frozenParadigms) {
        const config = paradigmConfigs.find(p => p.id === id)
        if (config) {
          frozenSP = frozenSP.plus(config.cost)
        }
      }
      // Cost formula: 10^(total_frozen_sp * 1.5 + 120)
      const cpCost = Decimal.pow(10, frozenSP.toNumber() * 1.5 + 120)

      return { frozenParadigms, frozenSP, cpCost }
    },

    requestParadigmRefactor(paradigmId: string) {
      if (this.activeRefactoring || !this.paradigms[paradigmId]) return

      const { frozenParadigms, frozenSP, cpCost } = this.calculateRefactorCost(paradigmId)

      // 3. Set active refactoring state and remove paradigms
      this.activeRefactoring = {
        paradigmId,
        frozenParadigms,
        frozenSP,
        cpCost,
      }

      for (const id of frozenParadigms) {
        delete this.paradigms[id]
      }
    },

    cancelParadigmRefactor() {
      if (!this.activeRefactoring) return

      // Restore paradigms
      for (const id of this.activeRefactoring.frozenParadigms) {
        this.paradigms[id] = true
      }

      this.activeRefactoring = null
    },

    confirmParadigmRefactor() {
      if (!this.activeRefactoring) return
      if (this.currency.lt(this.activeRefactoring.cpCost)) return

      // Pay the cost
      this.currency = this.currency.minus(this.activeRefactoring.cpCost)

      // Refund SP
      this.singularityPower = this.singularityPower.plus(this.activeRefactoring.frozenSP)

      // Complete the process
      this.activeRefactoring = null
    },

    // --- Dev Actions ---
    _dev_setCurrency(amount: string) {
      try {
        this.currency = new Decimal(amount)
      } catch (e) {
        console.error('Invalid Decimal format for currency', e)
      }
    },
    _dev_setRefactorPoints(amount: string) {
      try {
        this.refactorPoints = new Decimal(amount)
      } catch (e) {
        console.error('Invalid Decimal format for RP', e)
      }
    },
    _dev_setSingularityPower(amount: string) {
      try {
        this.singularityPower = new Decimal(amount)
      } catch (e) {
        console.error('Invalid Decimal format for SP', e)
      }
    },
  }
  // #endregion
})
