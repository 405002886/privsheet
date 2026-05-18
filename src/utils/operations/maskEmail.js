/**
 * 邮箱脱敏
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndex: number, maskType: 'partial' | 'full' }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function maskEmail(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = options.colIndex ?? -1
  const maskType = options.maskType || 'partial'

  // 邮箱正则：匹配单元格中任意位置的邮箱地址（不带锚点）
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g

  /**
   * 脱敏单个邮箱
   * @param {string} email - 邮箱地址
   * @returns {string} 脱敏后的邮箱
   */
  function maskEmailAddress(email) {
    if (maskType === 'full') {
      return '***@***.***'
    }
    // 部分脱敏: user@example.com -> u***@example.com
    const atIndex = email.indexOf('@')
    if (atIndex <= 1) {
      return `***@${email.slice(atIndex + 1)}`
    }
    const local = email.slice(0, atIndex)
    const domain = email.slice(atIndex + 1)
    if (local.length <= 2) {
      return `${local[0]}***@${domain}`
    }
    return `${local[0]}***${local[local.length - 1]}@${domain}`
  }

  const result = data.map((row, rowIndex) => {
    if (!row) return []
    return row.map((cell, cellIndex) => {
      // 跳过表头行(rowIndex === 0)，只处理数据行
      // colIndex === -1 表示处理所有列，否则只处理指定列
      if (rowIndex > 0 && (colIndex === -1 || colIndex === cellIndex) && typeof cell === 'string') {
        // 先去除首尾空格
        const trimmedCell = cell.trim()
        if (!trimmedCell) return cell

        // 使用全局正则查找所有邮箱并脱敏
        const matches = trimmedCell.match(emailRegex)
        if (!matches || matches.length === 0) {
          return cell
        }

        // 对每个邮箱进行脱敏替换
        let maskedCell = trimmedCell
        matches.forEach(email => {
          const maskedEmail = maskEmailAddress(email)
          maskedCell = maskedCell.replace(email, maskedEmail)
        })
        return maskedCell
      }
      return cell
    })
  })

  // 统计脱敏的邮箱数量（非单元格数量，因为一个单元格可能有多个邮箱）
  let affectedCount = 0
  data.forEach((row, rowIndex) => {
    if (!row || rowIndex === 0) return
    row.forEach((cell, cellIndex) => {
      if ((colIndex === -1 || colIndex === cellIndex) && typeof cell === 'string') {
        const matches = cell.trim().match(emailRegex)
        if (matches) {
          affectedCount += matches.length
        }
      }
    })
  })

  return {
    success: true,
    data: result,
    info: { maskedCount: affectedCount }
  }
}
