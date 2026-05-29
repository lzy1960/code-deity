import Dexie, { type Table } from 'dexie';

export interface GameSave {
  id?: string | number;
  saveData: string;
  timestamp: number;
}

export class MySubClassedDexie extends Dexie {
  saves!: Table<GameSave>;

  constructor() {
    super('CodeDeityDB');
    this.version(1).stores({
      saves: '++id, timestamp', // Primary key and indexed timestamp
    });
  }
}

export const db = process.client ? new MySubClassedDexie() : {} as MySubClassedDexie;