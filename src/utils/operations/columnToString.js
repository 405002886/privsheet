/**
 * 列数据转字符串
 * 将选中列的所有数据用逗号分隔导出为纯文本字符串
 * 特殊数据格式（数字、日期）会自动转换为纯文本，防止导出时效果不佳
 *
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndex?: number }
 * @returns {{ success: boolean, data: string, info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function columnToString(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: '', info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = options.colIndex ?? -1

  if (colIndex < 0 || colIndex >= (data[0]?.length || 0)) {
    return { success: false, data: '', info: { error: ErrorCodes.COLUMN_INDEX_INVALID } }
  }

  const header = data[0]
  const rows = data.slice(1)

  // 收集该列所有数据并转换为纯文本
  const values = []
  for (const row of rows) {
    if (!row) continue
    let cell = row[colIndex]

    // 处理 null 和 undefined
    if (cell === null || cell === undefined) {
      values.push('')
      continue
    }

    // 如果是数字或日期等特殊类型，转换为纯文本
    // 使用 String() 转换，并处理科学计数法
    if (typeof cell === 'number') {
      // 数字：直接转为字符串，避免科学计数法问题
      // 如果数字较大，使用toString确保精度
      cell = String(cell)
    } else if (typeof cell === 'boolean') {
      cell = cell ? 'true' : 'false'
    } else if (cell instanceof Date) {
      // 日期对象：转换为ISO格式字符串
      cell = cell.toISOString()
    } else if (typeof cell === 'object') {
      // 其他对象类型（如Excel日期序列号），转为字符串
      cell = String(cell)
    }

    // 去除首尾空格
    cell = String(cell).trim()

    // 如果包含逗号、引号或换行符，需要用引号包裹
    if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
      // 转义引号，双引号变两个双引号
      cell = '"' + cell.replace(/"/g, '""') + '"'
    }

    values.push(cell)
  }

  // 用逗号分隔所有值
  const result = values.join(',')

  return {
    success: true,
    data: result,
    info: {
      columnName: header[colIndex] || `列${colIndex + 1}`,
      totalCount: values.length,
      emptyCount: values.filter(v => v === '').length
    }
  }
}
