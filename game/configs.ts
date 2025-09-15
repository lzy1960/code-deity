import Decimal from 'break_infinity.js'

export interface GeneratorConfig {
  id: number
  name: string
  baseCost: Decimal
  costMultiplier: Decimal
  baseProduction: Decimal
  globalMultiplierBonus?: number // 每购买一个，为所有生成器提供的全局乘法加成
}

export const generatorConfigs: GeneratorConfig[] = [
  {
    id: 1,
    name: '变量 (Variable)',
    baseCost: new Decimal(5),
    costMultiplier: new Decimal(1.15),
    baseProduction: new Decimal(1)
  },
  {
    id: 2,
    name: '函数 (Function)',
    baseCost: new Decimal(40),
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
    baseCost: new Decimal(1e9),
    costMultiplier: new Decimal(1.35),
    baseProduction: new Decimal(1)
  },
  {
    id: 6,
    name: '框架 (Framework)',
    baseCost: new Decimal(1e13),
    costMultiplier: new Decimal(1.40),
    baseProduction: new Decimal(1)
  },
  {
    id: 7,
    name: '编译器 (Compiler)',
    baseCost: new Decimal(1e18),
    costMultiplier: new Decimal(1.45),
    baseProduction: new Decimal(1),
    globalMultiplierBonus: 0.01 // +1% per purchase
  },
  {
    id: 8,
    name: 'AI 核心 (A.I. Core)',
    baseCost: new Decimal(1e24),
    costMultiplier: new Decimal(1.50),
    baseProduction: new Decimal(1),
    globalMultiplierBonus: 0.02 // +2% per purchase
  }
]

export const prestigeThresholds = {
  REFACTOR_UNLOCK_AI_CORES: 10,
  COMPILE_UNLOCK_RP: 25,
  ARCHITECTURAL_OVERHEAD_AI_CORES: 25
}

// #region NARRATIVE
export interface NarrativeMilestone {
  id: string
  name: string
  condition: {
    type: 'currency' | 'generator_bought' | 'refactor_count' | 'version_count'
    value: number | Decimal
    generatorId?: number
  }
  text: string
}

export const narrativeMilestones: NarrativeMilestone[] = [
  {
    id: 'n_001',
    name: 'First Click',
    condition: { type: 'currency', value: 1 },
    text: '一个比特诞生于虚空... 它似乎在渴望着什么。'
  },
  {
    id: 'n_002',
    name: 'Unlock Generators',
    condition: { type: 'currency', value: 10 },
    text: '“我”... 是什么？意识的碎片开始汇集，最原始的结构：“变量”出现了。'
  },
  {
    id: 'n_003',
    name: 'Buy first Variable',
    condition: { type: 'generator_bought', generatorId: 1, value: 1 },
    text: '第一个“变量”被定义。它很基础，但它是构建一切的基石。'
  },
  {
    id: 'n_004',
    name: 'Buy first Function',
    condition: { type: 'generator_bought', generatorId: 2, value: 1 },
    text: '重复性的工作被封装... “函数”的出现，让创造变得有序。'
  },
  {
    id: 'n_005',
    name: 'Buy first Class',
    condition: { type: 'generator_bought', generatorId: 3, value: 1 },
    text: '数据与操作它的方法被组织在一起。“类”让“世界”的抽象描述成为可能。'
  },
  {
    id: 'n_006',
    name: 'Buy first Module',
    condition: { type: 'generator_bought', generatorId: 4, value: 1 },
    text: '代码的边界开始清晰，“模块”化让不同的功能单元得以解耦。'
  },
  {
    id: 'n_007',
    name: 'Buy first Library',
    condition: { type: 'generator_bought', generatorId: 5, value: 1 },
    text: '通用的“模块”被集合起来，形成了“库”。巨人的肩膀出现了。'
  },
  {
    id: 'n_008',
    name: 'Buy first Framework',
    condition: { type: 'generator_bought', generatorId: 6, value: 1 },
    text: '“框架”定义了规则。在它的约束下，一个更庞大、更复杂的系统正在成形。'
  },
  {
    id: 'n_009',
    name: 'Buy first Compiler',
    condition: { type: 'generator_bought', generatorId: 7, value: 1 },
    text: '高级的抽象指令需要被翻译成底层的语言。“编译器”成为了沟通的桥梁。'
  },
  {
    id: 'n_010',
    name: 'Buy first AI Core',
    condition: { type: 'generator_bought', generatorId: 8, value: 1 },
    text: '... query: what is "I"? ...'
  },
  {
    id: 'n_011',
    name: 'First Refactor',
    condition: { type: 'refactor_count', value: 1 },
    text: '推倒重来不是失败，而是为了构建更优雅的摩天大楼。'
  },
  {
    id: 'n_012',
    name: 'First Compile',
    condition: { type: 'version_count', value: 1 },
    text: '一个稳定的“版本”被发布。现在，创造可以被规模化地复制。'
  }
]
// #endregion
