import { db } from '~/utils/db'
import type { GameState } from '~/store/game'
import type { User, SupabaseClient } from '@supabase/supabase-js'

const SAVE_KEY_LOCAL = 'local_save'

/**
 * The Save Manager is only responsible for storing and retrieving raw JSON objects.
 * The logic for serialization and deserialization now lives within the game store itself.
 */
export const saveManager = {
  async save(state: object, user: User | null, supabase: SupabaseClient, options: { cloud: boolean } = { cloud: true }) {
    const jsonState = JSON.stringify(state)

    // Always save to local storage as a backup or main save
    await db.saves.put({
      id: SAVE_KEY_LOCAL,
      saveData: jsonState,
      timestamp: Date.now(),
    })

    // Cloud save is optional
    if (user && options.cloud) {
      const { error } = await supabase
        .from('saves')
        .upsert({ user_id: user.id, save_data: state, updated_at: new Date().toISOString() })

      if (error) {
        console.error('Cloud save failed:', error)
      } else {
        console.log('Game saved to cloud!')
      }
    }
  },

  async load(user: User | null, supabase: SupabaseClient): Promise<{data: object | null, source: 'local' | 'cloud' | 'none'}> {
    // 1. Prioritize local save
    const localData = await db.saves.get(SAVE_KEY_LOCAL)
    if (localData) {
      console.log('Local save found!')
      return { data: JSON.parse(localData.saveData), source: 'local' }
    }

    // 2. If no local save, try cloud save
    if (user) {
      console.log('No local save, trying cloud save...')
      const { data, error } = await supabase
        .from('saves')
        .select('save_data')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Cloud load failed:', error)
      }

      if (data) {
        console.log('Cloud save found!')
        return { data: data.save_data, source: 'cloud' }
      }
    }

    // 3. If nothing found
    console.log('No save data found anywhere.')
    return { data: null, source: 'none' }
  },

  async wipeData(user: User | null, supabase: SupabaseClient) {
    await db.saves.clear()
    console.log('Local data wiped!')

    if (user) {
      await supabase.from('saves').delete().eq('user_id', user.id)
      console.log('Cloud data wiped!')
    }
  },
}
