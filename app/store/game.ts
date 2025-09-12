import { defineStore } from 'pinia'
import Decimal from 'break_infinity.js'
import { generatorConfigs, automatorCosts } from '../../game/configs'

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
  activeChallenge: 'none' | 'challenge1' | 'challenge2'

  // Automation
  purchasedAutomators: Record<number, boolean>
  automatorStates: Record<number, boolean>
}

// #endregion

export const useGameStore = defineStore('game', {
  // #region -------- STATE --------
  state: (): GameState => ({
    saveVersion: '1.0.2',
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
      challenge2: false
    },
    activeChallenge: 'none',

    purchasedAutomators: {},
    automatorStates: {}
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
      return (aiCore?.bought ?? 0) >= 10 || state.refactorCount > 0
    },
    canRefactor: state => {
      const aiCore = state.generators.find(g => g.id === 8)
      return (aiCore?.bought ?? 0) >= 10
    },
    isCompileUnlocked: state => state.refactorCount >= 5,
    isAutomationUnlocked: state => state.version > 0,
    isChallengesUnlocked: state => state.version >= 2,
    isMultiplierUnlocked: state => {
      const moduleGenerator = state.generators.find(g => g.id === 4)
      return (moduleGenerator?.bought ?? 0) > 0 || state.refactorCount > 0
    },

    // --- Core Production Calculation ---
    generatorConfig: () => (id: number) => {
      return generatorConfigs.find(c => c.id === id)!
    },

    // --- Cost & Amount Calculation for Multi-buy ---
    buyAmount() {
      return (id: number): Decimal => {
        if (this.buyMultiplier !== 'max') {
          return new Decimal(parseInt(this.buyMultiplier.slice(1)))
        }
        
        const config = this.generatorConfig(id)
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
        const config = this.generatorConfig(id)
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

    buy10Bonus() {
      return (id: number): Decimal => {
        const generator = this.generators.find(g => g.id === id)!
        const bonusPer10 = this.challengeCompletions.challenge1 ? 2.2 : 2
        const setsOf10 = Math.floor(generator.bought / 10)
        return Decimal.pow(bonusPer10, setsOf10)
      }
    },
    
    rpBonus(): Decimal {
      const baseBonus = this.refactorPoints.times(0.1)
      const versionBonus = new Decimal(1).plus(this.version * 0.2)
      return new Decimal(1).plus(baseBonus.times(versionBonus))
    },
    
    challenge2Bonus(): Decimal {
        return this.challengeCompletions.challenge2 ? new Decimal(1.5) : new Decimal(1)
    },

    generatorProduction() {
      return (id: number): Decimal => {
        const config = this.generatorConfig(id)
        const generator = this.generators.find(g => g.id === id)!

        if (this.activeChallenge === 'challenge1' && id <= 4) {
            return new Decimal(0)
        }

        let production = config.baseProduction
          .times(generator.amount)
          .times(this.buy10Bonus(id))
          .times(this.rpBonus)

        return production
      }
    },
    
    cps(): Decimal {
        return this.generatorProduction(1);
    },

    // --- Prestige Gain Calculation ---
    refactorGain(): Decimal {
      if (this.currency.log10() < 20) return new Decimal(0)
      const gain = Decimal.floor(
        Decimal.pow(this.currency.log10() / 20, 1.5)
      ).times(this.challenge2Bonus)
      return gain
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
      
      this.currency = this.currency.plus(productions[0].times(diff));

      // Handle automators
      if (this.isAutomationUnlocked) {
        for (let i = 8; i >= 1; i--) {
          if (this.purchasedAutomators[i] && this.automatorStates[i]) {
            // Temporarily set to 'max' for auto-buy, then restore
            const originalMultiplier = this.buyMultiplier
            this.setBuyMultiplier('max')
            this.buyGenerator(i)
            this.setBuyMultiplier(originalMultiplier)
          }
        }
      }

      this.lastUpdateTime = now
    },

    manualClick() {
      this.currency = this.currency.plus(1)
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
    },

    setBuyMultiplier(multiplier: BuyMultiplier) {
      this.buyMultiplier = multiplier
    },

    purchaseAutomator(id: number) {
      if (!this.isAutomationUnlocked || this.purchasedAutomators[id]) return
      const cost = automatorCosts[id]
      if (this.refactorPoints.gte(cost)) {
        this.refactorPoints = this.refactorPoints.minus(cost)
        this.purchasedAutomators[id] = true
        this.automatorStates[id] = true // Enable by default on purchase
      }
    },

    toggleAutomator(id: number) {
      if (!this.purchasedAutomators[id]) return
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
      }

      if (gain.gt(0)) {
        this.refactorPoints = this.refactorPoints.plus(gain)
        this.refactorCount += 1
      }

      this._resetForPrestige()
    },

    compileAndRelease() {
      if (!this.isCompileUnlocked) return
      this.version += 1
      // This also triggers a refactor, but we keep automator unlocks
      const purchased = { ...this.purchasedAutomators }
      const states = { ...this.automatorStates }
      
      this.refactor()

      this.purchasedAutomators = purchased
      this.automatorStates = states
    },

    startChallenge(challenge: 'challenge1' | 'challenge2') {
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
  }
  // #endregion
})
