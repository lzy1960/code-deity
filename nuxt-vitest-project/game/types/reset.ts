import { Decimal } from 'decimal.js';
import type { Era } from './era';

export type ResetType = 'Refactor' | 'Compile' | 'Singularity' | 'BecomeGenesis';

export interface IUnlockCondition {
  type: 'generatorQuantity' | 'refactorCount' | 'compileCount' | 'cp' | 'sp' | 'era';
  generatorId?: number;
  quantity?: number;
  count?: number;
  amount?: number;
  era?: Era;
}

export interface IRefactorConfig {
  unlockCondition: IUnlockCondition;
  rpGainBase: number;
  cpMultiplierPerRp: number;
}

export interface ICompileConfig {
  unlockCondition: IUnlockCondition;
  versionGainBase: number;
  rpEfficiencyMultiplierPerVersion: number;
}

export interface ISingularityConfig {
  unlockCondition: IUnlockCondition;
  spGainBase: number;
}

export interface IBecomeGenesisConfig {
  unlockCondition: IUnlockCondition;
  gsGainBase: number;
}