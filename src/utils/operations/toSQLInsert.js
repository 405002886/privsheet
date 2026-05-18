/**
 * Excel转SQL INSERT
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { tableName?: string, skipHeader?: boolean }
 * @returns {{ success: boolean, data: string[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function toSQLInsert(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  // 处理参数：支持 registry 传递的对象，也支持直接的 tableName 参数
  let tableName = 'mytable'
  let skipHeader = false

  if (typeof options === 'string') {
    tableName = options
  } else if (options && typeof options === 'object') {
    tableName = options.tableName || tableName
    skipHeader = options.skipHeader !== undefined ? options.skipHeader : false
  }

  const header = data[0] || []
  const rows = skipHeader ? data.slice(1) : data.slice(1)

  // 清理表名
  const cleanTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '_')

  // 生成列名
  const columns = header.map(col => `\`${String(col).replace(/`/g, '``')}\``).join(', ')

  // 生成INSERT语句
  const statements = rows.map(row => {
    if (!row) return null
    const values = header.map((_, i) => {
      const val = row[i]
      if (val === null || val === undefined) return 'NULL'
      if (typeof val === 'number') return val
      if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE'
      return `'${String(val).replace(/'/g, "''")}'`
    }).join(', ')
    return `INSERT INTO \`${cleanTableName}\` (${columns}) VALUES (${values});`
  }).filter(Boolean)

  return {
    success: true,
    data: statements,
    info: { statementCount: statements.length, tableName: cleanTableName }
  }
}
