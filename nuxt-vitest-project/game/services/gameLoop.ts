import { GeneratorSystem } from '../systems/generator';

export class GameLoopService {
  private generatorSystem: GeneratorSystem;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private tickInterval: number = 1000; // 1 second

  constructor(generatorSystem: GeneratorSystem) {
    this.generatorSystem = generatorSystem;
  }

  startGameLoop() {
    if (this.intervalId !== null) {
      console.warn('Game loop is already running.');
      return;
    }

    this.intervalId = setInterval(() => {
      this.gameTick();
    }, this.tickInterval);
    console.log('Game loop started.');
  }

  stopGameLoop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Game loop stopped.');
    } else {
      console.warn('Game loop is not running.');
    }
  }

  private gameTick() {
    this.generatorSystem.produceAllGenerators();
    // Potentially add other game logic here that needs to run every tick
  }
}