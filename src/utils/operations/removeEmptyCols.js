/**
 * 去除空列
 * @param {Array[]} data - 二维数组数据
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function removeEmptyCols(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  // 找出非空的列索引
  const nonEmptyColIndices = []
  const colCount = Math.max(...data.map(row => row ? row.length : 0))

  for (let colIndex = 0; colIndex < colCount; colIndex++) {
    const isEmpty = data.every(row => {
      if (!row) return true
      const cell = row[colIndex]
      return cell === null || cell === undefined || String(cell).trim() === ''
    })
    if (!isEmpty) {
      nonEmptyColIndices.push(colIndex)
    }
  }

  // 过滤数据
  const filteredData = data.map(row => {
    if (!row) return []
    return nonEmptyColIndices.map(index => row[index])
  })

  return {
    success: true,
    data: filteredData,
    info: { removedCount: colCount - nonEmptyColIndices.length }
  }
}
