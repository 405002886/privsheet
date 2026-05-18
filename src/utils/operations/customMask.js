/**
 * 自定义脱敏 - 支持正则脱敏和快速脱敏
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项
 * @param {number} options.colIndex - 列索引，-1表示所有列
 * @param {string} options.maskType - 脱敏类型：'regex' | 'quick'
 * @param {string} options.regexPattern - 正则脱敏时的正则表达式
 * @param {string} options.replaceWith - 替换字符
 * @param {string} options.quickMode - 快速脱敏模式：'keep-2-sides' | 'skip-one' | 'keep-first-half' | 'keep-last-half'
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function customMask(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = options.colIndex ?? -1
  const maskType = options.maskType || 'quick'
  const quickMode = options.quickMode || 'keep-2-sides'

  let affectedCount = 0

  /**
   * 快速脱敏函数
   * @param {string} cell - 原始字符串
   * @param {string} mode - 快速脱敏模式
   * @returns {string} 脱敏后的字符串
   */
  const applyQuickMask = (cell, mode) => {
    const len = cell.length

    switch (mode) {
      case 'keep-2-sides':
        // 前后保留2位不隐藏: abcdefgh -> ab******gh
        if (len <= 4) return '*'.repeat(len)
        return cell.substring(0, 2) + '*'.repeat(len - 4) + cell.substring(len - 2)

      case 'skip-one':
        // 隔一个字符隐藏: abcdefgh -> a*c*e*g* (只保留原字符)
        let result = ''
        for (let i = 0; i < len; i++) {
          if (i % 2 === 0) {
            result += cell[i]
          } else {
            result += '*'
          }
        }
        return result

      case 'keep-first-half':
        // 前半部分隐藏: abcdefgh -> ****efgh (保留后一半)
        const firstHalf = Math.ceil(len / 2)
        const secondHalf = len - firstHalf
        return '*'.repeat(firstHalf) + cell.substring(firstHalf)

      case 'keep-last-half':
        // 后半部分隐藏: abcdefgh -> abcd**** (保留前一半)
        const keepHalf = Math.floor(len / 2)
        return cell.substring(0, keepHalf) + '*'.repeat(len - keepHalf)

      default:
        return '*'.repeat(len)
    }
  }

  /**
   * 正则脱敏函数
   * @param {string} cell - 原始字符串
   * @param {string} pattern - 正则表达式
   * @param {string} replaceWith - 替换字符
   * @returns {string} 脱敏后的字符串
   */
  const applyRegexMask = (cell, pattern, replaceWith) => {
    try {
      const regex = new RegExp(pattern, 'g')
      return cell.replace(regex, replaceWith)
    } catch (e) {
      return cell
    }
  }

  const result = data.map((row, rowIndex) => {
    if (!row) return []
    return row.map((cell, cellIndex) => {
      if (rowIndex > 0 && (colIndex === -1 || colIndex === cellIndex) && typeof cell === 'string') {
        let newValue = cell

        if (maskType === 'regex') {
          const pattern = options.regexPattern || ''
          const replaceWith = options.replaceWith || '***'
          if (pattern) {
            newValue = applyRegexMask(cell, pattern, replaceWith)
            if (newValue !== cell) affectedCount++
          }
        } else {
          // 快速脱敏
          newValue = applyQuickMask(cell, quickMode)
          if (newValue !== cell) affectedCount++
        }
        return newValue
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
