/**
 * 提取手机号
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndex?: number, separator?: string }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function extractPhones(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = options.colIndex ?? -1
  const separator = options.separator ?? ','
  // 匹配中国大陆手机号（11位）
  const phoneRegex = /1[3-9]\d{9}/g

  const header = data[0]
  const rows = data.slice(1)

  // 收集所有提取到的手机号
  const allPhones = []
  for (const row of rows) {
    if (!row) continue
    const cell = row[colIndex]
    if (typeof cell === 'string') {
      const phones = cell.match(phoneRegex) || []
      allPhones.push(...phones)
    }
  }

  // 用分隔符合并所有手机号为一个大字符串
  const result = [
    [header[colIndex] ? `${header[colIndex]}_手机` : '手机号'],
    [allPhones.join(separator)]
  ]

  return {
    success: true,
    data: result,
    info: { extractedCount: allPhones.length }
  }
}
