import type { IUnlockCondition } from './reset';

export type ParadigmEffectType = 'generatorProduction' | 'allCpProduction';

export interface IParadigmEffect {
  type: ParadigmEffectType;
  generatorId?: number;
  multiplier?: number;
}

export interface IParadigmUpgrade {
  id: number;
  name: string;
  cost: number; // Cost in Singularity Power (SP)
  effect: IParadigmEffect;
  dependencies: number[]; // IDs of prerequisite upgrades within the same path
  purchased?: boolean;
}

export interface ISkillTree {
  [path: string]: IParadigmUpgrade[]; // e.g., 'Procedural', 'OOP', 'General'
}

export interface IProgrammingParadigmsConfig {
  unlockCondition: IUnlockCondition;
  skillTree: ISkillTree;
}

export interface IParadigmState {
  purchasedUpgrades: number[]; // IDs of purchased upgrades
}