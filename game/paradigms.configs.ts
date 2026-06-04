import type { Paradigm } from '~/types/paradigms'

export const paradigmConfigs: Paradigm[] = [
  // #region -------- Shared Core (Generalist Trunk) --------
  {
    id: 'system_kernel',
    cost: 1,
    school: 'general',
    x: 112, y: 505,
  },
  {
    id: 'open_source_community',
    cost: 5,
    school: 'general',
    requires: ['system_kernel'],
    x: 904, y: 60,
  },
  {
    id: 'api_interface',
    cost: 8,
    school: 'general',
    requires: ['open_source_community'],
    x: 1168, y: 60,
  },
  // #endregion

  // #region -------- Efficiency School --------
  {
    id: 'efficiency_starter',
    cost: 2,
    school: 'efficiency',
    requires: ['system_kernel'],
    x: 376, y: 329,
  },
  {
    id: 'pointer_arithmetic',
    cost: 4,
    school: 'efficiency',
    requires: ['efficiency_starter'],
    x: 640, y: 288,
  },
  // --- Fork A: Resource Path ---
  {
    id: 'memory_management',
    cost: 6,
    school: 'efficiency',
    requires: ['pointer_arithmetic'],
    x: 904, y: 215,
  },
  {
    id: 'supply_chain_optimization',
    cost: 10,
    school: 'efficiency',
    requires: ['memory_management'],
    x: 1168, y: 205,
  },
  // --- Fork B: Power Path ---
  {
    id: 'bit_manipulation',
    cost: 6,
    school: 'efficiency',
    requires: ['pointer_arithmetic'],
    x: 904, y: 454,
  },
  {
    id: 'assembly_instruction',
    cost: 20,
    school: 'efficiency',
    requires: ['bit_manipulation'],
    x: 1168, y: 360,
  },
  // --- Cross-School Synergy ---
  {
    id: 'compiler_optimization',
    cost: 12,
    school: 'efficiency',
    requires: ['memory_management', 'abstraction_starter'],
    x: 1168, y: 505,
  },
  // #endregion

  // #region -------- Abstraction School --------
  {
    id: 'abstraction_starter',
    cost: 2,
    school: 'abstraction',
    requires: ['system_kernel'],
    x: 376, y: 805,
  },
  {
    id: 'design_patterns',
    cost: 4,
    school: 'abstraction',
    requires: ['abstraction_starter'],
    x: 640, y: 846,
  },
  // --- Fork A: Cascade Path ---
  {
    id: 'polymorphism',
    cost: 6,
    school: 'abstraction',
    requires: ['design_patterns'],
    x: 904, y: 723,
  },
  {
    id: 'enterprise_architecture',
    cost: 20,
    school: 'abstraction',
    requires: ['polymorphism'],
    x: 1168, y: 650,
  },
  // --- Fork B: Automation Path ---
  {
    id: 'dependency_injection',
    cost: 6,
    school: 'abstraction',
    requires: ['design_patterns'],
    x: 904, y: 868,
  },
  {
    id: 'continuous_integration',
    cost: 12,
    school: 'abstraction',
    requires: ['dependency_injection', 'agility_starter'],
    x: 1168, y: 1074,
  },
  // #endregion

  // #region -------- Agility School --------
  {
    id: 'agility_starter',
    cost: 2,
    school: 'agility',
    requires: ['system_kernel'],
    x: 376, y: 1188,
  },
  {
    id: 'dynamic_typing',
    cost: 4,
    school: 'agility',
    requires: ['agility_starter'],
    x: 640, y: 1229,
  },
  // --- Fork A: Value Path ---
  {
    id: 'jit_compilation',
    cost: 6,
    school: 'agility',
    requires: ['dynamic_typing'],
    x: 904, y: 1033,
  },
  {
    id: 'code_generation',
    cost: 12,
    school: 'agility',
    requires: ['jit_compilation', 'efficiency_starter'],
    x: 1168, y: 878,
  },
  // --- Fork B: Quantity Path ---
  {
    id: 'refactoring_tools',
    cost: 6,
    school: 'agility',
    requires: ['dynamic_typing'],
    x: 904, y: 1250,
  },
  {
    id: 'metaprogramming',
    cost: 20,
    school: 'agility',
    requires: ['refactoring_tools'],
    x: 1168, y: 1250,
  },
  // #endregion
]
