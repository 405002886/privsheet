/**
 * 日期格式统一
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndex?: number, targetFormat?: string }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function normalizeDates(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = options.colIndex ?? -1
  const targetFormat = options.targetFormat || 'YYYY-MM-DD'

  let affectedCount = 0

  // 解析各种日期格式
  const parseDate = (str) => {
    if (!str) return null

    const s = String(str).trim()

    // 支持的格式及其正则
    const patterns = [
      { regex: /^(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})[日]?$/, order: [1, 2, 3] }, // 2024-01-15 或 2024/01/15 或 2024年1月15日
      { regex: /^(\d{1,2})[-/月](\d{1,2})[日]?[-,/](\d{4})$/, order: [3, 1, 2] }, // 15/01/2024 或 15-01-2024
      { regex: /^(\d{4})(\d{2})(\d{2})$/, order: [1, 2, 3] }, // 20240115
      { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/, order: [3, 1, 2] }, // 1/15/24 或 1/15/2024
    ]

    for (const p of patterns) {
      const match = s.match(p.regex)
      if (match) {
        const year = parseInt(match[p.order[0]])
        const month = parseInt(match[p.order[1]])
        const day = parseInt(match[p.order[2]])

        // 验证有效性
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          // 两位年份转换：0-30 -> 20XX, 31-99 -> 19XX
          return { year: year < 100 ? (year <= 30 ? 2000 + year : 1900 + year) : year, month, day }
        }
      }
    }
    return null
  }

  // 格式化日期
  const formatDate = (year, month, day) => {
    const y = String(year)
    const m = String(month).padStart(2, '0')
    const d = String(day).padStart(2, '0')

    return targetFormat
      .replace('YYYY', y)
      .replace('YY', y.slice(-2))
      .replace('MM', m)
      .replace('DD', d)
  }

  const result = data.map((row, rowIndex) => {
    if (!row) return []
    return row.map((cell, cellIndex) => {
      if (rowIndex > 0 && (colIndex === -1 || colIndex === cellIndex)) {
        const dateInfo = parseDate(cell)
        if (dateInfo) {
          affectedCount++
          return formatDate(dateInfo.year, dateInfo.month, dateInfo.day)
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
