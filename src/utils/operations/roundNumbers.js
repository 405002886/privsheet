/**
 * 数字修约
 * 支持多列选择
 *
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项
 * @param {number[]} options.colIndices - 目标列索引数组，空数组表示全部列
 * @param {number} options.decimals - 小数位数
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function roundNumbers(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndices = options.colIndices || []
  const decimals = options.decimals ?? 0
  const isAllColumns = colIndices.length === 0

  let affectedCount = 0

  const result = data.map((row, rowIndex) => {
    if (!row) return []
    return row.map((cell, cellIndex) => {
      if (rowIndex !== 0 && (isAllColumns || colIndices.includes(cellIndex))) {
        const num = Number(cell)
        if (!isNaN(num) && cell !== '' && cell !== null) {
          affectedCount++
          return Number(num.toFixed(decimals))
        }
      }
      return cell
    })
  })

  return {
    success: true,
    data: result,
    info: { roundedCount: affectedCount }
  }
}
