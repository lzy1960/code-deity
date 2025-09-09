/**
 * @file Save game data structure and migration logic.
 */

import { db } from './db';
import Decimal from 'decimal.js';
import type { IGenerator } from '../game/types/generator';

/**
 * Defines the structure for the game's save data.
 * All save data objects should conform to this interface.
 */
export interface SaveData {
  id?: number;
  version: string;
  // Add other game state properties here.
  lastSaveTime: number;
  money: Decimal;
  refactorPoints: Decimal;
  versionPoints: Decimal;
  generators: IGenerator[];
}

/**
 * The current version of the save data structure.
 * This should be incremented whenever the SaveData interface changes.
 */
export const CURRENT_SAVE_VERSION = '1.1';

/**
 * An object to hold migration functions.
 * Each key corresponds to a save version, and the value is a function
 * that migrates a save object of that version to the next version.
 */
const migrations: Record<string, (saveData: any) => any> = {
  '1.0': (saveData) => {
    return {
      ...saveData,
      refactorPoints: new Decimal(0),
      versionPoints: new Decimal(0),
      version: '1.1',
    };
  },
};

/**
 * Loads the game from Dexie, applying migrations if necessary.
 *
 * @returns The migrated, up-to-date save data object, or null if no save data is found.
 */
export async function loadGame(): Promise<SaveData | null> {
  const saveData = await db.saveData.get(1);

  if (!saveData) {
    return null;
  }

  let migratedData = saveData;

  // Loop through migrations until the save data is up to the current version.
  while (migratedData.version !== CURRENT_SAVE_VERSION) {
    const migration = migrations[migratedData.version];
    if (migration) {
      migratedData = migration(migratedData);
    } else {
      // If no migration path is found, we can either throw an error,
      // or attempt a "best effort" load. For now, we'll log a warning
      // and break, which might leave the data in an inconsistent state.
      console.warn(`No migration path found for save version: ${migratedData.version}`);
      break;
    }
  }

  return {
    ...migratedData,
    money: new Decimal(migratedData.money),
    refactorPoints: new Decimal(migratedData.refactorPoints),
    versionPoints: new Decimal(migratedData.versionPoints),
  } as SaveData;
}

/**
 * Saves the game data to Dexie.
 *
 * @param saveData The save data object to save.
 */
export async function saveGame(saveData: SaveData): Promise<void> {
  const dataToSave = {
    ...saveData,
    money: saveData.money.toString(),
    refactorPoints: saveData.refactorPoints.toString(),
    versionPoints: saveData.versionPoints.toString(),
    lastSaveTime: Date.now(),
  };
  await db.saveData.put(dataToSave as any, 1);
}

/**
 * Creates a new, clean save data object.
 *
 * @returns A new SaveData object with default values.
 */
import gameConfig from '../gameConfig';
import { createInitialGenerators } from '../game/state/generatorsStore';

export function createNewSave(): SaveData {
  return {
    version: CURRENT_SAVE_VERSION,
    lastSaveTime: Date.now(),
    money: new Decimal(0),
    refactorPoints: new Decimal(0),
    versionPoints: new Decimal(0),
    generators: createInitialGenerators(),
  };
}