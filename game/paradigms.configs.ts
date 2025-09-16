export interface Paradigm {
  id: string
  name: string
  description: string
  cost: number // SP cost
  requires?: string[] // IDs of required paradigms
  position: { x: number, y: number } // For rendering the tree
  // effect will be handled in the store's getters
}

export const paradigmConfigs: Paradigm[] = [
  // Tier 1: Foundational Paradigms
  {
    id: 'procedural',
    name: '过程式编程 (Procedural)',
    description: '所有生成器的产量提升 50%。',
    cost: 1,
    position: { x: 0, y: 1 },
  },
  {
    id: 'oop',
    name: '面向对象编程 (OOP)',
    description: '每次购买生成器的“买十赠一”奖励效果提升 10%。',
    cost: 1,
    position: { x: 0, y: 2 },
  },
  {
    id: 'functional',
    name: '函数式编程 (Functional)',
    description: '“代码优雅度” (RP) 的加成效果提升 20%。',
    cost: 1,
    position: { x: 0, y: 3 },
  },

  // Tier 2: Specializations
  {
    id: 'structured',
    name: '结构化编程',
    description: '“函数”和“类”生成器的产量翻倍。',
    cost: 3,
    requires: ['procedural'],
    position: { x: 1, y: 0 },
  },
  {
    id: 'declarative',
    name: '声明式编程',
    description: '“框架”和“编译器”生成器的产量翻倍。',
    cost: 5,
    requires: ['functional', 'oop'],
    position: { x: 1, y: 2 },
  },
]
