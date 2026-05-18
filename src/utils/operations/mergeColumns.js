/**
 * 合并多列
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndices: number[], separator: string, newHeader?: string }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function mergeColumns(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndices = options.colIndices || []
  const separator = options.separator || ''
  const newHeader = options.newHeader || ''

  if (!colIndices || colIndices.length < 2) {
    return { success: false, data, info: { error: ErrorCodes.SELECT_AT_LEAST_TWO_COLUMNS } }
  }

  const header = data[0]
  const rows = data.slice(1)

  // 生成新表头
  const mergedHeader = newHeader || colIndices.map(i => header[i] || `列${i + 1}`).join(separator)

  // 新表头数组（移除被合并的列，插入合并后的列）
  const finalHeaders = [
    ...header.slice(0, Math.min(...colIndices)),
    mergedHeader,
    ...header.slice(Math.max(...colIndices) + 1)
  ]

  // 处理每一行
  const result = [finalHeaders]
  for (const row of rows) {
    if (!row) {
      result.push(new Array(finalHeaders.length).fill(null))
      continue
    }
    const mergedValue = colIndices.map(i => {
      const cell = row[i]
      return cell != null ? String(cell) : ''
    }).join(separator)

    const firstCol = Math.min(...colIndices)
    const newRow = [
      ...row.slice(0, firstCol),
      mergedValue,
      ...row.slice(Math.max(...colIndices) + 1)
    ]
    result.push(newRow)
  }

  return {
    success: true,
    data: result,
    info: { mergedCount: rows.length }
  }
}
