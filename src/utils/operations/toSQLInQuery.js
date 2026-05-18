/**
 * Excel转SQL IN查询
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { tableName?: string, column?: string, skipHeader?: boolean }
 * @returns {{ success: boolean, data: string[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function toSQLInQuery(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  // 处理参数：支持 registry 传递的对象，也支持直接的 tableName, column 参数
  let tableName = 'mytable'
  let column = 'id'
  let skipHeader = true

  if (typeof options === 'string') {
    tableName = options
  } else if (options && typeof options === 'object') {
    tableName = options.tableName || tableName
    column = options.column || column
    skipHeader = options.skipHeader !== false
  }

  const header = data[0] || []
  const rows = skipHeader ? data.slice(1) : data

  // 找到指定列的索引
  let colIndex = header.findIndex(h => String(h).toLowerCase() === column.toLowerCase())
  if (colIndex === -1) colIndex = 0

  // 收集值
  const values = rows
    .map(row => row ? row[colIndex] : null)
    .filter(v => v !== null && v !== undefined && v !== '')

  if (values.length === 0) {
    return {
      success: true,
      data: [],
      info: { warning: ErrorCodes.NO_VALID_VALUES }
    }
  }

  // 生成IN查询
  const cleanColumn = column.replace(/[^a-zA-Z0-9_]/g, '_')
  const cleanTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '_')

  const formattedValues = values.map(v => {
    if (typeof v === 'number') return v
    return `'${String(v).replace(/'/g, "''")}'`
  })

  const chunkSize = 1000
  const statements = []

  for (let i = 0; i < formattedValues.length; i += chunkSize) {
    const chunk = formattedValues.slice(i, i + chunkSize)
    statements.push(`SELECT * FROM \`${cleanTableName}\` WHERE \`${cleanColumn}\` IN (${chunk.join(', ')});`)
  }

  return {
    success: true,
    data: statements,
    info: { statementCount: statements.length, valueCount: values.length }
  }
}
