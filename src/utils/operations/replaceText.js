/**
 * 文本替换
 * 支持多列选择和全部列处理
 *
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项
 * @param {number[]} options.colIndices - 目标列索引数组，空数组表示全部列
 * @param {string} options.search - 搜索内容
 * @param {string} options.replace - 替换内容
 * @param {boolean} options.useRegex - 是否使用正则表达式
 * @param {boolean} options.caseSensitive - 是否大小写敏感
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function replaceText(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndices = options.colIndices || []
  const search = options.search || ''
  const replace = options.replace || ''
  const useRegex = options.useRegex || false
  const caseSensitive = options.caseSensitive !== false

  if (!search) {
    return { success: false, data, info: { error: ErrorCodes.SEARCH_TEXT_REQUIRED } }
  }

  // 判断是否处理所有列（空数组表示全部列）
  const isAllColumns = colIndices.length === 0

  let affectedCount = 0

  const result = data.map((row, rowIndex) => {
    if (!row) return []
    return row.map((cell, cellIndex) => {
      if (typeof cell === 'string') {
        // 判断当前列是否需要处理：
        // 1. 不是表头行 (rowIndex !== 0)
        // 2. 且（是全部列 或 当前列在选中列表中）
        if (rowIndex !== 0 && (isAllColumns || colIndices.includes(cellIndex))) {
          let newValue
          if (useRegex) {
            try {
              const flags = caseSensitive ? 'g' : 'gi'
              const regex = new RegExp(search, flags)
              newValue = cell.replace(regex, replace)
            } catch (e) {
              return cell
            }
          } else {
            if (caseSensitive) {
              newValue = cell.split(search).join(replace)
            } else {
              const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
              newValue = cell.replace(regex, replace)
            }
          }
          if (newValue !== cell) affectedCount++
          return newValue
        }
      }
      return cell
    })
  })

  return {
    success: true,
    data: result,
    info: { replacedCount: affectedCount }
  }
}
