import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Decimal } from 'decimal.js';
import { GeneratorSystem } from '../game/systems/generator';
import { usePlayerStore } from '../game/state/playerStore';
import { useGeneratorsStore } from '../game/state/generatorsStore';
import gameConfig from '../gameConfig';

// Mock the stores
vi.mock('../game/state/playerStore', () => ({
  usePlayerStore: vi.fn(),
}));
vi.mock('../game/state/generatorsStore', () => ({
  useGeneratorsStore: vi.fn(),
}));

describe('GeneratorSystem', () => {
  let generatorSystem: GeneratorSystem;
  let playerStoreMock: {
    money: Decimal;
    getMoney: Decimal;
    addMoney: ReturnType<typeof vi.fn>;
    deductMoney: ReturnType<typeof vi.fn>;
  };
  let generatorsStoreMock: {
    generators: Record<number, { id: number; quantity: Decimal; level: number; productionRate: Decimal }>;
    getAllGenerators: Array<{ id: number; quantity: Decimal; level: number; productionRate: Decimal }>; // Changed to a property
    getGenerator: ReturnType<typeof vi.fn>;
    addGenerator: ReturnType<typeof vi.fn>;
    updateGeneratorProductionRate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Reset mocks before each test
    playerStoreMock = {
      money: new Decimal(1000),
      getMoney: new Decimal(1000), // This will be a getter in the actual store, but mocked as a property here
      addMoney: vi.fn((amount: Decimal) => { playerStoreMock.money = playerStoreMock.money.plus(amount); }),
      deductMoney: vi.fn((amount: Decimal) => {
        if (playerStoreMock.money.greaterThanOrEqualTo(amount)) {
          playerStoreMock.money = playerStoreMock.money.minus(amount);
          return true;
        }
        return false;
      }),
    };
    generatorsStoreMock = {
      generators: {},
      getAllGenerators: [], // Initialize as empty array
      getGenerator: vi.fn((id: number) => generatorsStoreMock.generators[id]),
      addGenerator: vi.fn((id: number, quantity: Decimal) => {
        if (!generatorsStoreMock.generators[id]) {
          generatorsStoreMock.generators[id] = { id, quantity: new Decimal(0), level: 1, productionRate: new Decimal(0) };
        }
        generatorsStoreMock.generators[id].quantity = generatorsStoreMock.generators[id].quantity.plus(quantity);
        generatorsStoreMock.getAllGenerators = Object.values(generatorsStoreMock.generators); // Update the property
      }),
      updateGeneratorProductionRate: vi.fn((id: number, rate: Decimal) => {
        if (generatorsStoreMock.generators[id]) {
          generatorsStoreMock.generators[id].productionRate = rate;
        }
      }),
    };

    // Mock the return values of usePlayerStore and useGeneratorsStore
    (usePlayerStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(playerStoreMock);
    (useGeneratorsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(generatorsStoreMock);

    generatorSystem = new GeneratorSystem();
  });

  // Test cases for getGeneratorCost
  describe('getGeneratorCost', () => {
    beforeEach(() => {
      gameConfig.generator_base_cost = 10;
      gameConfig.generator_cost_multiplier = 1.1;
      generatorsStoreMock.generators = {}; // Ensure no existing generators for these tests
      generatorsStoreMock.getAllGenerators = [];
    });

    it('should calculate the cost for a single generator correctly', () => {
      const cost = generatorSystem.getGeneratorCost(1, new Decimal(1));
      expect(cost.toNumber()).toBeCloseTo(10);
    });

    it('should calculate the cost for multiple generators correctly with existing quantity', () => {
      generatorsStoreMock.generators = { 1: { id: 1, quantity: new Decimal(1), level: 1, productionRate: new Decimal(0) } }; // 1 existing generator
      generatorsStoreMock.getAllGenerators = Object.values(generatorsStoreMock.generators);

      // Buying 2 more:
      // Cost of 2nd generator: 10 * (1.1 ^ 1) = 11
      // Cost of 3rd generator: 10 * (1.1 ^ 2) = 12.1
      // Total cost = 11 + 12.1 = 23.1
      const cost = generatorSystem.getGeneratorCost(1, new Decimal(2));
      expect(cost.toNumber()).toBeCloseTo(23.1);
    });

    it('should return 0 if quantity is 0', () => {
      const cost = generatorSystem.getGeneratorCost(1, new Decimal(0));
      expect(cost.toNumber()).toBe(0);
    });
  });

  // Test cases for getGeneratorProductionRate
  describe('getGeneratorProductionRate', () => {
    beforeEach(() => {
      gameConfig.generator_base_production = 1;
      generatorsStoreMock.generators = {}; // Reset generators for each test
      generatorsStoreMock.getAllGenerators = [];
    });

    it('should calculate production rate correctly for an existing generator', () => {
      generatorsStoreMock.generators = { 1: { id: 1, quantity: new Decimal(5), level: 2, productionRate: new Decimal(0) } };
      generatorsStoreMock.getAllGenerators = Object.values(generatorsStoreMock.generators);

      const productionRate = generatorSystem.getGeneratorProductionRate(1);
      expect(productionRate.toNumber()).toBe(10); // baseProduction * quantity * level = 1 * 5 * 2
    });

    it('should return 0 if generator does not exist', () => {
      const productionRate = generatorSystem.getGeneratorProductionRate(1);
      expect(productionRate.toNumber()).toBe(0);
    });

    it('should return 0 if generator quantity is 0', () => {
      generatorsStoreMock.generators = { 1: { id: 1, quantity: new Decimal(0), level: 1, productionRate: new Decimal(0) } };
      generatorsStoreMock.getAllGenerators = Object.values(generatorsStoreMock.generators);

      const productionRate = generatorSystem.getGeneratorProductionRate(1);
      expect(productionRate.toNumber()).toBe(0);
    });
  });

  // Test cases for buyGenerator
  describe('buyGenerator', () => {
    beforeEach(() => {
      gameConfig.generator_base_cost = 10;
      gameConfig.generator_cost_multiplier = 1.1;
      gameConfig.generator_base_production = 1;
      generatorsStoreMock.generators = {}; // Reset generators for each buyGenerator test
      generatorsStoreMock.getAllGenerators = [];
    });

    it('should successfully buy a generator if player has enough money', () => {
      playerStoreMock.money = new Decimal(100); // Set initial money

      const bought = generatorSystem.buyGenerator(1, new Decimal(1));
      expect(bought).toBe(true);
      expect(playerStoreMock.deductMoney).toHaveBeenCalledWith(new Decimal(10));
      expect(generatorsStoreMock.addGenerator).toHaveBeenCalledWith(1, new Decimal(1));
      expect(generatorsStoreMock.updateGeneratorProductionRate).toHaveBeenCalled();
      expect(playerStoreMock.money.toNumber()).toBeCloseTo(90);
    });

    it('should not buy a generator if player does not have enough money', () => {
      playerStoreMock.money = new Decimal(5); // Not enough money

      const bought = generatorSystem.buyGenerator(1, new Decimal(1));
      expect(bought).toBe(false);
      expect(playerStoreMock.deductMoney).toHaveBeenCalledWith(new Decimal(10));
      expect(generatorsStoreMock.addGenerator).not.toHaveBeenCalled();
      expect(generatorsStoreMock.updateGeneratorProductionRate).not.toHaveBeenCalled();
      expect(playerStoreMock.money.toNumber()).toBeCloseTo(5);
    });

    it('should correctly update generator quantity and production rate after buying', () => {
      playerStoreMock.money = new Decimal(100);

      generatorSystem.buyGenerator(1, new Decimal(1));

      expect(generatorsStoreMock.addGenerator).toHaveBeenCalledWith(1, new Decimal(1));
      // After buying 1 generator, quantity is 1, level is 1. Production rate should be 1 * 1 * 1 = 1
      expect(generatorsStoreMock.updateGeneratorProductionRate).toHaveBeenCalledWith(1, new Decimal(1));
    });
  });

  // Test cases for produceAllGenerators
  describe('produceAllGenerators', () => {
    beforeEach(() => {
      playerStoreMock.money = new Decimal(100); // Reset money for each produceAllGenerators test
      generatorsStoreMock.generators = {}; // Reset generators
      generatorsStoreMock.getAllGenerators = [];
    });

    it('should correctly calculate and add total production to player money', () => {
      // Manually set the generators in the mock's internal state
      generatorsStoreMock.generators = {
        1: { id: 1, quantity: new Decimal(1), level: 1, productionRate: new Decimal(5) },
        2: { id: 2, quantity: new Decimal(1), level: 1, productionRate: new Decimal(10) },
      };
      generatorsStoreMock.getAllGenerators = Object.values(generatorsStoreMock.generators); // Update the property

      const totalProduction = generatorSystem.produceAllGenerators();
      expect(totalProduction.toNumber()).toBe(15);
      expect(playerStoreMock.addMoney).toHaveBeenCalledWith(new Decimal(15));
      expect(playerStoreMock.money.toNumber()).toBeCloseTo(115);
    });

    it('should return 0 if no generators exist', () => {
      const totalProduction = generatorSystem.produceAllGenerators();
      expect(totalProduction.toNumber()).toBe(0);
      expect(playerStoreMock.addMoney).toHaveBeenCalledWith(new Decimal(0));
      expect(playerStoreMock.money.toNumber()).toBeCloseTo(100);
    });
  });
});