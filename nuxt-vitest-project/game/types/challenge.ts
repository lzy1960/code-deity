import type { IUnlockCondition } from './reset';

export type RestrictionType = 'noGenerator';
export type GoalType = 'refactorCount';
export type RewardType = 'permanentCpMultiplier';

export interface IRestriction {
  type: RestrictionType;
  generatorId?: number;
}

export interface IGoal {
  type: GoalType;
  count?: number;
}

export interface IReward {
  type: RewardType;
  multiplier?: number;
}

export interface IChallenge {
  id: number;
  name: string;
  description: string;
  restriction: IRestriction;
  goal: IGoal;
  reward: IReward;
  completed: boolean;
}

export interface IChallengesConfig {
  unlockCondition: IUnlockCondition;
  definitions: IChallenge[];
}

export interface IChallengesState {
  challenges: IChallenge[];
}