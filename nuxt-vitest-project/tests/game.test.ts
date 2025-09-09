import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePlayerStore } from '../game/state/playerStore';
import { useGeneratorsStore } from '../game/state/generatorsStore';
import { GeneratorSystem } from '../game/systems/generator';
import { GameLoopService } from '../game/services/gameLoop';
import { Decimal } from 'decimal.js';
import gameConfig from '../gameConfig';

describe('Player Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with 0 money', () => {
    const playerStore = usePlayerStore();
    expect(playerStore.money.toString()).toBe('0');
  });

  it('should add money correctly', () => {
    const playerStore = usePlayerStore();
    playerStore.addMoney(new Decimal(100));
    expect(playerStore.money.toString()).toBe('100');
    playerStore.addMoney(new Decimal(50.5));
    expect(playerStore.money.toString()).toBe('150.5');
  });

  it('should deduct money correctly', () => {
    const playerStore = usePlayerStore();
    playerStore.addMoney(new Decimal(200));
    expect(playerStore.deductMoney(new Decimal(50))).toBe(true);
    expect(playerStore.money.toString()).toBe('150');
  });

  it('should not deduct money if insufficient funds', () => {
    const playerStore = usePlayerStore();
    playerStore.addMoney(new Decimal(100));
    expect(playerStore.deductMoney(new Decimal(150))).toBe(false);
    expect(playerStore.money.toString()).toBe('100');
  });
});

describe('Generators Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should initialize with 8 generators', () => {
    const generatorsStore = useGeneratorsStore();
    expect(generatorsStore.generators.length).toBe(8);
    generatorsStore.generators.forEach(generator => {
      expect(generator.quantity.toString()).toBe('0');
      expect(generator.level).toBe(1);
      expect(generator.productionRate.toString()).toBe('0');
    });
  });

  it('should add generator quantity correctly', () => {
    const generatorsStore = useGeneratorsStore();
    generatorsStore.addGenerator(0, new Decimal(5));
    expect(generatorsStore.getGeneratorQuantity(0).toString()).toBe('5');
    generatorsStore.addGenerator(0, new Decimal(3));
    expect(generatorsStore.getGeneratorQuantity(0).toString()).toBe('8');
  });

  it('should update generator production rate correctly', () => {
    const generatorsStore = useGeneratorsStore();
    generatorsStore.updateGeneratorProductionRate(0, new Decimal(10));
    expect(generatorsStore.getGenerator(0)?.productionRate.toString()).toBe('10');
  });
});

describe('Generator System', () => {
  let playerStore: ReturnType<typeof usePlayerStore>;
  let generatorsStore: ReturnType<typeof useGeneratorsStore>;
  let generatorSystem: GeneratorSystem;

  beforeEach(() => {
    setActivePinia(createPinia());
    playerStore = usePlayerStore();
    generatorsStore = useGeneratorsStore();
    generatorsStore.$reset(); // Reset generators store state
    generatorSystem = new GeneratorSystem();
    playerStore.money = new Decimal(1000); // Give player some initial money
  });

  it('should calculate generator cost correctly', () => {
    // Cost for the first generator (quantity 0 -> 1)
    const cost1 = generatorSystem.getGeneratorCost(0, new Decimal(1));
    expect(cost1.toString()).toBe(new Decimal(gameConfig.generator_base_cost).toString());

    // Add one generator to simulate existing generators
    generatorsStore.addGenerator(0, new Decimal(1));

    // Cost for the second generator (quantity 1 -> 2)
    const cost2 = generatorSystem.getGeneratorCost(0, new Decimal(1));
    const expectedCost2 = new Decimal(gameConfig.generator_base_cost).times(new Decimal(gameConfig.generator_cost_multiplier).pow(1));
    expect(cost2.toString()).toBe(expectedCost2.toString());

    // Cost for buying 2 generators when 1 already exists (quantity 1 -> 3)
    const cost3 = generatorSystem.getGeneratorCost(0, new Decimal(2));
    const expectedCost3_gen2 = new Decimal(gameConfig.generator_base_cost).times(new Decimal(gameConfig.generator_cost_multiplier).pow(1));
    const expectedCost3_gen3 = new Decimal(gameConfig.generator_base_cost).times(new Decimal(gameConfig.generator_cost_multiplier).pow(2));
    expect(cost3.toString()).toBe(expectedCost3_gen2.plus(expectedCost3_gen3).toString());
  });

  it('should buy a generator if funds are sufficient', () => {
    const initialMoney = playerStore.money;
    const cost = generatorSystem.getGeneratorCost(0, new Decimal(1));
    expect(generatorSystem.buyGenerator(0, new Decimal(1))).toBe(true);
    expect(playerStore.money.toString()).toBe(initialMoney.minus(cost).toString());
    expect(generatorsStore.getGeneratorQuantity(0).toString()).toBe('1');
  });

  it('should not buy a generator if funds are insufficient', () => {
    playerStore.money = new Decimal(0);
    expect(generatorSystem.buyGenerator(0, new Decimal(1))).toBe(false);
    expect(playerStore.money.toString()).toBe('0');
    expect(generatorsStore.getGeneratorQuantity(0).toString()).toBe('0');
  });

  it('should produce money from all generators', () => {
    generatorsStore.addGenerator(0, new Decimal(1));
    generatorSystem.buyGenerator(0, new Decimal(1)); // Buy one to set initial production rate
    const initialMoney = playerStore.money;
    const productionRate = generatorSystem.getGeneratorProductionRate(0);
    
    generatorSystem.produceAllGenerators();
    expect(playerStore.money.toString()).toBe(initialMoney.plus(productionRate).toString());
  });
});

describe('Game Loop Service', () => {
  let gameLoopService: GameLoopService;
  let generatorSystem: GeneratorSystem;

  beforeEach(() => {
    setActivePinia(createPinia());
    generatorSystem = new GeneratorSystem(); // Create an instance to pass
    gameLoopService = new GameLoopService(generatorSystem);
    vi.useFakeTimers(); // Mock timers
  });

  afterEach(() => {
    vi.useRealTimers(); // Restore real timers
  });

  it('should start and stop the game loop', () => {
    const spy = vi.spyOn(generatorSystem, 'produceAllGenerators');
    gameLoopService.startGameLoop();
    expect(spy).not.toHaveBeenCalled(); // Not called immediately

    vi.advanceTimersByTime(1000); // Advance by 1 second
    expect(spy).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000); // Advance by another second
    expect(spy).toHaveBeenCalledTimes(2);

    gameLoopService.stopGameLoop();
    vi.advanceTimersByTime(1000); // Advance after stopping
    expect(spy).toHaveBeenCalledTimes(2); // Should not be called again
  });
});