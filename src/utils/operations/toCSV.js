/**
 * Excel转CSV
 * @param {Array[]} data - 二维数组数据
 * @param {Object|string} options - 选项对象或分隔符
 * @returns {{ success: boolean, data: string, info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function toCSV(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  // 处理参数：支持 registry 传递的 { delimiter } 对象，也支持直接的 delimiter 字符串
  let delimiter = ','
  let withHeader = true
  let quote = true

  if (typeof options === 'string') {
    delimiter = options
  } else if (options && typeof options === 'object') {
    delimiter = options.delimiter || ','
    withHeader = options.withHeader !== false
    quote = options.quote !== false
  }

  const header = data[0] || []
  const rows = withHeader ? data.slice(1) : data

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return ''
    const str = String(val)
    if (quote && (str.includes(delimiter) || str.includes('"') || str.includes('\n'))) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const csvLines = []

  if (withHeader) {
    csvLines.push(header.map(escapeCSV).join(delimiter))
  }

  for (const row of rows) {
    if (!row) continue
    csvLines.push(row.map(escapeCSV).join(delimiter))
  }

  return {
    success: true,
    data: csvLines.join('\n'),
    info: { rowCount: rows.length, hasHeader: withHeader }
  }
}
