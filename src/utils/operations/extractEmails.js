/**
 * 提取邮箱
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndex?: number, separator?: string }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function extractEmails(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = options.colIndex ?? -1
  const separator = options.separator ?? ','
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

  const header = data[0]
  const rows = data.slice(1)

  // 收集所有提取到的邮箱
  const allEmails = []
  for (const row of rows) {
    if (!row) continue
    const cell = row[colIndex]
    if (typeof cell === 'string') {
      const emails = cell.match(emailRegex) || []
      allEmails.push(...emails)
    }
  }

  // 用分隔符合并所有邮箱为一个大字符串
  const result = [
    [header[colIndex] ? `${header[colIndex]}_邮箱` : '邮箱'],
    [allEmails.join(separator)]
  ]

  return {
    success: true,
    data: result,
    info: { extractedCount: allEmails.length }
  }
}
