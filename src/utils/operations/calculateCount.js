/**
 * 计数统计
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndex?: number }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function calculateCount(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = options.colIndex ?? -1
  const rows = data.slice(1)
  const header = data[0] || []
  const colName = colIndex >= 0 ? (header[colIndex] || `列${colIndex + 1}`) : '全部单元格'
  let count = 0

  if (colIndex === -1) {
    // 计数所有非空单元格
    for (const row of rows) {
      if (row) {
        for (const cell of row) {
          if (cell != null && cell !== '') {
            count++
          }
        }
      }
    }
  } else {
    // 计数指定列
    for (const row of rows) {
      if (row && row[colIndex] != null && row[colIndex] !== '') {
        count++
      }
    }
  }

  // 返回单行单列的统计结果表
  const result = [
    [colName, '计数'],
    [count, '']
  ]

  return {
    success: true,
    data: result,
    info: { count }
  }
}
