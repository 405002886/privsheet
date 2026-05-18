/**
 * 按固定宽度拆分列
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndex: number, widths: number[], newHeaders?: string[] }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function splitColumnByWidth(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = options.colIndex ?? 0
  const widths = options.widths || []

  if (!widths || widths.length === 0) {
    return { success: false, data, info: { error: ErrorCodes.INVALID_WIDTHS } }
  }

  const header = data[0]
  const rows = data.slice(1)

  // 生成新的表头
  const newHeaders = options.newHeaders || []
  for (let i = newHeaders.length; i < widths.length; i++) {
    newHeaders.push(`${header[colIndex] || '列'}_${i + 1}`)
  }

  // 构建新表头
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
    const parts = []
    let currentPos = 0
    for (const width of widths) {
      parts.push(cellValue.substring(currentPos, currentPos + width))
      currentPos += width
    }

    const newRow = [
      ...row.slice(0, colIndex),
      ...parts,
      ...row.slice(colIndex + 1)
    ]
    result.push(newRow)
  }

  return {
    success: true,
    data: result,
    info: { splitCount: rows.length, newColumnCount: widths.length }
  }
}
