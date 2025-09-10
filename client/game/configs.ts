import Decimal from 'break_infinity.js'

export interface GeneratorConfig {
  id: number
  name: string
  baseCost: Decimal
  costMultiplier: Decimal
  baseProduction: Decimal // 新增：基础产出，用于计算每个生成器的基础每秒产出
}

export const generatorConfigs: GeneratorConfig[] = [
  {
    id: 1,
    name: '程序员',
    baseCost: new Decimal(10),
    costMultiplier: new Decimal(1.15),
    baseProduction: new Decimal(1) // 程序员每秒产出 1 货币
  },
  {
    id: 2,
    name: '结对伙伴',
    baseCost: new Decimal(100),
    costMultiplier: new Decimal(1.2),
    baseProduction: new Decimal(10) // 结对伙伴每秒产出 10 货币
  }
  // 后面可以添加更多生成器
]