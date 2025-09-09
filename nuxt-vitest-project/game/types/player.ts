import { Decimal } from 'decimal.js';
import type { Era } from './era';

export interface IPlayerState {
  money: Decimal; // Computing Power (CP)
  refactorPoints: Decimal; // Refactor Points (RP)
  versionPoints: Decimal; // Version Points (Version)
  singularityPower: Decimal; // Singularity Power (SP)
  genesisShards: Decimal; // Genesis Shards (GS)
  currentEra: Era;
  refactorCount: number;
  compileCount: number;
  singularityCount: number;
  genesisCount: number;
}