/**
 * 全角半角转换
 * 支持多列选择
 *
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项
 * @param {number[]} options.colIndices - 目标列索引数组，空数组表示全部列
 * @param {string} options.type - 转换类型，'toHalfWidth' 或 'toFullWidth'
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function convertWidth(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndices = options.colIndices || []
  const type = options.type || 'toHalfWidth'
  const isAllColumns = colIndices.length === 0
  let affectedCount = 0

  // 全角转半角
  const toHalfWidth = (str) => {
    return str.replace(/[！-～]/g, (char) => {
      const code = char.charCodeAt(0) - 0xfee0
      return String.fromCharCode(code)
    }).replace(/　/g, ' ') // 全角空格转半角
  }

  // 半角转全角
  const toFullWidth = (str) => {
    return str.replace(/[\x20-\x7e]/g, (char) => {
      const code = char.charCodeAt(0)
      return String.fromCharCode(code + 0xfee0)
    }).replace(/ /g, '　') // 半角空格转全角
  }

  const converter = type === 'toFullWidth' ? toFullWidth : toHalfWidth

  const result = data.map((row, rowIndex) => {
    if (!row) return []
    return row.map((cell, cellIndex) => {
      if (typeof cell === 'string') {
        if (rowIndex !== 0 && (isAllColumns || colIndices.includes(cellIndex))) {
          const converted = converter(cell)
          if (converted !== cell) affectedCount++
          return converted
        }
      }
      return cell
    })
  })

  return {
    success: true,
    data: result,
    info: { convertedCount: affectedCount }
  }
}
