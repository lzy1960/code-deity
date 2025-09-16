import type { Paradigm } from '~/types/paradigms'

export const paradigmConfigs: Paradigm[] = [
  // #region -------- Shared Core (Generalist Trunk) --------
  {
    id: 'system_kernel',
    name: '系统内核',
    description: '所有生成器的产出提升 25%。',
    cost: 2,
    school: 'general',
  },
  {
    id: 'open_source_community',
    name: '开源社区',
    description: '根据你已学习的不同学派入门技能的数量 (N)，提供一个全局性的 x(1 + 0.15 * N) 乘法加成。',
    cost: 5,
    school: 'general',
    requires: ['system_kernel'],
  },
  {
    id: 'api_interface',
    name: 'API 接口',
    description: '自动化购买器的解锁条件从“版本号达到 1”变为“代码重构 5 次”。',
    cost: 8,
    school: 'general',
    requires: ['open_source_community'],
  },
  // #endregion

  // #region -------- Efficiency School --------
  {
    id: 'efficiency_starter',
    name: '效率学派入门',
    description: '解锁效率学派。该学派专注于前期爆发和后期潜力转化。',
    cost: 1,
    school: 'efficiency',
    requires: ['system_kernel'],
  },
  {
    id: 'pointer_arithmetic',
    name: '指针算术',
    description: '“变量”和“函数”的产出获得 x10 的直接乘法加成。',
    cost: 4,
    school: 'efficiency',
    requires: ['efficiency_starter'],
  },
  // --- Fork A: Resource Path ---
  {
    id: 'memory_management',
    name: '内存管理',
    description: '资源分支：所有生成器的基础成本降低 20%，但成本增长率增加 0.01。',
    cost: 6,
    school: 'efficiency',
    requires: ['pointer_arithmetic'],
  },
  {
    id: 'supply_chain_optimization',
    name: '供应链优化',
    description: '资源分支：允许“函数”直接产出“类”（产出效率为正常值的 1%）。',
    cost: 10,
    school: 'efficiency',
    requires: ['memory_management'],
  },
  // --- Fork B: Power Path ---
  {
    id: 'bit_manipulation',
    name: '位操作',
    description: '算力分支：提供一个 x1.5 的全局 CP 产出乘数。',
    cost: 6,
    school: 'efficiency',
    requires: ['pointer_arithmetic'],
  },
  {
    id: 'assembly_instruction',
    name: '汇编指令',
    description: '算力分支终极技能：总 CP 产出获得一个永久加成，数值等于你“代码重构”次数的平方。',
    cost: 20,
    school: 'efficiency',
    requires: ['bit_manipulation'],
  },
  // --- Cross-School Synergy ---
  {
    id: 'compiler_optimization',
    name: '编译器优化',
    description: '跨界协同：RP 加成效果会受到“买十奖励”等级的二次加成。',
    cost: 12,
    school: 'efficiency',
    requires: ['memory_management', 'abstraction_starter'],
  },
  // #endregion

  // #region -------- Abstraction School --------
  {
    id: 'abstraction_starter',
    name: '抽象学派入门',
    description: '解锁抽象学派。该学派专注于后期成长和强大的协同效应。',
    cost: 1,
    school: 'abstraction',
    requires: ['system_kernel'],
  },
  {
    id: 'design_patterns',
    name: '设计模式',
    description: '“类”、“模块”和“库”的产出，会根据其下一阶生成器的数量获得额外乘法加成。',
    cost: 4,
    school: 'abstraction',
    requires: ['abstraction_starter'],
  },
  // --- Fork A: Cascade Path ---
  {
    id: 'polymorphism',
    name: '多态',
    description: '级联分支：每种生成器的“买十奖励”效果，会额外对其上一阶生成器生效 20%。',
    cost: 6,
    school: 'abstraction',
    requires: ['design_patterns'],
  },
  {
    id: 'enterprise_architecture',
    name: '企业级架构',
    description: '级联分支终极技能：“编译发布”获得的“版本号”效果提升 50%。',
    cost: 20,
    school: 'abstraction',
    requires: ['polymorphism'],
  },
  // --- Fork B: Automation Path ---
  {
    id: 'dependency_injection',
    name: '依赖注入',
    description: '自动化分支：解锁所有生成器的自动化购买器，无论“版本号”是否达到要求。',
    cost: 6,
    school: 'abstraction',
    requires: ['design_patterns'],
  },
  {
    id: 'continuous_integration',
    name: '持续集成',
    description: '自动化分支终极技能：你的“自动化购买器”现在会优先购买能触发“买十奖励”的生成器。',
    cost: 12,
    school: 'abstraction',
    requires: ['dependency_injection', 'agility_starter'],
  },
  // #endregion

  // #region -------- Agility School --------
  {
    id: 'agility_starter',
    name: '敏捷学派入门',
    description: '解锁敏捷学派。该学派专注于加速游戏循环和提升重置效率。',
    cost: 1,
    school: 'agility',
    requires: ['system_kernel'],
  },
  {
    id: 'dynamic_typing',
    name: '动态类型',
    description: '每当你购买一个生成器时，你立即免费获得一个低一阶的生成器。',
    cost: 4,
    school: 'agility',
    requires: ['agility_starter'],
  },
  // --- Fork A: Value Path ---
  {
    id: 'jit_compilation',
    name: '即时编译',
    description: '价值分支：“代码优雅度”(RP) 的基础加成效果提升 25%。',
    cost: 6,
    school: 'agility',
    requires: ['dynamic_typing'],
  },
  {
    id: 'code_generation',
    name: '代码生成',
    description: '价值分支跨界协同：手动“代码重构”时，所有生成器数量临时翻倍，持续 10 秒。',
    cost: 12,
    school: 'agility',
    requires: ['jit_compilation', 'efficiency_starter'],
  },
  // --- Fork B: Quantity Path ---
  {
    id: 'refactoring_tools',
    name: '重构工具',
    description: '数量分支：每次“代码重构”时，额外获得 1 点 RP。',
    cost: 6,
    school: 'agility',
    requires: ['dynamic_typing'],
  },
  {
    id: 'metaprogramming',
    name: '元编程',
    description: '数量分支终极技能：“代码重构”获得的 RP 数量提升 20%。',
    cost: 20,
    school: 'agility',
    requires: ['refactoring_tools'],
  },
  // #endregion
]
