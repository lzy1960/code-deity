import { defineStore } from 'pinia'
import Decimal from 'break_infinity.js'
import { generatorConfigs, type GeneratorConfig } from '../../game/configs'

// 为了类型安全，我们先定义生成器的接口
export interface Generator {
  id: number
  name: string
  amount: Decimal
  bought: number
  multiplier: Decimal
  baseCost: Decimal
  costMultiplier: Decimal
  baseProduction: Decimal // 与 GeneratorConfig 保持一致
}

// 定义 state 的接口
export interface GameState {
  saveVersion: string
  lastUpdateTime: number
  currency: Decimal
  generators: Generator[]
  rpGain: Decimal // 新增
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    saveVersion: '1.0.0',
    lastUpdateTime: Date.now(),
    currency: new Decimal(10),
    generators: generatorConfigs.map(config => ({
      ...config,
      amount: new Decimal(0),
      bought: 0,
      multiplier: new Decimal(1)
    })),
    rpGain: new Decimal(5) // 初始化 rpGain
  }),

  actions: {
    buyGenerator(id: number) {
      const generator = this.generators.find(g => g.id === id)
      if (!generator) return

      const cost = generator.baseCost.times(generator.costMultiplier.pow(generator.bought))

      if (this.currency.gte(cost)) {
        this.currency = this.currency.minus(cost)
        generator.amount = generator.amount.plus(1)
        generator.bought += 1
      } else {
        console.log('货币不足！')
      }
    },
    refactorCode() { // 新增 refactorCode action
      console.log('代码重构！')
      // 这里可以添加重构逻辑，例如增加货币或 RP
      // this.currency = this.currency.plus(this.rpGain); // 示例：重构增加货币
      // this.rpGain = new Decimal(0); // 示例：重构后 RP 清零
    }
  },

  getters: {
    // 之后会在这里添加 getters，例如 rpGainPreview
  }
})
