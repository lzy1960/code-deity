import { Decimal } from 'decimal.js';
import { usePlayerStore } from '../state/playerStore';
import { useGeneratorsStore } from '../state/generatorsStore';
import gameConfig from '../../gameConfig';

export class GeneratorSystem {
  private playerStore;
  private generatorsStore;

  constructor() {
    this.playerStore = usePlayerStore();
    this.generatorsStore = useGeneratorsStore();
  }

  getGeneratorCost(generatorId: number, quantity: Decimal = new Decimal(1)): Decimal {
    const generator = this.generatorsStore.getGenerator(generatorId);
    if (!generator) {
      return new Decimal(0);
    }
    const baseCost = new Decimal(generator.baseCost);
    const costMultiplier = new Decimal(gameConfig.generator_cost_multiplier);
    const currentQuantity = generator.quantity;

    let totalCost = new Decimal(0);
    for (let i = 0; i < quantity.toNumber(); i++) {
      const effectiveQuantity = currentQuantity.plus(i);
      const cost = baseCost.times(costMultiplier.pow(effectiveQuantity));
      totalCost = totalCost.plus(cost);
    }
    return totalCost;
  }

  getGeneratorProductionRate(generatorId: number): Decimal {
    const generator = this.generatorsStore.getGenerator(generatorId);
    if (!generator) {
      return new Decimal(0);
    }
    const baseProduction = new Decimal(generator.baseProduction);
    // Production rate increases with level, quantity, and yield multiplier
    return baseProduction.times(generator.quantity).times(generator.level).times(generator.yieldMultiplier);
  }

  buyGenerator(generatorId: number, quantity: Decimal = new Decimal(1)): boolean {
    const cost = this.getGeneratorCost(generatorId, quantity);
    if (this.playerStore.deductMoney(cost)) {
      this.generatorsStore.addGenerator(generatorId, quantity);
      // Update production rate after buying
      const newProductionRate = this.getGeneratorProductionRate(generatorId);
      this.generatorsStore.updateGeneratorProductionRate(generatorId, newProductionRate);
      return true;
    }
    return false;
  }

  produceAllGenerators(): Decimal {
    let totalProduction = new Decimal(0);
    this.generatorsStore.getAllGenerators.forEach((generator) => {
      const production = generator.productionRate;
      totalProduction = totalProduction.plus(production);
    });
    this.playerStore.addMoney(totalProduction);
    return totalProduction;
  }
}