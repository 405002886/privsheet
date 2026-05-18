/**
 * 去除空行
 * @param {Array[]} data - 二维数组数据
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function removeEmptyRows(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const header = data[0]
  const rows = data.slice(1)
  const filteredRows = rows.filter(row => {
    // 检查行是否为空（所有单元格都是空字符串、null、undefined）
    return row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
  })

  return {
    success: true,
    data: [header, ...filteredRows],
    info: { removedCount: rows.length - filteredRows.length }
  }
}
