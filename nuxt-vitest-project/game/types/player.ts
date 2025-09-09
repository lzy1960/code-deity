import { Decimal } from 'decimal.js';

export interface IPlayerState {
  money: Decimal;
  refactorPoints: Decimal;
  versionPoints: Decimal;
}