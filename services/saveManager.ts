import { db } from '~/utils/db'

const SAVE_KEY_LOCAL = 'local_save'

/**
 * The Save Manager is only responsible for storing and retrieving raw JSON objects.
 * The logic for serialization and deserialization now lives within the game store itself.
 */
export const saveManager = {
  async save(state: object) {
    const jsonState = JSON.stringify(state)

    // Always save to local storage as a backup or main save
    await db.saves.put({
      id: SAVE_KEY_LOCAL,
      saveData: jsonState,
      timestamp: Date.now(),
    })
  },

  async load(): Promise<{data: object | null, source: 'local' | 'none'}> {
    // 1. Prioritize local save
    const localData = await db.saves.get(SAVE_KEY_LOCAL)
    if (localData) {
      console.log('Local save found!')
      try {
        const parsed = JSON.parse(localData.saveData)
        if (parsed && typeof parsed === 'object') {
          return { data: parsed, source: 'local' }
        }
        console.warn('Local save data is not an object. Ignoring save.')
      } catch (error) {
        console.warn('Failed to parse local save data. Ignoring save.', error)
      }
      return { data: null, source: 'none' }
    }

    // 2. If nothing found
    console.log('No save data found anywhere.')
    return { data: null, source: 'none' }
  },

  async wipeData() {
    await db.saves.clear()
    console.log('Local data wiped!')
  },
}
