import type { Paradigm } from '~/types/paradigms'

export const paradigmConfigs: Paradigm[] = [
  // #region -------- Shared Core (Generalist Trunk) --------
  {
    id: 'system_kernel',
    cost: 1,
    school: 'general',
  },
  {
    id: 'open_source_community',
    cost: 5,
    school: 'general',
    requires: ['system_kernel'],
  },
  {
    id: 'api_interface',
    cost: 8,
    school: 'general',
    requires: ['open_source_community'],
  },
  // #endregion

  // #region -------- Efficiency School --------
  {
    id: 'efficiency_starter',
    cost: 2,
    school: 'efficiency',
    requires: ['system_kernel'],
  },
  {
    id: 'pointer_arithmetic',
    cost: 4,
    school: 'efficiency',
    requires: ['efficiency_starter'],
  },
  // --- Fork A: Resource Path ---
  {
    id: 'memory_management',
    cost: 6,
    school: 'efficiency',
    requires: ['pointer_arithmetic'],
  },
  {
    id: 'supply_chain_optimization',
    cost: 10,
    school: 'efficiency',
    requires: ['memory_management'],
  },
  // --- Fork B: Power Path ---
  {
    id: 'bit_manipulation',
    cost: 6,
    school: 'efficiency',
    requires: ['pointer_arithmetic'],
  },
  {
    id: 'assembly_instruction',
    cost: 20,
    school: 'efficiency',
    requires: ['bit_manipulation'],
  },
  // --- Cross-School Synergy ---
  {
    id: 'compiler_optimization',
    cost: 12,
    school: 'efficiency',
    requires: ['memory_management', 'abstraction_starter'],
  },
  // #endregion

  // #region -------- Abstraction School --------
  {
    id: 'abstraction_starter',
    cost: 2,
    school: 'abstraction',
    requires: ['system_kernel'],
  },
  {
    id: 'design_patterns',
    cost: 4,
    school: 'abstraction',
    requires: ['abstraction_starter'],
  },
  // --- Fork A: Cascade Path ---
  {
    id: 'polymorphism',
    cost: 6,
    school: 'abstraction',
    requires: ['design_patterns'],
  },
  {
    id: 'enterprise_architecture',
    cost: 20,
    school: 'abstraction',
    requires: ['polymorphism'],
  },
  // --- Fork B: Automation Path ---
  {
    id: 'dependency_injection',
    cost: 6,
    school: 'abstraction',
    requires: ['design_patterns'],
  },
  {
    id: 'continuous_integration',
    cost: 12,
    school: 'abstraction',
    requires: ['dependency_injection', 'agility_starter'],
  },
  // #endregion

  // #region -------- Agility School --------
  {
    id: 'agility_starter',
    cost: 2,
    school: 'agility',
    requires: ['system_kernel'],
  },
  {
    id: 'dynamic_typing',
    cost: 4,
    school: 'agility',
    requires: ['agility_starter'],
  },
  // --- Fork A: Value Path ---
  {
    id: 'jit_compilation',
    cost: 6,
    school: 'agility',
    requires: ['dynamic_typing'],
  },
  {
    id: 'code_generation',
    cost: 12,
    school: 'agility',
    requires: ['jit_compilation', 'efficiency_starter'],
  },
  // --- Fork B: Quantity Path ---
  {
    id: 'refactoring_tools',
    cost: 6,
    school: 'agility',
    requires: ['dynamic_typing'],
  },
  {
    id: 'metaprogramming',
    cost: 20,
    school: 'agility',
    requires: ['refactoring_tools'],
  },
  // #endregion
]
