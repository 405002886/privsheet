/**
 * 整行去重
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { keepStrategy: 'first' | 'last' }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function deduplicateRows(data, options = {}) {
  // 数据验证
  if (!data || !Array.isArray(data)) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA_NOT_ARRAY } }
  }
  if (data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA_EMPTY } }
  }

  // 检查是否是二维数组（第一行应该是数组）
  if (!Array.isArray(data[0])) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA_NOT_FIRST_ROW_ARRAY } }
  }

  if (data.length === 1) {
    return { success: true, data: data, info: { removedCount: 0 } }
  }

  const { keepStrategy = 'first' } = options
  const header = data[0]
  const rows = data.slice(1)

  const seen = new Map()
  const result = [header]

  if (keepStrategy === 'last') {
    // 从后向前遍历，保留最后一次出现
    for (let i = rows.length - 1; i >= 0; i--) {
      const key = JSON.stringify(rows[i])
      if (!seen.has(key)) {
        seen.set(key, rows[i])
      }
    }
    // 反转恢复顺序
    result.push(...[...seen.values()].reverse())
  } else {
    // 默认保留首次出现
    for (const row of rows) {
      const key = JSON.stringify(row)
      if (!seen.has(key)) {
        seen.set(key, row)
        result.push(row)
      }
    }
  }

  return {
    success: true,
    data: result,
    info: { removedCount: rows.length - (result.length - 1) }
  }
}
