import { db } from '~/utils/db'

const SAVE_KEY_LOCAL = 'local_save'
const SAVE_KEY_EMERGENCY = 'code_deity_emergency_save'

type SaveSource = 'indexeddb' | 'localStorage' | 'none'

interface StoredSave {
  saveData: string
  timestamp: number
}

function emergencyStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    const storage = window.localStorage
    const testKey = `${SAVE_KEY_EMERGENCY}_test`
    storage.setItem(testKey, '1')
    storage.removeItem(testKey)
    return storage
  } catch {
    return null
  }
}

function saveEmergencySnapshot(saveData: string, timestamp: number) {
  const storage = emergencyStorage()
  if (!storage) return

  storage.setItem(SAVE_KEY_EMERGENCY, JSON.stringify({ saveData, timestamp }))
}

function loadEmergencySnapshot(): StoredSave | null {
  const storage = emergencyStorage()
  if (!storage) return null

  const raw = storage.getItem(SAVE_KEY_EMERGENCY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.saveData === 'string' &&
      typeof parsed.timestamp === 'number'
    ) {
      return parsed
    }
  } catch (error) {
    console.warn('Failed to parse emergency save snapshot. Ignoring snapshot.', error)
  }
  return null
}

function clearEmergencySnapshot() {
  const storage = emergencyStorage()
  storage?.removeItem(SAVE_KEY_EMERGENCY)
}

function parseSave(candidate: StoredSave, source: Exclude<SaveSource, 'none'>) {
  try {
    const parsed = JSON.parse(candidate.saveData)
    if (parsed && typeof parsed === 'object') {
      return { data: parsed, source, timestamp: candidate.timestamp }
    }
    console.warn(`${source} save data is not an object. Ignoring save.`)
  } catch (error) {
    console.warn(`Failed to parse ${source} save data. Ignoring save.`, error)
  }
  return null
}

/**
 * The Save Manager is only responsible for storing and retrieving raw JSON objects.
 * The logic for serialization and deserialization now lives within the game store itself.
 */
export const saveManager = {
  async save(state: object) {
    const jsonState = JSON.stringify(state)
    const timestamp = Date.now()

    // localStorage is synchronous, so this snapshot survives fast refresh/page unload.
    saveEmergencySnapshot(jsonState, timestamp)

    // IndexedDB remains the primary durable save when the browser gives us time to finish.
    await db.saves.put({
      id: SAVE_KEY_LOCAL,
      saveData: jsonState,
      timestamp,
    })
  },

  async load(): Promise<{data: object | null, source: SaveSource}> {
    const candidates: Array<{ save: StoredSave, source: Exclude<SaveSource, 'none'> }> = []

    const emergencyData = loadEmergencySnapshot()
    if (emergencyData) {
      candidates.push({ save: emergencyData, source: 'localStorage' })
    }

    try {
      const indexedDbData = await db.saves.get(SAVE_KEY_LOCAL)
      if (indexedDbData) {
        candidates.push({
          save: {
            saveData: indexedDbData.saveData,
            timestamp: indexedDbData.timestamp,
          },
          source: 'indexeddb',
        })
      }
    } catch (error) {
      console.warn('Failed to load IndexedDB save. Falling back to emergency snapshot.', error)
    }

    const newestValid = candidates
      .sort((a, b) => b.save.timestamp - a.save.timestamp)
      .map(candidate => parseSave(candidate.save, candidate.source))
      .find(candidate => candidate !== null)

    if (newestValid) {
      console.log(`Save found in ${newestValid.source}!`)
      return { data: newestValid.data, source: newestValid.source }
    }

    console.log('No save data found.')
    return { data: null, source: 'none' }
  },

  async wipeData() {
    clearEmergencySnapshot()
    await db.saves.clear()
    console.log('Local data wiped!')
  },
}
