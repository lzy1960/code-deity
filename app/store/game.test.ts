
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from './game'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Decimal from 'break_infinity.js'

describe('Game Store - Core Mechanics', () => {
  beforeEach(() => {
    // 创建一个新的 Pinia 实例，并将其设置为活动的，
    // 以确保每个测试都拥有一个干净的状态
    setActivePinia(createPinia())
  })

  it('should have a clean initial state', () => {
    const store = useGameStore()
    expect(store.currency.toString()).toBe('0')
    expect(store.refactorPoints.toString()).toBe('0')
    expect(store.version).toBe(0)
    expect(store.generators.every(g => g.amount.eq(0) && g.bought === 0)).toBe(true)
  })

  // 测试代码重构 (Refactor) 的 RP 获取公式
  describe('refactorGain', () => {
    let store: ReturnType<typeof useGameStore>

    beforeEach(() => {
      store = useGameStore()
    })

    it('should return 0 RP when currency is less than 1e20', () => {
      store.currency = new Decimal('1e19')
      expect(store.refactorGain.toString()).toBe('0')
    })

    it('should return 1 RP when currency is exactly 1e20', () => {
      store.currency = new Decimal('1e20')
      // floor((20 / 20) ^ 1.5) = floor(1 ^ 1.5) = 1
      expect(store.refactorGain.toString()).toBe('1')
    })

    it('should return 3 RP when currency is 1e40', () => {
      store.currency = new Decimal('1e40')
      // floor((40 / 20) ^ 1.8) = floor(2 ^ 1.8) = floor(3.482) = 3
      expect(store.refactorGain.toString()).toBe('3')
    })
  })

  // 测试代码优雅度 (RP Bonus) 的加成公式
  describe('rpBonus', () => {
    let store: ReturnType<typeof useGameStore>

    beforeEach(() => {
      store = useGameStore()
    })

    it('should return a multiplier of 1 with 0 RP and 0 Version', () => {
      store.refactorPoints = new Decimal(0)
      store.version = 0
      // 1 + (0 * 0.1) * (1 + 0 * 0.2) = 1
      expect(store.rpBonus.toString()).toBe('1')
    })

    it('should calculate bonus correctly with RP but no Version bonus', () => {
      store.refactorPoints = new Decimal(100)
      store.version = 0
      // 1 + (100 * 0.1) * (1 + 0 * 0.2) = 1 + 10 * 1 = 11
      expect(store.rpBonus.toString()).toBe('11')
    })

    it('should calculate bonus correctly with both RP and Version bonus', () => {
      store.refactorPoints = new Decimal(100)
      store.version = 2
      // 1 + (100 * 0.1) * 1.2^2 = 1 + 10 * 1.44 = 15.4
      expect(store.rpBonus.toString()).toBe('15.4')
    })
  })

  // 测试购买奖励 (Buy Bonus) 的等级计算
  describe('getBuyBonus', () => {
    let store: ReturnType<typeof useGameStore>

    beforeEach(() => {
      store = useGameStore()
    })

    it('should return 0 bonus levels for 9 items bought', () => {
      expect(store.getBuyBonus(9)).toBe(0)
    })

    it('should return 1 bonus level for 10 items bought', () => {
      expect(store.getBuyBonus(10)).toBe(1)
    })

    it('should return 11 bonus levels for 120 items bought', () => {
      // 10 levels from first 100 (100/10) + 1 level from next tier (20/20)
      expect(store.getBuyBonus(120)).toBe(11)
    })

  it('should return 55 bonus levels for 1000 items bought', () => {
      // 10 levels from first 100 + 45 levels from next 900 (900/20)
      expect(store.getBuyBonus(1000)).toBe(55)
    })
  })

  describe('challenge and paradigm buy bonus tuning', () => {
    let store: ReturnType<typeof useGameStore>

    beforeEach(() => {
      store = useGameStore()
    })

    it('challenge1 weakens but does not remove buy bonuses for generators 1-7', () => {
      store.generators[0]!.bought = 10
      store.activeChallenge = 'challenge1'

      expect(store.buy10Bonus(1).toNumber()).toBeCloseTo(Math.sqrt(1.65), 6)
    })

    it('challenge3 keeps a heavily weakened buy bonus instead of hard-disabling it', () => {
      store.generators[0]!.bought = 10
      store.activeChallenge = 'challenge3'

      expect(store.buy10Bonus(1).toNumber()).toBeCloseTo(Math.pow(1.65, 0.4), 6)
    })

    it('polymorphism inherits a capped portion of the previous generator buy bonus', () => {
      store.paradigms.polymorphism = true
      store.generators[0]!.bought = 1000
      store.generators[1]!.bought = 10

      const baseBonus = Decimal.pow(1.65, 1)
      expect(store.buy10Bonus(2).toString()).toBe(baseBonus.times(3).toString())
    })
  })

  // 测试成本计算 (Cost Calculation)
  describe('costForAmount', () => {
    let store: ReturnType<typeof useGameStore>

    beforeEach(() => {
      store = useGameStore()
    })

    it('should cost the baseCost when buying the first generator', () => {
      const generatorId = 1
      const config = store.generatorConfig(generatorId)
      const cost = store.costForAmount(generatorId, new Decimal(1))
      expect(cost.toString()).toBe(config.baseCost.toString())
    })

    it('should cost baseCost * multiplier when buying the second generator', () => {
      const generatorId = 1
      const config = store.generatorConfig(generatorId)
      store.generators[0]!.bought = 1 // Pretend we already bought one

      const expectedCost = config.baseCost.times(config.costMultiplier)
      const cost = store.costForAmount(generatorId, new Decimal(1))
      expect(cost.toPrecision(5)).toBe(expectedCost.toPrecision(5))
    })

    it('should calculate the sum correctly when buying multiple generators', () => {
      const generatorId = 1
      const config = store.generatorConfig(generatorId)
      const amountToBuy = new Decimal(10)

      // Formula: B * r^k * (r^n - 1) / (r - 1)
      // k=0, n=10
      const expectedCost = config.baseCost
        .times(config.costMultiplier.pow(amountToBuy).minus(1))
        .div(config.costMultiplier.minus(1))

      const cost = store.costForAmount(generatorId, amountToBuy)
      expect(cost.toPrecision(8)).toBe(expectedCost.toPrecision(8))
    })
  })
})

describe('Game Store - Singularity & Paradigms', () => {
  let store: ReturnType<typeof useGameStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useGameStore()
  })

  it('should not purchase a paradigm if SP is insufficient', () => {
    store.singularityPower = new Decimal(0)
    store.purchaseParadigm('system_kernel') // cost is 1
    expect(store.paradigms.system_kernel).toBeUndefined()
  })

  it('should purchase a paradigm successfully with enough SP', () => {
    store.singularityPower = new Decimal(10)
    store.purchaseParadigm('system_kernel') // cost is 1, no dependencies
    expect(store.paradigms.system_kernel).toBe(true)
    expect(store.singularityPower.toString()).toBe('9')
  })

  it('should not purchase a paradigm if dependencies are not met', () => {
    store.singularityPower = new Decimal(10)
    store.purchaseParadigm('efficiency_starter') // requires 'system_kernel'
    expect(store.paradigms.efficiency_starter).toBeUndefined()
  })

  it('should purchase a paradigm with dependencies if they are met', () => {
    store.singularityPower = new Decimal(10)
    store.paradigms.system_kernel = true // manually unlock dependency
    store.purchaseParadigm('efficiency_starter') // cost is 2
    expect(store.paradigms.efficiency_starter).toBe(true)
    expect(store.singularityPower.toString()).toBe('8')
  })

  it('should not be able to purchase the same paradigm twice', () => {
    store.singularityPower = new Decimal(10)
    store.purchaseParadigm('system_kernel')
    expect(store.singularityPower.toString()).toBe('9')
    store.purchaseParadigm('system_kernel') // try to buy again
    expect(store.singularityPower.toString()).toBe('9') // SP should not be deducted again
  })

  it('requires breakthrough readiness and grants at least 3 SP for the first singularity', () => {
    store.currency = new Decimal('1e120')
    expect(store.canSingularity).toBe(false)
    store.breakthroughReadiness = 100
    expect(store.canSingularity).toBe(true)
    expect(store.singularityGain.toString()).toBe('3')
  })
})

// 序列化往返一致性 — 防止重构 store 时丢档
describe('Game Store - Serialization roundtrip', () => {
  let store: ReturnType<typeof useGameStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useGameStore()
  })

  function roundtrip(s: ReturnType<typeof useGameStore>) {
    const serialized = JSON.parse(JSON.stringify(s.toJSON()))
    setActivePinia(createPinia())
    const fresh = useGameStore()
    fresh.hydrate(serialized)
    return fresh
  }

  it('preserves a clean initial state', () => {
    const out = roundtrip(store)
    expect(out.currency.toString()).toBe('0')
    expect(out.refactorPoints.toString()).toBe('0')
    expect(out.singularityPower.toString()).toBe('0')
    expect(out.version).toBe(0)
    expect(out.refactorCount).toBe(0)
    expect(out.singularityCount).toBe(0)
    expect(out.activeChallenge).toBe('none')
    expect(out.activeRefactoring).toBeNull()
  })

  it('preserves all Decimal fields with very large numbers', () => {
    store.currency = new Decimal('1.234e308')
    store.refactorPoints = new Decimal('9.87e150')
    store.singularityPower = new Decimal('5e50')
    store.generators[2]!.amount = new Decimal('3.14e80')
    store.generators[2]!.bought = 1234

    const out = roundtrip(store)
    expect(out.currency.toString()).toBe(store.currency.toString())
    expect(out.refactorPoints.toString()).toBe(store.refactorPoints.toString())
    expect(out.singularityPower.toString()).toBe(store.singularityPower.toString())
    expect(out.generators[2]!.amount.toString()).toBe('3.14e+80')
    expect(out.generators[2]!.bought).toBe(1234)
  })

  it('preserves paradigms, challenge completions, and automator states', () => {
    store.paradigms = { system_kernel: true, efficiency_starter: true, pointer_arithmetic: true }
    store.challengeCompletions = { challenge1: true, challenge2: false, challenge3: true, challenge4: false }
    store.automatorStates = { 1: true, 3: false, 5: true }
    store.activeChallenge = 'challenge2'

    const out = roundtrip(store)
    expect(out.paradigms).toEqual(store.paradigms)
    expect(out.challengeCompletions).toEqual(store.challengeCompletions)
    expect(out.automatorStates).toEqual(store.automatorStates)
    expect(out.activeChallenge).toBe('challenge2')
  })

  it('preserves activeRefactoring (technical debt) state', () => {
    store.activeRefactoring = {
      paradigmId: 'efficiency_starter',
      frozenParadigms: ['efficiency_starter', 'pointer_arithmetic'],
      frozenSP: new Decimal(6),
      cpCost: new Decimal('1e132'),
    }
    const out = roundtrip(store)
    expect(out.activeRefactoring).not.toBeNull()
    expect(out.activeRefactoring!.paradigmId).toBe('efficiency_starter')
    expect(out.activeRefactoring!.frozenParadigms).toEqual(['efficiency_starter', 'pointer_arithmetic'])
    expect(out.activeRefactoring!.frozenSP.toString()).toBe('6')
    expect(out.activeRefactoring!.cpCost.toString()).toBe('1e+132')
  })

  it('preserves Code Rush state', () => {
    store.codeRushCharge = 73
    store.codeRushActiveExpiry = 1234567890
    store.codeRushClickCount = 42
    const out = roundtrip(store)
    expect(out.codeRushCharge).toBe(73)
    expect(out.codeRushActiveExpiry).toBe(1234567890)
    expect(out.codeRushClickCount).toBe(42)
  })

  it('preserves narrative unlock progress', () => {
    store.unlockedNarratives = ['game_start', 'first_function', 'first_class']
    const out = roundtrip(store)
    expect(out.unlockedNarratives).toEqual(['game_start', 'first_function', 'first_class'])
  })

  it('preserves pending offline generator gains', () => {
    store.pendingOfflineGains = {
      cp: new Decimal('1e12'),
      diff: 3600,
      generatorGains: [
        { id: 1, amount: new Decimal(120) },
        { id: 2, amount: new Decimal('3.5e4') },
      ],
    }

    const out = roundtrip(store)
    expect(out.pendingOfflineGains).not.toBeNull()
    expect(out.pendingOfflineGains!.cp.toString()).toBe('1000000000000')
    expect(out.pendingOfflineGains!.diff).toBe(3600)
    expect(out.pendingOfflineGains!.generatorGains[0]!.amount.toString()).toBe('120')
    expect(out.pendingOfflineGains!.generatorGains[1]!.amount.toString()).toBe('35000')
  })

  it('preserves singularity unlock and counts', () => {
    store.unlockedSingularity = true
    store.singularityCount = 7
    store.breakthroughReadiness = 88
    store.version = 5
    store.refactorCount = 99
    const out = roundtrip(store)
    expect(out.unlockedSingularity).toBe(true)
    expect(out.singularityCount).toBe(7)
    expect(out.breakthroughReadiness).toBe(88)
    expect(out.version).toBe(5)
    expect(out.refactorCount).toBe(99)
  })

  it('hydrates old partial saves by filling missing generators and challenge flags', () => {
    store.hydrate({
      saveVersion: '0.9.0',
      generators: [{ id: 1, amount: '12', bought: 3 }],
      challengeCompletions: { challenge1: true } as any,
      buyMultiplier: 'invalid' as any,
      activeChallenge: 'missing' as any,
    })

    expect(store.saveVersion).toBe('1.0.6')
    expect(store.generators).toHaveLength(8)
    expect(store.generators[0]!.amount.toString()).toBe('12')
    expect(store.generators[0]!.bought).toBe(3)
    expect(store.generators[7]!.amount.toString()).toBe('0')
    expect(store.challengeCompletions).toEqual({
      challenge1: true,
      challenge2: false,
      challenge3: false,
      challenge4: false,
    })
    expect(store.buyMultiplier).toBe('x1')
    expect(store.activeChallenge).toBe('none')
  })
})

describe('Game Store - simulateProgress', () => {
  let store: ReturnType<typeof useGameStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useGameStore()
  })

  it('does nothing for non-positive durations', () => {
    store.generators[0]!.amount = new Decimal(10)
    const before = store.currency.toString()
    store.simulateProgress(0)
    expect(store.currency.toString()).toBe(before)
  })

  it('produces CP from owned generators over time', () => {
    // 10 Variables (gen 1) at base production 1/sec → ~10 CP per second
    store.generators[0]!.amount = new Decimal(10)
    store.simulateProgress(1000) // 1 second
    expect(store.currency.toNumber()).toBeGreaterThan(0)
  })

  it('cascades production from higher tiers down to lower tiers', () => {
    // 1 Function (gen 2) should produce Variables (gen 1) over time
    store.generators[1]!.amount = new Decimal(1)
    expect(store.generators[0]!.amount.toString()).toBe('0')
    store.simulateProgress(2000) // 2 seconds
    expect(store.generators[0]!.amount.toNumber()).toBeGreaterThan(0)
  })
})

describe('Game Store - architecturalOverheadPenalty', () => {
  let store: ReturnType<typeof useGameStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useGameStore()
  })

  it('returns 1 when AI cores below threshold (no penalty)', () => {
    store.generators[7]!.bought = 25 // exactly at ARCHITECTURAL_OVERHEAD_AI_CORES
    expect(store.architecturalOverheadPenalty).toBe(1)
  })

  it('applies penalty when AI cores exceed threshold', () => {
    store.generators[7]!.bought = 50
    expect(store.architecturalOverheadPenalty).toBeLessThan(1)
    expect(store.architecturalOverheadPenalty).toBeGreaterThan(0)
  })

  it('reduces penalty when api_interface paradigm is purchased', () => {
    store.generators[7]!.bought = 50
    const withoutParadigm = store.architecturalOverheadPenalty
    store.paradigms.api_interface = true
    const withParadigm = store.architecturalOverheadPenalty
    expect(withParadigm).toBeGreaterThan(withoutParadigm)
  })
})

describe('Game Store - calculateOfflineProgress', () => {
  let store: ReturnType<typeof useGameStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useGameStore()
  })

  it('silently catches up progress when the gap is less than the offline modal threshold', () => {
    store.generators[0]!.amount = new Decimal(10)
    store.lastUpdateTime = Date.now() - 5_000 // 5 seconds ago
    expect(store.calculateOfflineProgress()).toBe(false)
    expect(store.pendingOfflineGains).toBeNull()
    expect(store.currency.toString()).toBe('50')
  })

  it('caps offline duration to 1 hour', () => {
    store.generators[0]!.amount = new Decimal(100)
    store.lastUpdateTime = Date.now() - 7200_000 // 2 hours ago
    store.calculateOfflineProgress()
    expect(store.pendingOfflineGains).not.toBeNull()
    expect(store.pendingOfflineGains!.diff).toBe(3600)
  })

  it('updates lastUpdateTime when offline gains are snapshotted', () => {
    store.generators[0]!.amount = new Decimal(100)
    const old = Date.now() - 60_000
    store.lastUpdateTime = old
    store.calculateOfflineProgress()
    expect(store.lastUpdateTime).toBeGreaterThan(old)
  })

  it('snapshots generator gains from the offline production cascade', () => {
    store.generators[1]!.amount = new Decimal(1)
    store.lastUpdateTime = Date.now() - 12_000
    store.calculateOfflineProgress()
    expect(store.pendingOfflineGains).not.toBeNull()
    expect(store.pendingOfflineGains!.generatorGains.some(gain => gain.id === 1 && gain.amount.gt(0))).toBe(true)
  })

  it('applies pending offline CP and generator gains together', () => {
    store.pendingOfflineGains = {
      cp: new Decimal(50),
      diff: 30,
      generatorGains: [
        { id: 1, amount: new Decimal(10) },
        { id: 3, amount: new Decimal(2) },
      ],
    }

    store.applyOfflineGains()
    expect(store.currency.toString()).toBe('50')
    expect(store.generators[0]!.amount.toString()).toBe('10')
    expect(store.generators[2]!.amount.toString()).toBe('2')
    expect(store.pendingOfflineGains).toBeNull()
  })
})

describe('Game Store - gameLoop', () => {
  let store: ReturnType<typeof useGameStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useGameStore()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('caps a single tick to the offline threshold instead of simulating an arbitrary long gap', () => {
    const now = 1_000_000
    vi.spyOn(Date, 'now').mockReturnValue(now)
    store.lastUpdateTime = now - 60_000
    store.generators[0]!.amount = new Decimal(1)

    store.gameLoop()

    expect(store.currency.toString()).toBe('10')
    expect(store.lastUpdateTime).toBe(now)
  })
})

describe('Game Store - Breakthrough readiness', () => {
  let store: ReturnType<typeof useGameStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useGameStore()
  })

  it('compile and high-value refactors advance breakthrough readiness', () => {
    store.refactorPoints = new Decimal(100)

    store.compileAndRelease()
    expect(store.breakthroughReadiness).toBe(20)

    store.generators[7]!.bought = 10
    store.currency = new Decimal('1e80')
    store.refactor()
    expect(store.breakthroughReadiness).toBe(28)
  })

  it('completed challenges add breakthrough readiness', () => {
    store.version = 2
    store.activeChallenge = 'challenge2'
    store.generators[7]!.bought = 10
    store.currency = new Decimal('1e20')

    store.refactor()

    expect(store.challengeCompletions.challenge2).toBe(true)
    expect(store.breakthroughReadiness).toBe(25)
  })

  it('AI core pressure slowly advances readiness after the first compile', () => {
    store.version = 1
    store.generators[7]!.bought = 50

    store.simulateProgress(1000)

    expect(store.breakthroughReadiness).toBeCloseTo(0.02, 6)
  })

  it('reconciles readiness from already completed releases and challenges', () => {
    store.hydrate({
      version: 2,
      challengeCompletions: {
        challenge1: true,
        challenge2: false,
        challenge3: true,
        challenge4: false,
      },
      breakthroughReadiness: 0,
    })

    expect(store.breakthroughReadiness).toBe(90)
    expect(store.effectiveBreakthroughReadiness).toBe(90)
  })

  it('uses earned readiness for UI and singularity checks even if stored progress is stale', () => {
    store.version = 5
    store.breakthroughReadiness = 0
    store.currency = new Decimal('1e120')

    expect(store.effectiveBreakthroughReadiness).toBe(100)
    expect(store.canSingularity).toBe(true)
  })
})

describe('Game Store - Technical Debt flow', () => {
  let store: ReturnType<typeof useGameStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useGameStore()
    store.singularityPower = new Decimal(100)
    // Build a chain: system_kernel → efficiency_starter → pointer_arithmetic
    store.purchaseParadigm('system_kernel')
    store.purchaseParadigm('efficiency_starter')
    store.purchaseParadigm('pointer_arithmetic')
  })

  it('freezes the target paradigm and all downstream descendants', () => {
    store.requestParadigmRefactor('efficiency_starter')
    expect(store.activeRefactoring).not.toBeNull()
    expect(store.activeRefactoring!.frozenParadigms).toContain('efficiency_starter')
    expect(store.activeRefactoring!.frozenParadigms).toContain('pointer_arithmetic')
    expect(store.paradigms.efficiency_starter).toBeUndefined()
    expect(store.paradigms.pointer_arithmetic).toBeUndefined()
    expect(store.paradigms.system_kernel).toBe(true) // upstream untouched
  })

  it('cancel restores frozen paradigms', () => {
    store.requestParadigmRefactor('efficiency_starter')
    store.cancelParadigmRefactor()
    expect(store.activeRefactoring).toBeNull()
    expect(store.paradigms.efficiency_starter).toBe(true)
    expect(store.paradigms.pointer_arithmetic).toBe(true)
  })

  it('confirm refunds SP and pays CP cost', () => {
    store.requestParadigmRefactor('efficiency_starter')
    const cpCost = store.activeRefactoring!.cpCost
    const frozenSP = store.activeRefactoring!.frozenSP
    const spBefore = store.singularityPower
    store.currency = cpCost.times(2) // ensure we can afford
    store.confirmParadigmRefactor()
    expect(store.activeRefactoring).toBeNull()
    expect(store.singularityPower.eq(spBefore.plus(frozenSP))).toBe(true)
  })

  it('confirm refuses if currency is insufficient', () => {
    store.requestParadigmRefactor('efficiency_starter')
    store.currency = new Decimal(0)
    store.confirmParadigmRefactor()
    expect(store.activeRefactoring).not.toBeNull()
  })
})

describe('Game Store - Code Rush', () => {
  let store: ReturnType<typeof useGameStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useGameStore()
  })

  it('cannot activate before charge reaches 100', () => {
    store.codeRushCharge = 99
    store.activateCodeRush()
    expect(store.codeRushActiveExpiry).toBeNull()
  })

  it('activates and resets charge when ready', () => {
    store.codeRushCharge = 100
    store.activateCodeRush()
    expect(store.isCodeRushActive).toBe(true)
    expect(store.codeRushCharge).toBe(0)
  })

  it('isCodeRushActive becomes false after expiry', () => {
    store.codeRushCharge = 100
    store.activateCodeRush()
    // Simulate time passing
    store.currentTime = (store.codeRushActiveExpiry ?? 0) + 1
    expect(store.isCodeRushActive).toBe(false)
  })

  it('manual click charges Code Rush when not active', () => {
    expect(store.codeRushCharge).toBe(0)
    store.manualClick()
    expect(store.codeRushCharge).toBeGreaterThan(0)
  })

  it('manual click does NOT charge while Code Rush is active', () => {
    store.codeRushCharge = 100
    store.activateCodeRush()
    expect(store.codeRushCharge).toBe(0)
    store.manualClick()
    expect(store.codeRushCharge).toBe(0)
  })
})
