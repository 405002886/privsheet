/**
 * Excel转JSON
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { withHeader?: boolean, format?: 'array' | 'object' }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function toJSON(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const { withHeader = true, format = 'array' } = options
  const header = data[0] || []
  const rows = data.slice(1)

  let jsonData

  if (withHeader) {
    if (format === 'object') {
      // 对象数组格式: [{ "姓名": "张三", "年龄": 25 }]
      jsonData = rows.map(row => {
        if (!row) return {}
        const obj = {}
        header.forEach((col, i) => {
          obj[String(col)] = row[i]
        })
        return obj
      })
    } else {
      // 纯数组格式
      jsonData = rows.filter(row => row && row.some(cell => cell != null))
    }
  } else {
    jsonData = rows.filter(row => row && row.some(cell => cell != null))
  }

  return {
    success: true,
    // 返回格式化后的 JSON 字符串供预览和导出
    data: JSON.stringify(jsonData, null, 2),
    info: { rowCount: Array.isArray(jsonData) ? jsonData.length : 0 }
  }
}
