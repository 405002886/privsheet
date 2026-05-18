/**
 * 字母映射替换
 * 根据用户定义的字母映射表对文本进行单字符替换
 * 支持大小写自动处理
 *
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项
 * @param {number[]} options.colIndices - 目标列索引数组，空数组表示全部列
 * @param {string} options.mapping - 映射字符串，格式如 "A→X,B→Y,C→Z" 或 "A:X,B:Y,C:Z"
 * @param {boolean} options.caseSensitive - 是否大小写敏感，默认 false（不敏感）
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function letterMappingReplace(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndices = options.colIndices || []
  const mappingStr = options.mapping || ''

  if (!mappingStr) {
    return { success: false, data: [], info: { error: ErrorCodes.LETTER_MAPPING_EMPTY } }
  }

  // 解析映射字符串，支持 "A→X,B→Y" 或 "A:X,B:Y" 两种格式
  const mapping = {}
  const entries = mappingStr.split(',')
  for (const entry of entries) {
    const parts = entry.split(/[→:]/)
    if (parts.length === 2) {
      const key = parts[0].trim()
      const value = parts[1].trim()
      if (key && value) {
        // 映射原始字符
        mapping[key] = value
        // 自动添加大小写变体映射，方便用户使用
        const upperKey = key.toUpperCase()
        const lowerKey = key.toLowerCase()
        const upperVal = value.toUpperCase()
        const lowerVal = value.toLowerCase()
        // 添加大写形式的映射（除非用户已显式定义）
        if (!mapping.hasOwnProperty(upperKey)) {
          mapping[upperKey] = upperVal
        }
        // 添加小写形式的映射（除非用户已显式定义）
        if (!mapping.hasOwnProperty(lowerKey)) {
          mapping[lowerKey] = lowerVal
        }
      }
    }
  }

  if (Object.keys(mapping).length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.LETTER_MAPPING_INVALID } }
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
          let newValue = ''
          for (const char of cell) {
            // 查找映射表，如果找不到则保留原字符
            newValue += mapping[char] !== undefined ? mapping[char] : char
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
