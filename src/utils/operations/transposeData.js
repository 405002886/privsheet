/**
 * 行列转置
 * @param {Array[]} data - 二维数组数据
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function transposeData(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const rowCount = data.length
  const colCount = Math.max(...data.map(row => row ? row.length : 0))

  // 转置
  const result = []
  for (let c = 0; c < colCount; c++) {
    const newRow = []
    for (let r = 0; r < rowCount; r++) {
      newRow.push(data[r] ? data[r][c] : null)
    }
    result.push(newRow)
  }

  return {
    success: true,
    data: result,
    info: { originalRows: rowCount, originalCols: colCount }
  }
}
