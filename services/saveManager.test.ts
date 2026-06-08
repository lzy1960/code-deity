import { beforeEach, describe, expect, it, vi } from 'vitest'
import { saveManager } from './saveManager'

const mockSaves = vi.hoisted(() => {
  const records = new Map<string | number, { id: string | number, saveData: string, timestamp: number }>()
  return {
    records,
    put: vi.fn(async (record: { id: string | number, saveData: string, timestamp: number }) => {
      records.set(record.id, record)
    }),
    get: vi.fn(async (id: string | number) => records.get(id)),
    clear: vi.fn(async () => {
      records.clear()
    }),
  }
})

vi.mock('~/utils/db', () => ({
  db: {
    saves: mockSaves,
  },
}))

const indexedDbKey = 'local_save'
const emergencyKey = 'code_deity_emergency_save'

describe('saveManager', () => {
  beforeEach(() => {
    mockSaves.records.clear()
    mockSaves.put.mockClear()
    mockSaves.get.mockClear()
    mockSaves.clear.mockClear()
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('writes a refresh-safe localStorage snapshot before the IndexedDB save resolves', async () => {
    let resolvePut: (() => void) | null = null
    mockSaves.put.mockImplementationOnce(async (record) => {
      await new Promise<void>(resolve => {
        resolvePut = () => {
          mockSaves.records.set(record.id, record)
          resolve()
        }
      })
    })

    vi.spyOn(Date, 'now').mockReturnValue(1234)
    const savePromise = saveManager.save({ currency: '42' })

    const emergencySnapshot = JSON.parse(localStorage.getItem(emergencyKey) ?? '{}')
    expect(emergencySnapshot.timestamp).toBe(1234)
    expect(JSON.parse(emergencySnapshot.saveData)).toEqual({ currency: '42' })
    expect(mockSaves.records.has(indexedDbKey)).toBe(false)

    resolvePut?.()
    await savePromise
    expect(mockSaves.records.has(indexedDbKey)).toBe(true)
  })

  it('loads the newest valid save between IndexedDB and localStorage', async () => {
    mockSaves.records.set(indexedDbKey, {
      id: indexedDbKey,
      saveData: JSON.stringify({ currency: 'old' }),
      timestamp: 100,
    })
    localStorage.setItem(emergencyKey, JSON.stringify({
      saveData: JSON.stringify({ currency: 'new' }),
      timestamp: 200,
    }))

    const result = await saveManager.load()

    expect(result.source).toBe('localStorage')
    expect(result.data).toEqual({ currency: 'new' })
  })

  it('clears both IndexedDB and the refresh-safe snapshot', async () => {
    mockSaves.records.set(indexedDbKey, {
      id: indexedDbKey,
      saveData: JSON.stringify({ currency: 'old' }),
      timestamp: 100,
    })
    localStorage.setItem(emergencyKey, JSON.stringify({
      saveData: JSON.stringify({ currency: 'new' }),
      timestamp: 200,
    }))

    await saveManager.wipeData()

    expect(mockSaves.records.size).toBe(0)
    expect(localStorage.getItem(emergencyKey)).toBeNull()
  })
})
