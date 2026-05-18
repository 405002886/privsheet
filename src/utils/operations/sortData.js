/**
 * 数据排序
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndex: number, order: 'asc' | 'desc' }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function sortData(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = Number(options.colIndex ?? 0)
  const order = options.order || 'asc'

  const header = data[0]
  const rows = data.slice(1)

  const sortedRows = [...rows].sort((a, b) => {
    const valA = a[colIndex]
    const valB = b[colIndex]

    // 处理空值
    if (valA == null && valB == null) return 0
    if (valA == null) return order === 'asc' ? 1 : -1
    if (valB == null) return order === 'asc' ? -1 : 1

    // 数字比较
    if (typeof valA === 'number' && typeof valB === 'number') {
      return order === 'asc' ? valA - valB : valB - valA
    }

    // 字符串比较
    const strA = String(valA)
    const strB = String(valB)
    return order === 'asc'
      ? strA.localeCompare(strB, 'zh-CN', { numeric: true })
      : strB.localeCompare(strA, 'zh-CN', { numeric: true })
  })

  return {
    success: true,
    data: [header, ...sortedRows],
    info: { sortedCount: sortedRows.length }
  }
}
