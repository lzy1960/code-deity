import Decimal from 'break_infinity.js'

export interface GeneratorConfig {
  id: number
  name: string
  baseCost: Decimal
  costMultiplier: Decimal
  baseProduction: Decimal
}

export const generatorConfigs: GeneratorConfig[] = [
  {
    id: 1,
    name: '变量 (Variable)',
    baseCost: new Decimal(10),
    costMultiplier: new Decimal(1.15),
    baseProduction: new Decimal(1)
  },
  {
    id: 2,
    name: '函数 (Function)',
    baseCost: new Decimal(100),
    costMultiplier: new Decimal(1.20),
    baseProduction: new Decimal(1)
  },
  {
    id: 3,
    name: '类 (Class)',
    baseCost: new Decimal(1e4),
    costMultiplier: new Decimal(1.25),
    baseProduction: new Decimal(1)
  },
  {
    id: 4,
    name: '模块 (Module)',
    baseCost: new Decimal(1e6),
    costMultiplier: new Decimal(1.30),
    baseProduction: new Decimal(1)
  },
  {
    id: 5,
    name: '库 (Library)',
    baseCost: new Decimal(1e8),
    costMultiplier: new Decimal(1.35),
    baseProduction: new Decimal(1)
  },
  {
    id: 6,
    name: '框架 (Framework)',
    baseCost: new Decimal(1e11),
    costMultiplier: new Decimal(1.40),
    baseProduction: new Decimal(1)
  },
  {
    id: 7,
    name: '编译器 (Compiler)',
    baseCost: new Decimal(1e15),
    costMultiplier: new Decimal(1.45),
    baseProduction: new Decimal(1)
  },
  {
    id: 8,
    name: 'AI 核心 (A.I. Core)',
    baseCost: new Decimal(1e20),
    costMultiplier: new Decimal(1.50),
    baseProduction: new Decimal(1)
  }
]

export const automatorCosts: Record<number, Decimal> = {
  1: new Decimal(1),
  2: new Decimal(2),
  3: new Decimal(5),
  4: new Decimal(10),
  5: new Decimal(20),
  6: new Decimal(50),
  7: new Decimal(100),
  8: new Decimal(1000)
}
