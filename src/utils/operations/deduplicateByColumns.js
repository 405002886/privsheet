/**
 * 基于关键列去重
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndices: number[], keepStrategy?: 'first' | 'last' }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function deduplicateByColumns(data, options = {}) {
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

  const colIndices = options.colIndices || []
  const keepStrategy = options.keepStrategy || 'first'

  if (!colIndices || colIndices.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.SELECT_AT_LEAST_ONE_COLUMN } }
  }

  const header = data[0]
  const rows = data.slice(1)

  const seen = new Map()
  const result = [header]

  if (keepStrategy === 'last') {
    for (let i = rows.length - 1; i >= 0; i--) {
      const key = JSON.stringify(colIndices.map(col => rows[i][col]))
      if (!seen.has(key)) {
        seen.set(key, rows[i])
      }
    }
    result.push(...[...seen.values()].reverse())
  } else {
    for (const row of rows) {
      const key = JSON.stringify(colIndices.map(col => row[col]))
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
