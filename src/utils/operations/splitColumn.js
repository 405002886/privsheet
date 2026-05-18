/**
 * 按分隔符拆分列
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndex: number, delimiter: string, newHeaders?: string[] }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function splitColumn(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = options.colIndex ?? 0
  const delimiter = options.delimiter || ','
  const newHeaders = options.newHeaders || []

  if (typeof delimiter !== 'string' || delimiter.length === 0) {
    return { success: false, data, info: { error: ErrorCodes.INVALID_DELIMITER } }
  }

  const header = data[0]
  const rows = data.slice(1)

  // 检查最大分割次数
  let maxParts = 1
  for (const row of rows) {
    if (row && row[colIndex]) {
      const parts = String(row[colIndex]).split(delimiter).length
      if (parts > maxParts) maxParts = parts
    }
  }

  // 生成新的表头
  for (let i = newHeaders.length; i < maxParts; i++) {
    newHeaders.push(`${header[colIndex] || '列'}_${i + 1}`)
  }

  // 构建新表头（插入拆分列的位置）
  const finalHeaders = [
    ...header.slice(0, colIndex),
    ...newHeaders,
    ...header.slice(colIndex + 1)
  ]

  // 处理每一行
  const result = [finalHeaders]
  for (const row of rows) {
    if (!row) {
      result.push(new Array(finalHeaders.length).fill(null))
      continue
    }
    const cellValue = row[colIndex] != null ? String(row[colIndex]) : ''
    const parts = cellValue.split(delimiter)
    // 补齐或截断到 maxParts
    while (parts.length < maxParts) parts.push('')

    const newRow = [
      ...row.slice(0, colIndex),
      ...parts.slice(0, maxParts),
      ...row.slice(colIndex + 1)
    ]
    result.push(newRow)
  }

  return {
    success: true,
    data: result,
    info: { splitCount: rows.length, newColumnCount: maxParts }
  }
}
