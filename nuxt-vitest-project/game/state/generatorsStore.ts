import { defineStore } from 'pinia';
import { Decimal } from 'decimal.js';
import { IGenerator } from '../types';
import gameConfig from '../../gameConfig';

interface IGeneratorsState {
  generators: IGenerator[];
}

const createInitialGenerators = (): IGenerator[] => Array.from({ length: 8 }).map((_, index) => ({
  id: index,
  level: 1, // All generators start at level 1
  quantity: new Decimal(0),
  productionRate: new Decimal(0), // Initial production rate will be calculated by GeneratorSystem
}));

export const useGeneratorsStore = defineStore('generators', {
  state: (): IGeneratorsState => ({
    generators: createInitialGenerators(),
  }),
  getters: {
    getGenerator: (state) => (id: number) => {
      return state.generators.find((g) => g.id === id);
    },
    getGeneratorQuantity: (state) => (id: number): Decimal => {
      return state.generators.find((g) => g.id === id)?.quantity || new Decimal(0);
    },
    getAllGenerators(): IGenerator[] {
      return this.generators;
    },
  },
  actions: {
    addGenerator(id: number, amount: Decimal = new Decimal(1)) {
      const generator = this.generators.find((g) => g.id === id);
      if (generator) {
        generator.quantity = generator.quantity.plus(amount);
      }
    },
    updateGeneratorProductionRate(id: number, rate: Decimal) {
      const generator = this.generators.find((g) => g.id === id);
      if (generator) {
        generator.productionRate = rate;
      }
    },
    $reset() {
      this.generators = createInitialGenerators();
    },
  },
});