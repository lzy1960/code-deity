import { defineStore } from 'pinia'
import Decimal from 'break_infinity.js'
import { generatorConfigs, prestigeThresholds, type NarrativeMilestone, narrativeMilestones } from '~~/game/configs'
import { paradigmConfigs } from '~~/game/paradigms.configs'

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
}

export interface GameState {
  saveVersion: string
  lastUpdateTime: number
  lastCloudSync: number | null // Timestamp of the last successful cloud sync
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

  // Ad Boosts
  adBoostExpiry: number | null // DEPRECATED: To be removed in a future version
  adBoostCooldownExpiry: number | null // DEPRECATED

  quantumComputingExpiry: number | null
  supplyChainOptimizationExpiry: number | null
  isAlgorithmBreakthroughActive: boolean
  lastAdResetDate: string | null
  adViewsToday: {
    quantumComputing: number
    supplyChainOptimization: number
    algorithmBreakthrough: number
    codeInjection: number
  }

  // Technical Debt
  activeRefactoring: {
    paradigmId: string;
    frozenParadigms: string[];
    frozenSP: Decimal;
    cpCost: Decimal;
  } | null
}

// #endregion

export const useGameStore = defineStore('game', {
  // #region -------- STATE --------
  state: (): GameState => ({
    saveVersion: '1.0.5', // version up for state change
    lastUpdateTime: Date.now(),
    lastCloudSync: null,
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

    adBoostExpiry: null,
    adBoostCooldownExpiry: null,

    quantumComputingExpiry: null,
    supplyChainOptimizationExpiry: null,
    isAlgorithmBreakthroughActive: false,
    lastAdResetDate: null,
    adViewsToday: {
      quantumComputing: 0,
      supplyChainOptimization: 0,
      algorithmBreakthrough: 0,
      codeInjection: 0,
    },

    activeRefactoring: null
  }),
  // #endregion

  // #region -------- GETTERS --------
  getters: {
    // --- System Unlocks ---
    isGeneratorUnlocked: state => (id: number): boolean => {
      if (id === 1) return state.currency.gte(10) || state.generators[0]!.bought > 0 || state.refactorCount > 0
      const prevGenerator = state.generators.find(g => g.id === id - 1)
      return prevGenerator ? prevGenerator.bought > 0 : false
    },
    isRefactorUnlocked: state => {
      const aiCore = state.generators.find(g => g.id === 8)
      return (aiCore?.bought ?? 0) >= prestigeThresholds.REFACTOR_UNLOCK_AI_CORES || state.refactorCount > 0
    },
    canRefactor: state => {
      const aiCore = state.generators.find(g => g.id === 8)
      return (aiCore?.bought ?? 0) >= prestigeThresholds.REFACTOR_UNLOCK_AI_CORES
    },
    isCompileUnlocked: state => state.refactorPoints.gte(prestigeThresholds.COMPILE_UNLOCK_RP) || state.version > 0,
    isAutomationUnlocked() {
      if (this.paradigms.api_interface) {
        return this.refactorCount >= 5
      }
      if (this.paradigms.dependency_injection) {
        return true
      }
      return this.version > 0
    },
    isChallengesUnlocked: state => state.version >= 2,
    isMultiplierUnlocked: state => {
      const moduleGenerator = state.generators.find(g => g.id === 4)
      return (moduleGenerator?.bought ?? 0) > 0 || state.refactorCount > 0
    },

    // --- Soft Cap: Architectural Overhead ---
    architecturalOverheadPenalty() {
      const aiCores = this.generators.find(g => g.id === 8)!.bought
      if (aiCores <= prestigeThresholds.ARCHITECTURAL_OVERHEAD_AI_CORES) return 1
      // Penalty = 1 / (1 + 0.1 * log10(AI_Cores_Owned - 24))
      return 1 / (1 + 0.1 * Math.log10(aiCores - (prestigeThresholds.ARCHITECTURAL_OVERHEAD_AI_CORES - 1)))
    },

    // --- Core Production Calculation ---
    generatorConfig: () => (id: number) => {
      return generatorConfigs.find(c => c.id === id)!
    },

    effectiveGeneratorConfig() {
      return (id: number) => {
        const originalConfig = this.generatorConfig(id)
        // Must be a new object to avoid mutation
        const effectiveConfig = { ...originalConfig }

        // --- Apply Ad Boosts ---
        if (this.supplyChainOptimizationExpiry && this.supplyChainOptimizationExpiry > Date.now()) {
          effectiveConfig.baseCost = effectiveConfig.baseCost.times(0.75) // 25% cost reduction
        }

        // --- Apply Paradigm Bonuses ---
        if (this.paradigms.memory_management) {
          effectiveConfig.baseCost = effectiveConfig.baseCost.times(0.8)
          effectiveConfig.costMultiplier = effectiveConfig.costMultiplier.plus(0.01)
        }

        // Apply permanent rewards first
        if (this.challengeCompletions.challenge4) {
          effectiveConfig.baseCost = effectiveConfig.baseCost.times(0.95)
        }

        // Apply temporary challenge restrictions
        if (this.activeChallenge === 'challenge4') {
          effectiveConfig.costMultiplier = effectiveConfig.costMultiplier.plus(0.02)
        }

        return effectiveConfig
      }
    },

    // --- Cost & Amount Calculation for Multi-buy ---
    buyAmount() {
      return (id: number): Decimal => {
        if (this.buyMultiplier !== 'max') {
          return new Decimal(parseInt(this.buyMultiplier.slice(1)))
        }
        
        const config = this.effectiveGeneratorConfig(id)
        const generator = this.generators.find(g => g.id === id)!
        const r = config.costMultiplier
        const k = generator.bought
        const B = config.baseCost
        
        // FIX: Use a temporary, boosted currency value for calculation if the breakthrough is active.
        let effectiveCurrency = this.currency;
        if (this.isAlgorithmBreakthroughActive) {
          effectiveCurrency = this.currency.times(10); // Mathematically equivalent to a 90% cost reduction
        }

        if (effectiveCurrency.lt(B.times(r.pow(k)))) return new Decimal(0)

        // n <= log_r(C * (r - 1) / (B * r^k) + 1)
        const num = effectiveCurrency.times(r.minus(1)).div(B.times(r.pow(k))).plus(1)
        const n = Decimal.floor(num.log(r.toNumber()))
        return n.max(0)
      }
    },
    costForAmount() {
      return (id: number, amount: Decimal): Decimal => {
        if (amount.eq(0)) return new Decimal(0)
        const config = this.effectiveGeneratorConfig(id)
        const generator = this.generators.find(g => g.id === id)!
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
        // Apply challenge restrictions first
        if (this.activeChallenge === 'challenge1' && id <= 7) {
          return new Decimal(1)
        }
        if (this.activeChallenge === 'challenge3') {
          return new Decimal(1)
        }

        const generator = this.generators.find(g => g.id === id)!
        
        // Base bonus
        let bonusPerLevel = this.challengeCompletions.challenge1 ? 1.8 : 1.65
        
        const bonusLevels = this.getBuyBonus(generator.bought)
        let bonus = Decimal.pow(bonusPerLevel, bonusLevels)

        // ## Abstraction School: Polymorphism ##
        if (this.paradigms.polymorphism && id > 1) {
          const prevGenerator = this.generators.find(g => g.id === id - 1)!
          const prevBonusLevels = this.getBuyBonus(prevGenerator.bought)
          const prevBonus = Decimal.pow(bonusPerLevel, prevBonusLevels)
          // Apply 20% of the previous generator's bonus
          bonus = bonus.times(prevBonus.minus(1).times(0.2).plus(1))
        }
        
        return bonus
      }
    },

    getProgressInfo() {
      return (id: number): { progress: number, nextBonus: number } => {
        const generator = this.generators.find(g => g.id === id)!
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
      const versionBonus = new Decimal(1).plus(this.version * 0.2 * versionMultiplier)
      
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

    generatorProduction() {
      return (id: number): Decimal => {
        const config = this.effectiveGeneratorConfig(id)
        const generator = this.generators.find(g => g.id === id)!

        let production = config.baseProduction
          .times(generator.amount)
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
          production = production.times(Math.max(1, this.refactorCount * this.refactorCount))
        }

        return production
      }
    },
    
    cps(): Decimal {
      let finalCps = this.generatorProduction(1).times(this.adBoostMultiplier)
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

    adBoostMultiplier(state) {
      let multiplier = 1
      // Legacy boost
      if (state.adBoostExpiry && state.adBoostExpiry > Date.now()) {
        multiplier = multiplier * 2
      }
      // Quantum Computing boost
      if (state.quantumComputingExpiry && state.quantumComputingExpiry > Date.now()) {
        multiplier = multiplier * 5
      }
      return multiplier
    },

    // --- Prestige Gain Calculation ---
    refactorGain(): Decimal {
      if (this.currency.log10() < 20) return new Decimal(0)
      let gain = Decimal.floor(
        Decimal.pow(this.currency.log10() / 20, 1.5)
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
    canSingularity: state => state.currency.gte('1e308'),

    singularityGain(): Decimal {
      if (!this.canSingularity) return new Decimal(0)
      // New Formula: SP = floor(sqrt(log10(CP) - 308) * 1.5)
      const gain = Decimal.floor(
        Decimal.sqrt(this.currency.log10() - 308).times(1.5)
      )
      return gain.max(0)
    }
  },
  // #endregion

  // #region -------- ACTIONS --------
  actions: {
    /**
     * Hydrates the store from a plain JavaScript object (e.g., from a save file).
     * This ensures all complex objects like Decimal are re-instantiated correctly.
     */
    hydrate(stateToLoad: any) {
      this.currency = new Decimal(stateToLoad.currency)
      this.refactorPoints = new Decimal(stateToLoad.refactorPoints)
      
      this.generators = stateToLoad.generators.map((g: any) => ({
        id: g.id,
        amount: new Decimal(g.amount),
        bought: g.bought,
      }))

      // Copy over all other primitive properties
      const primitiveKeys: (keyof GameState)[] = [
        'saveVersion', 'lastUpdateTime', 'buyMultiplier', 'refactorCount', 'version',
        'challengeCompletions', 'activeChallenge', 'automatorStates', 'unlockedNarratives',
        'adBoostExpiry', 'adBoostCooldownExpiry'
      ];
      
      for (const key of primitiveKeys) {
        if (stateToLoad.hasOwnProperty(key)) {
          this[key] = stateToLoad[key] as any;
        }
      }
      // Handle nullable fields separately
      this.lastCloudSync = stateToLoad.lastCloudSync ?? null;
      this.singularityPower = new Decimal(stateToLoad.singularityPower ?? 0)
      this.unlockedSingularity = stateToLoad.unlockedSingularity ?? false
      this.paradigms = stateToLoad.paradigms ?? {}
      this.singularityCount = stateToLoad.singularityCount ?? 0

      // Hydrate new ad system state
      this.quantumComputingExpiry = stateToLoad.quantumComputingExpiry ?? null
      this.supplyChainOptimizationExpiry = stateToLoad.supplyChainOptimizationExpiry ?? null
      this.isAlgorithmBreakthroughActive = stateToLoad.isAlgorithmBreakthroughActive ?? false
      this.lastAdResetDate = stateToLoad.lastAdResetDate ?? null
      if (stateToLoad.adViewsToday) {
        // Ensure forward compatibility by merging with defaults
        this.adViewsToday = {
          quantumComputing: 0,
          supplyChainOptimization: 0,
          algorithmBreakthrough: 0,
          codeInjection: 0,
          ...stateToLoad.adViewsToday,
        };
      }

      // After hydrating, check if ad views need to be reset
      this.resetAdViewsIfNeeded()
    },

    /**
     * Returns a plain JavaScript object representation of the state,
     * suitable for serialization.
     */
    toJSON(): object {
      const state = this.$state;
      const replacer = (key: string, value: any) => {
        if (value instanceof Decimal) {
          return value.toString();
        }
        return value;
      };
      // A bit of a hack to force serialization of Decimals
      return JSON.parse(JSON.stringify(state, replacer));
    },

    setLastCloudSync(timestamp: number) {
      this.lastCloudSync = timestamp;
    },

    gameLoop() {
      const now = Date.now()
      const diff = new Decimal(now - this.lastUpdateTime).div(1000) // diff in seconds
      if (diff.lt(0)) {
        this.lastUpdateTime = now
        return
      }

      // Use a two-step loop to prevent cascading calculations within the same tick
      const productions: Decimal[] = [];
      for (let i = 8; i >= 1; i--) {
          productions[i-1] = this.generatorProduction(i);
      }

      for (let i = 8; i > 1; i--) {
          this.generators[i - 2]!.amount = this.generators[i - 2]!.amount.plus(productions[i-1].times(diff));
      }
      
      // Apply Architectural Overhead penalty to final CP gain
      let cpGain = productions[0]
      const penalty = this.architecturalOverheadPenalty
      if (penalty < 1) {
        cpGain = cpGain.times(penalty)
      }
      this.currency = this.currency.plus(cpGain.times(this.adBoostMultiplier).times(diff));

      // ## Abstraction School: Supply Chain Optimization ##
      if (this.paradigms.supply_chain_optimization) {
        const functionProduction = this.generatorProduction(2)
        this.generators[2]!.amount = this.generators[2]!.amount.plus(functionProduction.times(0.01).times(diff))
      }

      // Handle automators
      if (this.isAutomationUnlocked) {
        // ## Abstraction School: Continuous Integration ##
        if (this.paradigms.continuous_integration) {
          // Intelligent automator: find the cheapest generator that gives a buy 10 bonus
          let bestTarget: { id: number, cost: Decimal } | null = null
          for (let i = 8; i >= 1; i--) {
            if (this.automatorStates[i]) {
              const generator = this.generators.find(g => g.id === i)!
              const progressInfo = this.getProgressInfo(i)
              if (progressInfo.nextBonus > 0) {
                const cost = this.costForAmount(i, new Decimal(progressInfo.nextBonus))
                if (this.currency.gte(cost)) {
                  if (!bestTarget || cost.lt(bestTarget.cost)) {
                    bestTarget = { id: i, cost }
                  }
                }
              }
            }
          }
          if (bestTarget) {
            this.buyGenerator(bestTarget.id)
          }
        } else {
          // Default automator
          for (let i = 8; i >= 1; i--) {
            if (this.automatorStates[i]) {
              const originalMultiplier = this.buyMultiplier
              this.setBuyMultiplier('max')
              this.buyGenerator(i)
              this.setBuyMultiplier(originalMultiplier)
            }
          }
        }
      }

      this.lastUpdateTime = now
      this.checkNarrativeMilestones()
    },

    manualClick() {
      const clickPower = this.cps.times(0.05).plus(1);
      this.currency = this.currency.plus(clickPower)
      this.checkNarrativeMilestones()
    },

    buyGenerator(id: number) {
      const amountToBuy = this.buyAmount(id)
      if (amountToBuy.eq(0)) return

      let cost = this.costForAmount(id, amountToBuy)

      // Apply Algorithm Breakthrough discount
      if (this.isAlgorithmBreakthroughActive) {
        cost = cost.times(0.1); // 90% discount
        this.isAlgorithmBreakthroughActive = false; // Consume the buff
      }

      if (this.currency.gte(cost)) {
        this.currency = this.currency.minus(cost)
        const generator = this.generators.find(g => g.id === id)!
        generator.amount = generator.amount.plus(amountToBuy)
        generator.bought += amountToBuy.toNumber()

        // ## Agility School: Dynamic Typing ##
        if (this.paradigms.dynamic_typing && id > 1) {
          const prevGenerator = this.generators.find(g => g.id === id - 1)!
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

      // ## Agility School: Code Generation ##
      if (this.paradigms.code_generation) {
        this.generators.forEach(g => g.amount = g.amount.times(2))
        // This is a temporary buff, so we don't save it.
        // We can show a UI timer for this.
        setTimeout(() => {
          this.generators.forEach(g => g.amount = g.amount.div(2))
        }, 10000)
      }

      const gain = this.refactorGain

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

      this._resetForPrestige()
      this.checkNarrativeMilestones()
    },

    compileAndRelease() {
      if (!this.isCompileUnlocked) return
      const cost = this.compileCost
      if (this.refactorPoints.lt(cost)) return

      this.refactorPoints = this.refactorPoints.minus(cost)
      this.version += 1
      
      // This also triggers a refactor, but we keep automator unlocks
      const states = { ...this.automatorStates }
      
      this.refactor()

      this.automatorStates = states
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

      // --- HARD RESET ---
      // Reset all first era progress
      this.currency = new Decimal(10)
      this.generators.forEach(g => {
        g.amount = new Decimal(0)
        g.bought = 0
      })
      this.refactorPoints = new Decimal(0)
      this.refactorCount = 0
      this.version = 0
      this.lastUpdateTime = Date.now()

      // Reset all challenges (unless a meta-upgrade prevents this in the future)
      this.challengeCompletions = {
        challenge1: false,
        challenge2: false,
        challenge3: false,
        challenge4: false
      }
      this.activeChallenge = 'none'

      // We keep automation unlocks as a QoL feature
      // this.automatorStates = {}

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

      // 2. Check for cost
      if (this.singularityPower.lt(config.cost)) return

      // 3. Check for dependencies
      if (config.requires) {
        for (const reqId of config.requires) {
          if (!this.paradigms[reqId]) return // Dependency not met
        }
      }

      // 4. Check for mutually exclusive forks
      const forks: Record<string, string[]> = {
        'pointer_arithmetic': ['memory_management', 'bit_manipulation'],
        'design_patterns': ['polymorphism', 'dependency_injection'],
        'dynamic_typing': ['jit_compilation', 'refactoring_tools'],
      }

      for (const parent in forks) {
        const children = forks[parent]
        if (children.includes(paradigmId)) {
          const otherChild = children.find(c => c !== paradigmId)!
          if (this.paradigms[otherChild]) {
            console.warn(`Cannot purchase ${paradigmId}, it is mutually exclusive with ${otherChild}`)
            return // Mutually exclusive branch already purchased
          }
        }
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
      this.saveVersion = '1.0.5'
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
      this.challengeCompletions = {
        challenge1: false,
        challenge2: false,
        challenge3: false,
        challenge4: false
      }
      this.activeChallenge = 'none'
      this.automatorStates = {}
      this.pendingOfflineGains = null
      this.unlockedNarratives = []
      this.narrativeQueue = []

      console.log('Game state has been manually reset to initial values.')
    },

    startGameLoop() {
      setInterval(() => {
        this.gameLoop()
      }, 50)
    },

    calculateOfflineProgress() {
      const now = Date.now()
      let diff = (now - this.lastUpdateTime) / 1000

      // Offline time is less than 10 seconds, do nothing.
      if (diff < 10) {
        this.lastUpdateTime = now // Still update time to prevent small gaps from accumulating
        return false
      }

      // Per production.md, cap offline time to 1 hour (3600 seconds)
      const effectiveDiff = Math.min(diff, 3600)

      // --- Simulate gains for the effectiveDiff ---
      // This is a simplified simulation. A full simulation would be too slow.
      // We take the production rate at the start of the offline period and multiply it.
      const tempGens = this.generators.map(g => ({ ...g, amount: new Decimal(g.amount) }))
      const productions: Decimal[] = []
      for (let i = 8; i >= 1; i--) {
        const config = this.generatorConfig(i)
        const generator = tempGens.find(g => g.id === i)!
        let production = config.baseProduction
          .times(generator.amount)
          .times(this.buy10Bonus(i))
          .times(this.rpBonus)
        if (this.activeChallenge === 'challenge1' && i <= 4) {
          production = new Decimal(0)
        }
        productions[i - 1] = production
      }

      for (let i = 8; i > 1; i--) {
        tempGens[i - 2]!.amount = tempGens[i - 2]!.amount.plus(productions[i - 1]!.times(effectiveDiff))
      }

      let cpGain = productions[0]!
      const penalty = this.architecturalOverheadPenalty
      if (penalty < 1) {
        cpGain = cpGain.times(penalty) // Use multiplication as per our design change
      }
      
      const totalCpGained = this.currency.plus(cpGain.times(effectiveDiff)).minus(this.currency)

      if (totalCpGained.gt(0)) {
        this.pendingOfflineGains = {
          cp: totalCpGained,
          diff: effectiveDiff
        }
        // IMPORTANT: We do NOT update lastUpdateTime here. It will be updated when gains are applied.
        return true
      }

      return false
    },

    applyOfflineGains() {
      if (!this.pendingOfflineGains) return

      this.currency = this.currency.plus(this.pendingOfflineGains.cp)
      this.lastUpdateTime = Date.now() // Rer-calculate from now
      this.pendingOfflineGains = null
    },

    doubleOfflineGains() {
      if (this.pendingOfflineGains) {
        this.pendingOfflineGains.cp = this.pendingOfflineGains.cp.times(2);
      }
    },

    // --- New Ad System Actions ---
    resetAdViewsIfNeeded() {
      const today = new Date().toISOString().slice(0, 10); // Get YYYY-MM-DD
      if (this.lastAdResetDate !== today) {
        this.adViewsToday = {
          quantumComputing: 0,
          supplyChainOptimization: 0,
          algorithmBreakthrough: 0,
          codeInjection: 0,
        };
        this.lastAdResetDate = today;
        console.log('Ad views have been reset for the day.');
      }
    },

    activateQuantumComputing() {
      if (this.adViewsToday.quantumComputing >= 5) return;
      this.quantumComputingExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
      this.adViewsToday.quantumComputing++;
    },

    activateSupplyChainOptimization() {
      if (this.adViewsToday.supplyChainOptimization >= 5) return;
      this.supplyChainOptimizationExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
      this.adViewsToday.supplyChainOptimization++;
    },

    activateAlgorithmBreakthrough() {
      if (this.adViewsToday.algorithmBreakthrough >= 5) return;
      this.isAlgorithmBreakthroughActive = true;
      this.adViewsToday.algorithmBreakthrough++;
    },

    applyCodeInjection() {
      if (this.adViewsToday.codeInjection >= 5) return;
      const offlineCps = this.cps; // Use current CPS as a baseline
      const cpGain = offlineCps.times(3600); // 1 hour of production
      this.currency = this.currency.plus(cpGain);
      this.adViewsToday.codeInjection++;
    },

    activateAdBoost() {
      // Set boost for 1 hour from now
      this.adBoostExpiry = Date.now() + 60 * 60 * 1000;
      // Set cooldown for 4 hours from now
      this.adBoostCooldownExpiry = Date.now() + 4 * 60 * 60 * 1000;
    },

    // --- Narrative Actions ---
    checkNarrativeMilestones() {
      for (const milestone of narrativeMilestones) {
        if (this.unlockedNarratives.includes(milestone.id)) {
          continue
        }

        let conditionMet = false
        const { type, value, generatorId } = milestone.condition

        switch (type) {
          case 'currency':
            if (this.currency.gte(value as number)) {
              conditionMet = true
            }
            break
          case 'generator_bought':
            if (generatorId) {
              const generator = this.generators.find(g => g.id === generatorId)
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
        }

        if (conditionMet) {
          this.unlockedNarratives.push(milestone.id)
          this.narrativeQueue.push(milestone)
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
      // Cost formula: 10^(total_frozen_sp * 1.5 + 308)
      const cpCost = Decimal.pow(10, frozenSP.toNumber() * 1.5 + 308)

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
    _dev_resetAdViews() {
      this.adViewsToday = {
        quantumComputing: 0,
        supplyChainOptimization: 0,
        algorithmBreakthrough: 0,
        codeInjection: 0,
      };
      console.log('Developer action: Ad views have been reset.');
    },
  }
  // #endregion
})
