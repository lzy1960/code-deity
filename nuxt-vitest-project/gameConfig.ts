export default {
  // Core Game Balance Values
  // These values are placeholders and should be adjusted for game balance.

  // Generator Settings
  generator_base_cost: 10,
  generator_cost_multiplier: 1.15,
  generator_base_production: 1,

  // Refactor System
  refactor_cost_base: 1000,
  refactor_point_gain_base: 1,
  refactor_cost_exponent: 1.5,

  // Compile System
  compile_cost_base: 100,
  compile_point_gain_base: 1,
  compile_cost_exponent: 2,
  compile_version_unlock_costs: [
    // Cost in version points to unlock next version tier
    10, // Version 2
    100, // Version 3
    1000, // Version 4
  ],

  // Offline Progress
  offline_progress_multiplier: 0.5,
  max_offline_time_hours: 12,

  // Generator Definitions
  generators: [
    { id: 0, name: 'Variable', baseCost: 10, baseProduction: 1, yieldMultiplier: 1.00, era: 'Programmer' },
    { id: 1, name: 'Function', baseCost: 100, baseProduction: 10, yieldMultiplier: 1.00, era: 'Programmer' },
    { id: 2, name: 'Class', baseCost: 1000, baseProduction: 100, yieldMultiplier: 1.00, era: 'Programmer' },
    { id: 3, name: 'Module', baseCost: 10000, baseProduction: 1000, yieldMultiplier: 1.00, era: 'Programmer' },
    { id: 4, name: 'Library', baseCost: 100000, baseProduction: 10000, yieldMultiplier: 1.00, era: 'Programmer' },
    { id: 5, name: 'Framework', baseCost: 1e6, baseProduction: 1e5, yieldMultiplier: 1.00, era: 'Programmer' },
    { id: 6, name: 'Compiler', baseCost: 1e7, baseProduction: 1e6, yieldMultiplier: 1.00, era: 'Programmer' },
    { id: 7, name: 'A.I. Core', baseCost: 1e8, baseProduction: 1e7, yieldMultiplier: 1.00, era: 'Programmer' },
  ],

  // Eras
  eras: {
    Programmer: {
      goal: 1e308, // CP to reach Technical Singularity
      resetType: 'Singularity',
    },
    Architect: {
      goal: 1e100, // Singularity Power to reach Become Genesis
      resetType: 'BecomeGenesis',
    },
    Deity: {
      goal: null, // Unknown
      resetType: null,
    },
  },

  // Reset Systems
  resets: {
    Refactor: {
      unlockCondition: { type: 'generatorQuantity', generatorId: 7, quantity: 10 }, // 10 A.I. Cores
      rpGainBase: 1,
      cpMultiplierPerRp: 1.05, // 5% CP production bonus per RP
    },
    Compile: {
      unlockCondition: { type: 'refactorCount', count: 5 }, // 5 Refactors
      versionGainBase: 1,
      rpEfficiencyMultiplierPerVersion: 1.10, // 10% RP gain efficiency per Version
    },
    Singularity: {
      unlockCondition: { type: 'cp', amount: 1e308 },
      spGainBase: 1,
    },
    BecomeGenesis: {
      unlockCondition: { type: 'sp', amount: 1e100 },
      gsGainBase: 1,
    },
  },

  // Automation System
  automation: {
    unlockCondition: { type: 'compileCount', count: 1 }, // 1 Compile & Release
    autoBuyGenerators: true,
    autoBuyIntervalMs: 1000,
  },

  // Challenges System
  challenges: {
    unlockCondition: { type: 'compileCount', count: 2 }, // 2 Compile & Release
    definitions: [
      // Example Challenge
      {
        id: 0,
        name: 'No Variables',
        description: 'Complete a Refactor without buying any Variable generators.',
        restriction: { type: 'noGenerator', generatorId: 0 },
        goal: { type: 'refactorCount', count: 1 },
        reward: { type: 'permanentCpMultiplier', multiplier: 2 },
        completed: false,
      },
    ],
  },

  // Programming Paradigms System (Skill Tree)
  programmingParadigms: {
    unlockCondition: { type: 'era', era: 'Architect' },
    skillTree: {
      // Example skill tree structure
      Procedural: [
        { id: 0, name: 'Efficient Loops', cost: 1, effect: { type: 'generatorProduction', generatorId: 1, multiplier: 1.10 }, dependencies: [] },
        { id: 1, name: 'Optimized Functions', cost: 5, effect: { type: 'generatorProduction', generatorId: 2, multiplier: 1.20 }, dependencies: [0] },
      ],
      OOP: [
        { id: 10, name: 'Inheritance Mastery', cost: 1, effect: { type: 'generatorProduction', generatorId: 3, multiplier: 1.10 }, dependencies: [] },
        { id: 11, name: 'Polymorphism Power', cost: 5, effect: { type: 'generatorProduction', generatorId: 4, multiplier: 1.20 }, dependencies: [10] },
      ],
      General: [
        { id: 20, name: 'Universal Abstraction', cost: 10, effect: { type: 'allCpProduction', multiplier: 1.15 }, dependencies: [] },
      ],
    },
  },

  // System Patches System
  systemPatches: {
    unlockCondition: { type: 'era', era: 'Deity' },
    definitions: [
      // Example Patch
      { id: 0, name: 'Time Warp', description: 'Doubles game speed.', effect: { type: 'gameSpeed', multiplier: 2 }, cost: 1 },
    ],
  },
};