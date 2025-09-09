/**
 * @file Save game data structure and migration logic.
 */

import { db } from './db';
import Decimal from 'decimal.js';

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
}

/**
 * The current version of the save data structure.
 * This should be incremented whenever the SaveData interface changes.
 */
export const CURRENT_SAVE_VERSION = '1.0';

/**
 * An object to hold migration functions.
 * Each key corresponds to a save version, and the value is a function
 * that migrates a save object of that version to the next version.
 */
const migrations: Record<string, (saveData: any) => any> = {
  // Example migration from '1.0' to '1.1':
  // '1.0': (saveData) => {
  //   ...saveData,
  //   newField: 'defaultValue',
  //   version: '1.1',
  // },
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
    lastSaveTime: Date.now(),
  };
  await db.saveData.put(dataToSave as any, 1);
}

/**
 * Creates a new, clean save data object.
 *
 * @returns A new SaveData object with default values.
 */
export function createNewSave(): SaveData {
  return {
    version: CURRENT_SAVE_VERSION,
    lastSaveTime: Date.now(),
    money: new Decimal(0),
  };
}