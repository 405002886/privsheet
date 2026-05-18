/**
 * 特殊字符清理
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndices?: number[], removeChars?: string }
 *   - colIndices: 要处理的列索引数组，默认处理所有列
 *   - removeChars: 要移除的特殊字符（如 "@#$%"）
 *   - 不提供 removeChars 时，移除所有特殊字符，仅保留字母、数字和中文
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function removeSpecialChars(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndices = options.colIndices || []
  const removeChars = options.removeChars || ''

  let removePattern
  if (removeChars) {
    // 用户指定了要移除的字符：只移除这些字符
    // 转义特殊字符后构造正则
    const escapedChars = removeChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    removePattern = new RegExp(`[${escapedChars}]+`, 'g')
  } else {
    // 用户没有指定：移除所有特殊字符，仅保留字母、数字和中文
    removePattern = /[^a-zA-Z0-9一-龥]+/g
  }

  let affectedCount = 0

  const result = data.map((row, rowIndex) => {
    if (!row) return []
    return row.map((cell, cellIndex) => {
      if (typeof cell === 'string') {
        // 如果没有指定列索引（空数组），处理所有列；否则只处理指定的列
        // 表头行始终被处理
        const shouldProcess = rowIndex === 0 || colIndices.length === 0 || colIndices.includes(cellIndex)
        if (shouldProcess) {
          const cleaned = cell.replace(removePattern, '')
          if (cleaned !== cell) affectedCount++
          return cleaned
        }
      }
      return cell
    })
  })

  return {
    success: true,
    data: result,
    info: { cleanedCount: affectedCount }
  }
}
