/**
 * 去除首尾空格
 * @param {Array[]} data - 二维数组数据
 * @param {number} colIndex - 列索引（-1 表示所有列）
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
export function trimWhitespace(data, colIndex = -1) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: '无效数据' } }
  }

  let affectedCount = 0

  const result = data.map((row, rowIndex) => {
    if (!row) return []
    return row.map((cell, cellIndex) => {
      if (typeof cell === 'string') {
        // 如果是表头行(rowIndex === 0)或指定列或所有列(-1)
        if (rowIndex === 0 || colIndex === -1 || colIndex === cellIndex) {
          const trimmed = cell.trim()
          if (trimmed !== cell) affectedCount++
          return trimmed
        }
      }
      return cell
    })
  })

  return {
    success: true,
    data: result,
    info: { affectedCount }
  }
}
