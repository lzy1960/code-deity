
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from './game'
import { describe, it, expect, beforeEach } from 'vitest'
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

    it('should return 2 RP when currency is 1e40', () => {
      store.currency = new Decimal('1e40')
      // floor((40 / 20) ^ 1.5) = floor(2 ^ 1.5) = floor(2.828) = 2
      expect(store.refactorGain.toString()).toBe('2')
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
      // 1 + (100 * 0.1) * (1 + 2 * 0.2) = 1 + 10 * 1.4 = 15
      expect(store.rpBonus.toString()).toBe('15')
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
      store.generators[0].bought = 1 // Pretend we already bought one

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
    store.purchaseParadigm('procedural')
    expect(store.paradigms.procedural).toBeUndefined()
  })

  it('should purchase a paradigm successfully with enough SP', () => {
    store.singularityPower = new Decimal(10)
    store.purchaseParadigm('procedural') // cost is 1
    expect(store.paradigms.procedural).toBe(true)
    expect(store.singularityPower.toString()).toBe('9')
  })

  it('should not purchase a paradigm if dependencies are not met', () => {
    store.singularityPower = new Decimal(10)
    store.purchaseParadigm('structured') // requires 'procedural'
    expect(store.paradigms.structured).toBeUndefined()
  })

  it('should purchase a paradigm with dependencies if they are met', () => {
    store.singularityPower = new Decimal(10)
    store.paradigms.procedural = true // manually unlock dependency
    store.purchaseParadigm('structured') // cost is 3
    expect(store.paradigms.structured).toBe(true)
    expect(store.singularityPower.toString()).toBe('7')
  })

  it('should not be able to purchase the same paradigm twice', () => {
    store.singularityPower = new Decimal(10)
    store.purchaseParadigm('procedural')
    expect(store.singularityPower.toString()).toBe('9')
    store.purchaseParadigm('procedural') // try to buy again
    expect(store.singularityPower.toString()).toBe('9') // SP should not be deducted again
  })
})
