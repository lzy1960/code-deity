import { db } from '../utils/db'
import { useGameStore, type GameState } from '~/store/game'
import Decimal from 'break_infinity.js'

// 辅助函数：将 Decimal 对象序列化为字符串
function serializeDecimal(value: any): any {
  if (value instanceof Decimal) {
    return value.toString()
  }
  if (typeof value === 'object' && value !== null) {
    for (const key in value) {
      value[key] = serializeDecimal(value[key])
    }
  }
  return value
}

// 辅助函数：将字符串反序列化为 Decimal 对象
function deserializeDecimal(value: any): any {
  if (typeof value === 'string' && !isNaN(parseFloat(value)) && !isNaN(value as any)) { // 简单的数字字符串判断
    // 检查是否是 Decimal 字符串，这里需要更严谨的判断，例如通过正则或特殊标记
    // 为了简化，这里假设所有符合数字格式的字符串都尝试转为 Decimal
    return new Decimal(value)
  }
  if (typeof value === 'object' && value !== null) {
    for (const key in value) {
      value[key] = deserializeDecimal(value[key])
    }
  }
  return value
}

export const saveManager = {
  async save(state: GameState) {
    try {
      const serializableState = JSON.parse(JSON.stringify(state), (key, value) => {
        // 在这里处理 Decimal 对象的序列化
        if (value instanceof Decimal) {
          return value.toString();
        }
        return value;
      });
      // 深度复制并处理 Decimal
      const stateToSave = JSON.parse(JSON.stringify(state)); // 创建一个深拷贝，避免直接修改 state
      const processedState = serializeDecimal(stateToSave); // 处理 Decimal 对象

      await db.saves.put({
        id: 1, // 使用固定 ID 1 来表示当前存档
        saveData: JSON.stringify(processedState),
        timestamp: Date.now()
      })
      console.log('游戏已保存！')
    } catch (error) {
      console.error('保存游戏失败:', error)
    }
  },

  async load(): Promise<GameState | null> {
    try {
      const savedData = await db.saves.get(1)
      if (savedData) {
        const parsedState = JSON.parse(savedData.saveData)
        const deserializedState = deserializeDecimal(parsedState) // 反序列化 Decimal 对象
        console.log('游戏已加载！')
        return deserializedState as GameState
      }
      console.log('未找到存档。')
      return null
    } catch (error) {
      console.error('加载游戏失败:', error)
      return null
    }
  }
}
