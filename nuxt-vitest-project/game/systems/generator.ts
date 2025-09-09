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
    const baseCost = new Decimal(gameConfig.generator_base_cost);
    const costMultiplier = new Decimal(gameConfig.generator_cost_multiplier);
    const generator = this.generatorsStore.getGenerator(generatorId);
    const currentQuantity = generator ? generator.quantity : new Decimal(0);

    let totalCost = new Decimal(0);
    for (let i = 0; i < quantity.toNumber(); i++) {
      const effectiveQuantity = currentQuantity.plus(i);
      const cost = baseCost.times(costMultiplier.pow(effectiveQuantity));
      totalCost = totalCost.plus(cost);
    }
    return totalCost;
  }

  getGeneratorProductionRate(generatorId: number): Decimal {
    // Placeholder for actual production rate calculation based on generator level and other factors
    // For now, a simple placeholder. This will be expanded based on gameConfig.
    const generator = this.generatorsStore.getGenerator(generatorId);
    if (!generator) {
      return new Decimal(0);
    }
    const baseProduction = new Decimal(gameConfig.generator_base_production);
    // Production rate increases with level, and quantity
    return baseProduction.times(generator.quantity).times(generator.level);
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