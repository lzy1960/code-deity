import { defineStore } from 'pinia';
import { Decimal } from 'decimal.js';
import { IPlayerState } from '../types';

export const usePlayerStore = defineStore('player', {
  state: (): IPlayerState => ({
    money: new Decimal(0),
  }),
  getters: {
    getMoney(): Decimal {
      return this.money;
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
  },
});