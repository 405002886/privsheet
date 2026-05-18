/**
 * 批量数学运算
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndex?: number, operator?: string, value?: number }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function batchMathOperation(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = options.colIndex ?? 0
  const operator = options.operator || '+'
  const value = options.value ?? 0
  let affectedCount = 0

  const calculate = (num1, op, num2) => {
    switch (op) {
      case '+': return num1 + num2
      case '-': return num1 - num2
      case '*': return num1 * num2
      case '/': return num2 !== 0 ? num1 / num2 : null
      case 'pow': return Math.pow(num1, num2)
      case '%': return num2 !== 0 ? num1 % num2 : null
      default: return null
    }
  }

  const result = data.map((row, rowIndex) => {
    if (!row) return []
    return row.map((cell, cellIndex) => {
      if (rowIndex > 0 && cellIndex === colIndex) {
        const num = Number(cell)
        if (!isNaN(num)) {
          const newValue = calculate(num, operator, value)
          if (newValue !== null) {
            affectedCount++
            return Math.round(newValue * 1000000) / 1000000
          }
        }
      }
      return cell
    })
  })

  return {
    success: true,
    data: result,
    info: { affectedCount }
  }
}
