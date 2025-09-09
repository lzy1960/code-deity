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
    { id: 0, name: 'Basic Script', baseCost: 10, baseProduction: 1, yieldMultiplier: 1.00 },
    { id: 1, name: 'Loop', baseCost: 100, baseProduction: 10, yieldMultiplier: 1.00 },
    { id: 2, name: 'Function', baseCost: 1000, baseProduction: 100, yieldMultiplier: 1.00 },
    { id: 3, name: 'Class', baseCost: 10000, baseProduction: 1000, yieldMultiplier: 1.00 },
    { id: 4, name: 'Module', baseCost: 100000, baseProduction: 10000, yieldMultiplier: 1.00 },
  ],
};