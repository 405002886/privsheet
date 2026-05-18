/**
 * 按列拆分数据为多个Sheet
 * 根据指定列的不同值，将数据分组为多个二维数组
 * @param {Array[]} data - 二维数组数据（首行为表头）
 * @param {Object} options - 选项 { colIndex: number }
 * @returns {{ success: boolean, data: { sheets: Array<{ name: string, data: Array[] }> }, info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function splitToSheets(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: { sheets: [] }, info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = options.colIndex ?? 0

  // 验证列索引
  const header = data[0]
  if (colIndex < 0 || colIndex >= header.length) {
    return { success: false, data: { sheets: [] }, info: { error: ErrorCodes.COLUMN_INDEX_INVALID } }
  }

  const rows = data.slice(1)

  // 按指定列的值分组
  const groups = new Map()
  for (const row of rows) {
    if (!row) continue
    const key = row[colIndex] != null ? String(row[colIndex]).trim() : '(空值)'
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key).push(row)
  }

  // 构建每个分组的完整数据（含表头）
  // Sheet名称需清理Excel不允许的字符 * ? : \ / [ ]
  const sheets = []
  for (const [name, groupRows] of groups) {
    const safeName = name.replace(/[*?:\\\/\[\]]/g, '_')
    sheets.push({
      name: safeName,
      data: [header, ...groupRows]
    })
  }

  return {
    success: true,
    data: { sheets },
    info: {
      sheetNames: sheets.map(s => s.name),
      sheetCount: sheets.length,
      totalRows: rows.length
    }
  }
}