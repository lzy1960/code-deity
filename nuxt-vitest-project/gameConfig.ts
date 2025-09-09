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
};