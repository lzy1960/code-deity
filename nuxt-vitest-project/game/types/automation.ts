import type { IUnlockCondition } from './reset';

export interface IAutomationConfig {
  unlockCondition: IUnlockCondition;
  autoBuyGenerators: boolean;
  autoBuyIntervalMs: number;
}

export interface IAutomationState {
  autoBuyGenerators: boolean;
  autoBuyIntervalMs: number;
}