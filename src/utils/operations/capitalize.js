/**
 * 首字母大写
 * 支持多列选择
 *
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项
 * @param {number[]} options.colIndices - 目标列索引数组，空数组表示全部列
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function capitalize(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndices = options.colIndices || []
  const isAllColumns = colIndices.length === 0

  let affectedCount = 0

  const result = data.map((row, rowIndex) => {
    if (!row) return []
    return row.map((cell, cellIndex) => {
      if (typeof cell === 'string' && cell.length > 0) {
        if (rowIndex !== 0 && (isAllColumns || colIndices.includes(cellIndex))) {
          const capitaled = cell.charAt(0).toUpperCase() + cell.slice(1).toLowerCase()
          if (capitaled !== cell) affectedCount++
          return capitaled
        }
      }
      return cell
    })
  })

  return {
    success: true,
    data: result,
    info: { affectedCount }
  }
}
