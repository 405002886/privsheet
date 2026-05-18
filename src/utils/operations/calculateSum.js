/**
 * 求和统计
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndex?: number }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function calculateSum(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = options.colIndex ?? 0
  const rows = data.slice(1)
  const header = data[0] || []
  const colName = header[colIndex] || `列${colIndex + 1}`
  let sum = 0
  let count = 0

  for (const row of rows) {
    if (row && row[colIndex] != null) {
      const num = Number(row[colIndex])
      if (!isNaN(num)) {
        sum += num
        count++
      }
    }
  }

  // 返回单行单列的统计结果表
  const result = [
    [colName, '求和'],
    [Math.round(sum * 100) / 100, count]
  ]

  return {
    success: true,
    data: result,
    info: { sum: Math.round(sum * 100) / 100, count }
  }
}
