/**
 * 分组汇总
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { groupCol?: number, aggCol?: number, aggType?: 'sum' | 'count' | 'average' | 'max' | 'min' }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function groupByAndSummarize(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const groupCol = options.groupCol ?? 0
  const aggCol = options.aggCol ?? null
  const aggType = options.aggType ?? 'count'

  const header = data[0]
  const rows = data.slice(1)

  // 按分组列聚合
  const groups = new Map()

  for (const row of rows) {
    if (!row) continue
    const key = row[groupCol] != null ? String(row[groupCol]) : '(空)'
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key).push(row)
  }

  // 计算汇总值
  const aggregate = (rows, col, type) => {
    if (type === 'count') return rows.length

    const values = rows
      .map(r => r[col])
      .filter(v => v != null && !isNaN(Number(v)))
      .map(v => Number(v))

    if (values.length === 0) return 0

    switch (type) {
      case 'sum': return values.reduce((a, b) => a + b, 0)
      case 'average': return values.reduce((a, b) => a + b, 0) / values.length
      case 'max': return Math.max(...values)
      case 'min': return Math.min(...values)
      default: return rows.length
    }
  }

  // 构建结果表头 - 使用新数组避免修改原数据
  const newHeader = header ? [...header] : []
  if (aggCol !== null) {
    newHeader[groupCol] = newHeader[groupCol] || '分组'
    newHeader[aggCol] = `${newHeader[aggCol]}_${aggType}`
  }

  // 构建结果数据
  const result = [newHeader]
  for (const [key, groupRows] of groups) {
    const newRow = [...(groupRows[0] || [])]
    if (aggCol !== null) {
      const aggValue = aggregate(groupRows, aggCol, aggType)
      newRow[aggCol] = Math.round(aggValue * 100) / 100
    }
    result.push(newRow)
  }

  return {
    success: true,
    data: result,
    info: { groupCount: groups.size }
  }
}
