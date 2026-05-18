/**
 * 最大值统计
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndex?: number }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function calculateMax(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = options.colIndex ?? 0
  const rows = data.slice(1)
  const header = data[0] || []
  const colName = header[colIndex] || `列${colIndex + 1}`
  let max = null
  let maxRow = null

  for (const row of rows) {
    if (row && row[colIndex] != null) {
      const num = Number(row[colIndex])
      if (!isNaN(num)) {
        if (max === null || num > max) {
          max = num
          maxRow = row
        }
      }
    }
  }

  // 返回单行单列的统计结果表
  const result = [
    [colName, '最大值'],
    [max, maxRow ? 1 : 0]
  ]

  return {
    success: true,
    data: result,
    info: { max, associatedRow: maxRow ? maxRow.slice(0, 5) : null }
  }
}
