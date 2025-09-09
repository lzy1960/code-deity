import type { IUnlockCondition } from './reset';

export type PatchEffectType = 'gameSpeed';

export interface IPatchEffect {
  type: PatchEffectType;
  multiplier?: number;
}

export interface ISystemPatch {
  id: number;
  name: string;
  description: string;
  effect: IPatchEffect;
  cost: number; // Cost in Genesis Shards (GS)
  equipped?: boolean;
}

export interface ISystemPatchesConfig {
  unlockCondition: IUnlockCondition;
  definitions: ISystemPatch[];
}

export interface IPatchState {
  unlockedPatches: number[]; // IDs of unlocked patches
  equippedPatches: number[]; // IDs of equipped patches
}