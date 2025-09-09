import { computed } from 'vue';
import { usePlayerStore } from '../state/playerStore';
import { useGeneratorsStore } from '../state/generatorsStore';
import { GeneratorSystem } from '../systems/generator';
import { Decimal } from 'decimal.js';

export function useGenerators() {
  const playerStore = usePlayerStore();
  const generatorsStore = useGeneratorsStore();
  const generatorSystem = new GeneratorSystem();

  const money = computed(() => playerStore.getMoney);
  const generators = computed(() => generatorsStore.getAllGenerators);

  const buyGenerator = (generatorId: number, quantity: Decimal = new Decimal(1)) => {
    return generatorSystem.buyGenerator(generatorId, quantity);
  };

  const getGeneratorCost = (generatorId: number, quantity: Decimal = new Decimal(1)) => {
    return generatorSystem.getGeneratorCost(generatorId, quantity);
  };

  const getGeneratorProductionRate = (generatorId: number) => {
    return generatorSystem.getGeneratorProductionRate(generatorId);
  };

  return {
    money,
    generators,
    buyGenerator,
    getGeneratorCost,
    getGeneratorProductionRate,
  };
}