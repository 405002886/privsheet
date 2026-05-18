/**
 * 手机号脱敏
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndex: number, maskType: 'partial' | 'full' }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function maskPhone(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = options.colIndex ?? -1
  const maskType = options.maskType || 'partial'
  let affectedCount = 0

  const result = data.map((row, rowIndex) => {
    if (!row) return []
    return row.map((cell, cellIndex) => {
      if (rowIndex > 0 && (colIndex === -1 || colIndex === cellIndex) && typeof cell === 'string') {
        // 匹配手机号（中国大陆手机号，11位）
        const phoneRegex = /^1[3-9]\d{9}$/
        // 也处理带分隔符的手机号
        const cleanPhone = cell.replace(/[\s\-]/g, '')
        if (phoneRegex.test(cleanPhone)) {
          affectedCount++
          if (maskType === 'full') {
            return '***********'
          }
          // 保留前3后4位: 13812345678 -> 138****5678
          return cleanPhone.substring(0, 3) + '****' + cleanPhone.substring(7)
        }
      }
      return cell
    })
  })

  return {
    success: true,
    data: result,
    info: { maskedCount: affectedCount }
  }
}
