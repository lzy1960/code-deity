import { defineStore } from 'pinia'
import Decimal from 'break_infinity.js'
import { generatorConfigs, prestigeThresholds, type NarrativeMilestone, narrativeMilestones } from '~~/game/configs'

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
  currency: Decimal // CP, Code Power
  generators: Generator[]
  buyMultiplier: BuyMultiplier

  // Prestige Layers
  refactorPoints: Decimal // RP, Refactor Points
  refactorCount: number
  version: number // Prestige layer 2

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
}

// #endregion

export const useGameStore = defineStore('game', {
  // #region -------- STATE --------
  state: (): GameState => ({
    saveVersion: '1.0.5', // version up for state change
    lastUpdateTime: Date.now(),
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
    narrativeQueue: []
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
    isAutomationUnlocked: state => state.version > 0,
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
        const C = this.currency

        if (C.lt(B.times(r.pow(k)))) return new Decimal(0)

        // n <= log_r(C * (r - 1) / (B * r^k) + 1)
        const num = C.times(r.minus(1)).div(B.times(r.pow(k))).plus(1)
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
        const bonusPerLevel = this.challengeCompletions.challenge1 ? 2.2 : 2
        const bonusLevels = this.getBuyBonus(generator.bought)
        return Decimal.pow(bonusPerLevel, bonusLevels)
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

      const baseBonus = this.refactorPoints.times(0.1)
      const versionBonus = new Decimal(1).plus(this.version * 0.2)
      return new Decimal(1).plus(baseBonus.times(versionBonus))
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

        const production = config.baseProduction
          .times(generator.amount)
          .times(this.buy10Bonus(id)) // This now contains the challenge logic
          .times(this.rpBonus)
          .times(this.globalMultiplier)

        return production
      }
    },
    
    cps(): Decimal {
      let finalCps = this.generatorProduction(1)
      const penalty = this.architecturalOverheadPenalty
      if (penalty < 1) {
        finalCps = finalCps.times(penalty)
      }
      return finalCps
    },

    // --- Prestige Gain Calculation ---
    refactorGain(): Decimal {
      if (this.currency.log10() < 20) return new Decimal(0)
      const gain = Decimal.floor(
        Decimal.pow(this.currency.log10() / 20, 1.5)
      ).times(this.challenge2Bonus)
      return gain
    },

    compileCost(): Decimal {
      return new Decimal(10).times(Math.pow(this.version + 1, 2))
    },

    hasPendingOfflineGains: (state): boolean => {
      return state.pendingOfflineGains !== null
    }
  },
  // #endregion

  // #region -------- ACTIONS --------
  actions: {
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
      this.currency = this.currency.plus(cpGain.times(diff));

      // Handle automators
      if (this.isAutomationUnlocked) {
        for (let i = 8; i >= 1; i--) {
          if (this.automatorStates[i]) {
            // Temporarily set to 'max' for auto-buy, then restore
            const originalMultiplier = this.buyMultiplier
            this.setBuyMultiplier('max')
            this.buyGenerator(i)
            this.setBuyMultiplier(originalMultiplier)
          }
        }
      }

      this.lastUpdateTime = now
      this.checkNarrativeMilestones()
    },

    manualClick() {
      this.currency = this.currency.plus(1)
      this.checkNarrativeMilestones()
    },

    buyGenerator(id: number) {
      const amountToBuy = this.buyAmount(id)
      if (amountToBuy.eq(0)) return

      const cost = this.costForAmount(id, amountToBuy)
      if (this.currency.gte(cost)) {
        this.currency = this.currency.minus(cost)
        const generator = this.generators.find(g => g.id === id)!
        generator.amount = generator.amount.plus(amountToBuy)
        generator.bought += amountToBuy.toNumber()
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
  }
  // #endregion
})
