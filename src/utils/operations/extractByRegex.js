/**
 * 正则提取
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndex?: number, pattern?: string, separator?: string }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function extractByRegex(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = options.colIndex ?? -1
  const pattern = options.pattern || ''
  const separator = options.separator ?? ','
  const matchAll = true

  let regex
  try {
    regex = new RegExp(pattern, matchAll ? 'g' : '')
  } catch (e) {
    return { success: false, data: [], info: { error: ErrorCodes.REGEX_INVALID } }
  }

  const header = data[0]
  const rows = data.slice(1)

  // 收集所有匹配结果
  const allMatches = []
  for (const row of rows) {
    if (!row) continue
    const cell = row[colIndex]
    if (typeof cell === 'string') {
      const matches = cell.match(regex)
      if (matches) {
        allMatches.push(...matches)
      }
    }
  }

  // 用分隔符合并所有匹配为一个大字符串
  const result = [
    [header[colIndex] ? `${header[colIndex]}_提取` : '提取结果'],
    [allMatches.join(separator)]
  ]

  return {
    success: true,
    data: result,
    info: { extractedCount: allMatches.length }
  }
}
