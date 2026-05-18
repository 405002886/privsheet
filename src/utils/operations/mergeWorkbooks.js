/**
 * 多工作簿合并操作
 *
 * 将多个 Excel 文件的数据按规则合并成一个文件
 *
 * @param {Array[]} data - 不使用（数据通过 dataList 传入）
 * @param {Object} options - 合并选项
 * @param {Array[]} options.dataList - 多文件数据 [{ fileId, fileName, sheetName, data }]
 * @param {string} options.mergeMode - 'append'(追加行) | 'horizontal'(横向拼接)
 * @param {boolean} options.deduplicate - 是否去重
 * @param {number[]} options.deduplicateColumns - 去重的关键列索引
 * @param {string} options.keepStrategy - 'first' | 'last'
 * @param {boolean} options.hasHeader - 是否有表头行，默认 true
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function mergeWorkbooks(data, options = {}) {
  const {
    dataList = [],
    mergeMode = 'append',
    deduplicate = false,
    deduplicateColumns = [],
    keepStrategy = 'first',
    hasHeader = true
  } = options

  console.log('mergeWorkbooks 被调用, mergeMode:', mergeMode)

  // 验证至少有两个文件
  if (!dataList || dataList.length < 2) {
    return {
      success: false,
      data: [],
      info: { error: ErrorCodes.NEED_AT_LEAST_TWO_FILES }
    }
  }

  let mergedData = []
  let globalHeader = null
  let errorMsg = null

  for (const fileData of dataList) {
    const fileRows = fileData.data || []

    if (fileRows.length === 0) {
      continue
    }

    const fileHeader = hasHeader ? fileRows[0] : null
    const fileBody = hasHeader ? fileRows.slice(1) : fileRows

    if (mergeMode === 'append') {
      // 追加行模式：验证表头一致性后直接拼接
      if (!globalHeader) {
        globalHeader = fileHeader
        mergedData = fileRows.slice()  // 包含表头
      } else {
        // 验证表头是否一致
        if (JSON.stringify(globalHeader) !== JSON.stringify(fileHeader)) {
          errorMsg = `表头不一致: ${fileData.fileName} 的 Sheet "${fileData.sheetName}" 表头与第一个文件不匹配`
          break
        }
        mergedData = mergedData.concat(fileBody)  // 只追加数据行
      }
    } else if (mergeMode === 'horizontal') {
      // 横向拼接模式：将多个文件的列拼接在一起
      if (mergedData.length === 0) {
        // 找到所有文件的最大列数
        const allMaxCols = dataList.reduce((max, f) => Math.max(max, (f.data?.[0] || []).length), 0)

        // 收集所有文件的表头并横向拼接
        const allHeaders = []
        for (const fd of dataList) {
          const h = hasHeader ? fd.data[0] : null
          if (h) {
            allHeaders.push(...h)
          }
        }
        mergedData.push(allHeaders)

        // 找到数据行数最多的文件
        const maxRows = dataList.reduce((max, f) => Math.max(max, hasHeader ? f.data.length - 1 : f.data.length), 0)

        // 横向拼接数据
        for (let rowIdx = 0; rowIdx < maxRows; rowIdx++) {
          const combinedRow = []
          for (const fd of dataList) {
            const rows = hasHeader ? fd.data.slice(1) : fd.data
            const row = rows[rowIdx] || []
            combinedRow.push(...row)
          }
          mergedData.push(combinedRow)
        }
        break  // horizontal 模式一次性处理
      }
    }
  }

  if (errorMsg) {
    return {
      success: false,
      data: [],
      info: { error: errorMsg }
    }
  }

  // 可选去重
  if (deduplicate && deduplicateColumns.length > 0 && mergedData.length > 1) {
    const header = hasHeader ? mergedData[0] : null
    const body = hasHeader ? mergedData.slice(1) : mergedData

    const seen = new Map()
    const result = []

    if (hasHeader) {
      result.push(header)
    }

    for (const row of body) {
      // 构建去重 key
      const keyValues = deduplicateColumns.map(col => row[col] ?? '')
      const key = keyValues.join('|||')

      if (!seen.has(key)) {
        seen.set(key, result.length)
        result.push(row)
      } else if (keepStrategy === 'last') {
        // 替换之前的行
        const existingIndex = seen.get(key)
        result[existingIndex] = row
      }
      // keepStrategy === 'first' 时忽略重复
    }

    mergedData = result
  }

  return {
    success: true,
    data: mergedData,
    info: {
      mergedFiles: dataList.length,
      mergedRows: hasHeader ? mergedData.length - 1 : mergedData.length,
      deduplicated: deduplicate && deduplicateColumns.length > 0
        ? (mergedData.length - (hasHeader ? 1 : 0)) : 0
    }
  }
}

/**
 * 将行填充到指定长度
 * @param {Array} row - 行数据
 * @param {number} length - 目标长度
 * @returns {Array} 填充后的行
 */
function fillRowToLength(row, length) {
  if (!row) return Array(length).fill('')
  if (row.length >= length) return row.slice(0, length)
  return [...row, ...Array(Math.max(0, length - row.length)).fill('')]
}

export default mergeWorkbooks