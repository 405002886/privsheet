/**
 * 操作注册表 - 供 TaskPage 调用
 * 将 actionId 映射到对应的操作函数和默认参数
 */
import {
  // 基础数据操作
  removeEmptyRows,
  removeEmptyCols,
  trimWhitespace,
  removeAllSpaces,
  toUpperCase,
  toLowerCase,
  capitalize,
  // 去重与排序
  deduplicateRows,
  deduplicateByColumns,
  sortData,
  shuffleData,
  // 拆分与合并
  splitColumn,
  splitColumnByWidth,
  splitToSheets,
  mergeColumns,
  transposeData,
  // 脱敏操作
  maskIdCard,
  maskPhone,
  maskEmail,
  maskName,
  customMask,
  // 格式清洗
  normalizeDates,
  roundNumbers,
  removeSpecialChars,
  convertWidth,
  // 文本处理
  replaceText,
  letterMappingReplace,
  extractByRegex,
  columnToString,
  // 统计计算
  calculateSum,
  calculateCount,
  calculateAverage,
  calculateMax,
  calculateMin,
  batchMathOperation,
  groupByAndSummarize,
  // 格式转换
  toSQLInsert,
  toSQLInQuery,
  toJSON,
  toCSV,
  // 多文件合并
  mergeWorkbooks,
  // VLOOKUP 匹配
  lookupMatch,
  // 工资条拆分
  splitWageSlip
} from './index.js'

/**
 * 将 colIndex 转为数字（<select> 传出的是字符串）
 * 同时判断是否为"所有列"模式（-1）
 */
function toColIndex(val) {
  return Number(val ?? -1)
}

function isAllColumns(val) {
  return toColIndex(val) === -1
}

/**
 * 根据 colIndex 构建 colIndices 数组
 * - colIndex 为 -1（所有列）时返回空数组（操作函数内部按空数组=所有列处理）
 * - colIndex 为具体列时返回 [colIndex]
 * - colIndex 未设置时回退到 columns
 */
function buildColIndices(val, columns) {
  if (val !== undefined && val !== null) {
    const idx = toColIndex(val)
    if (idx === -1) return []  // 所有列
    return [idx]
  }
  return columns.length > 0 ? columns : []
}

/**
 * 操作注册表
 * key: actionId (与 TaskPage.vue 中的 currentTask.actions.id 对应)
 * value: { fn, paramBuilder, outputType }
 */
export const operationRegistry = {
  // ========== 去重 ==========
  'dedup-exact': {
    fn: deduplicateRows,
    paramBuilder: (columns, config) => ({
      keepStrategy: config.keepStrategy || 'first'
    }),
    outputType: 'data'
  },
  'dedup-key': {
    fn: deduplicateByColumns,
    paramBuilder: (columns, config) => ({
      colIndices: config.colIndices || columns,
      keepStrategy: config.keepStrategy || 'first'
    }),
    outputType: 'data'
  },

  // ========== 脱敏 ==========
  'mask-id': {
    fn: maskIdCard,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0]),
      maskType: config.maskType || 'partial'
    }),
    outputType: 'data'
  },
  'mask-phone': {
    fn: maskPhone,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0]),
      maskType: config.maskType || 'partial'
    }),
    outputType: 'data'
  },
  'mask-email': {
    fn: maskEmail,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0]),
      maskType: config.maskType || 'partial'
    }),
    outputType: 'data'
  },
  'mask-name': {
    fn: maskName,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0]),
      maskType: config.maskType || 'partial'
    }),
    outputType: 'data'
  },

  // ========== 拆分/合并 ==========
  'split-delimiter': {
    fn: splitColumn,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0] ?? 0),
      delimiter: config.delimiter || ','
    }),
    outputType: 'data'
  },
  'split-to-sheets': {
    fn: splitToSheets,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0] ?? 0)
    }),
    outputType: 'multiSheet'
  },
  'merge': {
    fn: mergeColumns,
    paramBuilder: (columns, config) => ({
      colIndices: config.colIndices || columns,
      separator: config.separator || ''
    }),
    outputType: 'data'
  },

  // ========== 日期整理 ==========
  'normalize-dates': {
    fn: normalizeDates,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0]),
      targetFormat: config.targetFormat || 'YYYY-MM-DD'
    }),
    outputType: 'data'
  },

  // ========== 数字修约 ==========
  'round-numbers': {
    fn: roundNumbers,
    paramBuilder: (columns, config) => ({
      colIndices: buildColIndices(config.colIndex, columns),
      decimals: config.decimals ?? 0
    }),
    outputType: 'data'
  },

  // ========== 特殊字符清理 ==========
  'remove-special-chars': {
    fn: removeSpecialChars,
    paramBuilder: (columns, config) => ({
      colIndices: buildColIndices(config.colIndex, columns),
      removeChars: config.removeChars || ''
    }),
    outputType: 'data'
  },

  // ========== 全角半角转换 ==========
  'convert-width': {
    fn: convertWidth,
    paramBuilder: (columns, config) => ({
      colIndices: buildColIndices(config.colIndex, columns),
      type: config.type || 'toHalfWidth'
    }),
    outputType: 'data'
  },

  // ========== 格式转换 ==========
  'to-csv': {
    fn: toCSV,
    paramBuilder: (columns, config) => ({
      delimiter: config.delimiter || ','
    }),
    outputType: 'text'
  },
  'to-json': {
    fn: toJSON,
    paramBuilder: (columns, config) => ({
      withHeader: true,
      format: 'object'
    }),
    outputType: 'text'
  },

  // ========== 文本替换 ==========
  'replace-text': {
    fn: replaceText,
    paramBuilder: (columns, config) => ({
      colIndices: buildColIndices(config.colIndex, columns),
      search: config.search || '',
      replace: config.replace || '',
      useRegex: false,
      caseSensitive: true
    }),
    outputType: 'data'
  },

  // ========== 字母映射替换 ==========
  'letter-mapping': {
    fn: letterMappingReplace,
    paramBuilder: (columns, config) => ({
      colIndices: buildColIndices(config.colIndex, columns),
      mapping: config.letterMapping || '',
      caseSensitive: false
    }),
    outputType: 'data'
  },

  // ========== 基础操作 ==========
  'remove-empty-rows': {
    fn: removeEmptyRows,
    paramBuilder: () => ({}),
    outputType: 'data'
  },
  'remove-empty-cols': {
    fn: removeEmptyCols,
    paramBuilder: () => ({}),
    outputType: 'data'
  },
  'trim-whitespace': {
    fn: trimWhitespace,
    paramBuilder: (columns, config) => ({
      colIndices: buildColIndices(config.colIndex, columns)
    }),
    outputType: 'data'
  },
  'to-upper': {
    fn: toUpperCase,
    paramBuilder: (columns, config) => ({
      colIndices: buildColIndices(config.colIndex, columns)
    }),
    outputType: 'data'
  },
  'to-lower': {
    fn: toLowerCase,
    paramBuilder: (columns, config) => ({
      colIndices: buildColIndices(config.colIndex, columns)
    }),
    outputType: 'data'
  },
  'capitalize': {
    fn: capitalize,
    paramBuilder: (columns, config) => ({
      colIndices: buildColIndices(config.colIndex, columns)
    }),
    outputType: 'data'
  },

  // ========== 自定义管道 ==========
  'pipeline': {
    fn: null, // 管道操作由 PipelineEngine 处理
    paramBuilder: () => ({}),
    outputType: 'data'
  },

  // ========== 排序操作 ==========
  'sort-asc': {
    fn: sortData,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0] ?? 0),
      order: 'asc'
    }),
    outputType: 'data'
  },
  'sort-desc': {
    fn: sortData,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0] ?? 0),
      order: 'desc'
    }),
    outputType: 'data'
  },
  'shuffle': {
    fn: shuffleData,
    paramBuilder: () => ({}),
    outputType: 'data'
  },

  // ========== SQL导出 ==========
  'to-sql-insert': {
    fn: (data, params) => {
      return toSQLInsert(data, params)
    },
    paramBuilder: (columns, config) => ({
      tableName: config.tableName || 'my_table'
    }),
    outputType: 'text'
  },
  'to-sql-inquery': {
    fn: (data, params) => {
      const colIndex = params.column ?? 0
      const headers = data[0] || []
      const columnName = headers[colIndex] || String(colIndex)
      return toSQLInQuery(data, { ...params, column: columnName })
    },
    paramBuilder: (columns, config) => ({
      tableName: config.tableName || 'my_table',
      column: config.column !== undefined ? config.column : (columns[0] ?? 0)
    }),
    outputType: 'text'
  },

  // ========== 列数据转字符串（批量提取） ==========
  'column-to-string': {
    fn: columnToString,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0] ?? 0)
    }),
    outputType: 'text'
  },

  // ========== 正则提取 ==========
  'extract-regex': {
    fn: extractByRegex,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0]),
      pattern: config.pattern || ''
    }),
    outputType: 'data'
  },

  // ========== 统计计算 ==========
  'calculate-sum': {
    fn: calculateSum,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0])
    }),
    outputType: 'data'
  },
  'calculate-count': {
    fn: calculateCount,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0])
    }),
    outputType: 'data'
  },
  'calculate-avg': {
    fn: calculateAverage,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0])
    }),
    outputType: 'data'
  },
  'calculate-max': {
    fn: calculateMax,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0])
    }),
    outputType: 'data'
  },
  'calculate-min': {
    fn: calculateMin,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0])
    }),
    outputType: 'data'
  },
  'batch-math': {
    fn: batchMathOperation,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0] ?? 0),
      operator: config.operator || '+',
      value: config.mathValue ?? 0
    }),
    outputType: 'data'
  },
  'group-summary': {
    fn: groupByAndSummarize,
    paramBuilder: (columns, config) => ({
      groupCol: Number(config.groupColumn ?? columns[0] ?? 0),
      aggCol: Number(config.aggColIndex ?? columns[1] ?? 1),
      aggType: config.aggType || 'sum'
    }),
    outputType: 'data'
  },

  // ========== 自定义脱敏 ==========
  'custom-mask': {
    fn: customMask,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0]),
      maskType: config.maskType || 'quick',
      regexPattern: config.pattern || '',
      replaceWith: config.replaceWith || '***',
      quickMode: config.quickMode || 'keep-2-sides'
    }),
    outputType: 'data'
  },

  // ========== 行列转置 ==========
  'transpose': {
    fn: transposeData,
    paramBuilder: () => ({}),
    outputType: 'data'
  },

  // ========== 按宽度拆分 ==========
  'split-width': {
    fn: splitColumnByWidth,
    paramBuilder: (columns, config) => ({
      colIndex: toColIndex(config.colIndex ?? columns[0] ?? 0),
      widths: (config.widthsStr || '').split(',').map(w => parseInt(w.trim(), 10)).filter(w => !isNaN(w))
    }),
    outputType: 'data'
  },

  // ========== 批量空格处理 ==========
  'remove-all-spaces': {
    fn: removeAllSpaces,
    paramBuilder: (columns, config) => ({
      colIndices: buildColIndices(config.colIndex, columns)
    }),
    outputType: 'data'
  },

  // ========== 多文件合并 ==========
  'merge-append': {
    fn: mergeWorkbooks,
    paramBuilder: (columns, config, dataList) => ({
      dataList: config.dataList || dataList || [],
      mergeMode: 'append',
      deduplicate: config.deduplicate || false,
      deduplicateColumns: config.deduplicateColumns || columns,
      keepStrategy: config.keepStrategy || 'first',
      hasHeader: true
    }),
    outputType: 'data'
  },
  'merge-horizontal': {
    fn: mergeWorkbooks,
    paramBuilder: (columns, config, dataList) => ({
      dataList: config.dataList || dataList || [],
      mergeMode: 'horizontal',
      deduplicate: false,
      deduplicateColumns: [],
      keepStrategy: 'first',
      hasHeader: true
    }),
    outputType: 'data'
  },

  // ========== VLOOKUP 匹配 ==========
  'lookup-match': {
    fn: lookupMatch,
    paramBuilder: (columns, config, dataList) => ({
      lookupData: config.lookupData || (dataList && dataList[1] ? dataList[1].data : []),
      keyColumn: Number(config.keyColumn ?? columns[0] ?? 0),
      lookupKeyColumn: Number(config.lookupKeyColumn ?? 0),
      returnColumns: config.returnColumns || (columns.length > 1 ? columns.slice(1) : [1]),
      fuzzyMatch: config.fuzzyMatch || false,
      ifNotFound: config.ifNotFound || '#N/A'
    }),
    outputType: 'data'
  },

  // ========== 工资条拆分 ==========
  'wage-slip-split': {
    fn: splitWageSlip,
    paramBuilder: (columns, config) => ({
      headerRowIndex: config.headerRowIndex ?? 0,
      nameColumn: Number(config.nameColumn ?? columns[0] ?? 0),
      exportFormat: config.exportFormat || 'excel',
      includeEmpty: config.includeEmpty || false,
      pdfOptions: config.pdfOptions || {}
    }),
    outputType: 'data'
  }
}

/**
 * 执行操作
 * @param {string} actionId - 操作ID
 * @param {Array[]} data - 二维数组数据
 * @param {number[]} columns - 选中的列索引
 * @param {Object} config - 操作配置
 * @param {Array[]} [dataList] - 多数据源（如多文件合并）
 * @returns {{ success: boolean, data: Array[]|string, info: Object }}
 */
export function executeOperation(actionId, data, columns, config = {}, dataList = null) {
  const operation = operationRegistry[actionId]

  if (!operation) {
    return { success: false, data: [], info: { error: `未知操作: ${actionId}` } }
  }

  if (!operation.fn) {
    return { success: false, data: [], info: { error: `操作未实现: ${actionId}` } }
  }

  try {
    const params = operation.paramBuilder(columns, config, dataList)
    return operation.fn(data, params)
  } catch (error) {
    return { success: false, data: [], info: { error: error.message } }
  }
}

export default operationRegistry