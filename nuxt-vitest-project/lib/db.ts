import Dexie, { type Table } from 'dexie';
import { type SaveData } from './save';

export interface Player {
  id?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export class MySubClassedDexie extends Dexie {
  player!: Table<Player>;
  saveData!: Table<SaveData>;

  constructor() {
    super('myDatabase');
    this.version(1).stores({
      player: '++id, money, prestigePoints',
      saveData: '++id',
    });
  }
}

export const db = new MySubClassedDexie();