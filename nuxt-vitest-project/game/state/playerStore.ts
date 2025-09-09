import { defineStore } from 'pinia';
import { Decimal } from 'decimal.js';
import type { IPlayerState } from '../types';

export const usePlayerStore = defineStore('player', {
  state: (): IPlayerState => ({
    money: new Decimal(0),
    refactorPoints: new Decimal(0),
    versionPoints: new Decimal(0),
  }),
  getters: {
    getMoney(): Decimal {
      return this.money;
    },
    getRefactorPoints(): Decimal {
      return this.refactorPoints;
    },
    getVersionPoints(): Decimal {
      return this.versionPoints;
    },
  },
  actions: {
    addMoney(amount: Decimal) {
      this.money = this.money.plus(amount);
    },
    deductMoney(amount: Decimal): boolean {
      if (this.money.greaterThanOrEqualTo(amount)) {
        this.money = this.money.minus(amount);
        return true;
      }
      return false;
    },
    addRefactorPoints(amount: Decimal) {
      this.refactorPoints = this.refactorPoints.plus(amount);
    },
    addVersionPoints(amount: Decimal) {
      this.versionPoints = this.versionPoints.plus(amount);
    },
    resetPlayerState() {
      this.money = new Decimal(0);
      // refactorPoints and versionPoints are not reset on a soft reset
    },
    hardResetPlayerState() {
      this.money = new Decimal(0);
      this.refactorPoints = new Decimal(0);
      this.versionPoints = new Decimal(0);
    },
  },
});
