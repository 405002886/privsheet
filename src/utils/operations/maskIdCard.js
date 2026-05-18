/**
 * 身份证脱敏 - 支持多国身份证格式
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndex: number, maskType: 'partial' | 'full' }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { idCardPatterns } from '@/config/idCardCountries'
import { ErrorCodes } from '@/config/errorCodes'

export function maskIdCard(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = options.colIndex ?? -1
  const maskType = options.maskType || 'partial'
  let affectedCount = 0
  let formatDetected = null

  // 识别身份证格式
  const identifyIdCard = (cell) => {
    const trimmed = cell.trim()
    for (const format of idCardPatterns) {
      if (format.pattern.test(trimmed)) {
        return format
      }
    }
    return null
  }

  const result = data.map((row, rowIndex) => {
    if (!row) return []
    return row.map((cell, cellIndex) => {
      if (rowIndex > 0 && (colIndex === -1 || colIndex === cellIndex) && typeof cell === 'string') {
        const idFormat = identifyIdCard(cell)
        if (idFormat) {
          affectedCount++
          formatDetected = idFormat.nameKey
          return idFormat.mask(cell, maskType)
        }
      }
      return cell
    })
  })

  return {
    success: true,
    data: result,
    info: {
      maskedCount: affectedCount,
      detectedFormats: formatDetected ? [formatDetected] : []
    }
  }
}
