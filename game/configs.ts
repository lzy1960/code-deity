import Decimal from 'break_infinity.js'

export interface GeneratorConfig {
  id: number
  name: string
  baseCost: Decimal
  costMultiplier: Decimal
  baseProduction: Decimal
  globalMultiplierBonus?: number
}

/**
 * # V4 Balance Pass: The Great Divide
 * ## Design Philosophy: Stretching the Milestones
 * Instead of nerfing production efficiency (e.g., baseProduction < 1), which feels counter-intuitive,
 * this pass dramatically increases the `baseCost` of mid-to-late game generators.
 * This transforms the act of unlocking the next generator from a routine task into a major,
 * multi-hour or even multi-day milestone, creating significant "walls" for the player to overcome.
 * This approach preserves the thematic integrity of "1 Compiler produces 1 Framework" while achieving
 * the necessary slowdown of the overall game pace.
 */
export const generatorConfigs: GeneratorConfig[] = [
  // Early game remains challenging but accessible
  {
    id: 1,
    name: '变量 (Variable)',
    baseCost: new Decimal(10),
    costMultiplier: new Decimal(1.20),
    baseProduction: new Decimal(1)
  },
  {
    id: 2,
    name: '函数 (Function)',
    baseCost: new Decimal(100),
    costMultiplier: new Decimal(1.25),
    baseProduction: new Decimal(1)
  },
  {
    id: 3,
    name: '类 (Class)',
    baseCost: new Decimal(5e3),
    costMultiplier: new Decimal(1.30),
    baseProduction: new Decimal(1)
  },
  // --- The First Wall ---
  {
    id: 4,
    name: '模块 (Module)',
    baseCost: new Decimal(5e7),      // Increased x10
    costMultiplier: new Decimal(1.35),
    baseProduction: new Decimal(1)
  },
  // --- The Great Divide ---
  {
    id: 5,
    name: '库 (Library)',
    baseCost: new Decimal(5e12),     // Rebalanced from 1e14
    costMultiplier: new Decimal(1.40),
    baseProduction: new Decimal(1)
  },
  {
    id: 6,
    name: '框架 (Framework)',
    baseCost: new Decimal(5e20),     // Rebalanced from 1e22
    costMultiplier: new Decimal(1.45),
    baseProduction: new Decimal(1)
  },
  // --- The Final Push ---
  {
    id: 7,
    name: '编译器 (Compiler)',
    baseCost: new Decimal(1e31),     // Rebalanced from 1e32
    costMultiplier: new Decimal(1.50),
    baseProduction: new Decimal(1),
    globalMultiplierBonus: 0.001
  },
  {
    id: 8,
    name: 'AI 核心 (A.I. Core)',
    baseCost: new Decimal(1e42),     // Rebalanced from 1e44
    costMultiplier: new Decimal(1.55),
    baseProduction: new Decimal(1),
    globalMultiplierBonus: 0.002
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
  textKey: string
}

export const narrativeMilestones: NarrativeMilestone[] = [
  {
    id: 'n_001',
    name: 'First Click',
    condition: { type: 'currency', value: 1 },
    textKey: 'narrative.n_001'
  },
  {
    id: 'n_002',
    name: 'Unlock Generators',
    condition: { type: 'currency', value: 10 },
    textKey: 'narrative.n_002'
  },
  {
    id: 'n_003',
    name: 'Buy first Variable',
    condition: { type: 'generator_bought', generatorId: 1, value: 1 },
    textKey: 'narrative.n_003'
  },
  {
    id: 'n_004',
    name: 'Buy first Function',
    condition: { type: 'generator_bought', generatorId: 2, value: 1 },
    textKey: 'narrative.n_004'
  },
  {
    id: 'n_005',
    name: 'Buy first Class',
    condition: { type: 'generator_bought', generatorId: 3, value: 1 },
    textKey: 'narrative.n_005'
  },
  {
    id: 'n_006',
    name: 'Buy first Module',
    condition: { type: 'generator_bought', generatorId: 4, value: 1 },
    textKey: 'narrative.n_006'
  },
  {
    id: 'n_007',
    name: 'Buy first Library',
    condition: { type: 'generator_bought', generatorId: 5, value: 1 },
    textKey: 'narrative.n_007'
  },
  {
    id: 'n_008',
    name: 'Buy first Framework',
    condition: { type: 'generator_bought', generatorId: 6, value: 1 },
    textKey: 'narrative.n_008'
  },
  {
    id: 'n_009',
    name: 'Buy first Compiler',
    condition: { type: 'generator_bought', generatorId: 7, value: 1 },
    textKey: 'narrative.n_009'
  },
  {
    id: 'n_010',
    name: 'Buy first AI Core',
    condition: { type: 'generator_bought', generatorId: 8, value: 1 },
    textKey: 'narrative.n_010'
  },
  {
    id: 'n_011',
    name: 'First Refactor',
    condition: { type: 'refactor_count', value: 1 },
    textKey: 'narrative.n_011'
  },
  {
    id: 'n_012',
    name: 'First Compile',
    condition: { type: 'version_count', value: 1 },
    textKey: 'narrative.n_012'
  }
]
// #endregion
