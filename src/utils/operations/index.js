/**
 * 原子操作函数库 - 统一导出
 * 所有操作函数遵循统一签名：
 * @param {Array[]} data - 二维数组数据
 * @param {*} options - 操作选项
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */

// ========== A. 基础数据操作 ==========
export { removeEmptyRows } from './removeEmptyRows.js'
export { removeEmptyCols } from './removeEmptyCols.js'
export { trimWhitespace } from './trimWhitespace.js'
export { removeAllSpaces } from './removeAllSpaces.js'
export { toUpperCase } from './toUpperCase.js'
export { toLowerCase } from './toLowerCase.js'
export { capitalize } from './capitalize.js'

// ========== B. 去重与排序 ==========
export { deduplicateRows } from './deduplicateRows.js'
export { deduplicateByColumns } from './deduplicateByColumns.js'
export { sortData } from './sortData.js'
export { shuffleData } from './shuffleData.js'

// ========== C. 拆分与合并 ==========
export { splitColumn } from './splitColumn.js'
export { splitColumnByWidth } from './splitColumnByWidth.js'
export { splitToSheets } from './splitToSheets.js'
export { mergeColumns } from './mergeColumns.js'
export { transposeData } from './transposeData.js'

// ========== D. 脱敏操作 ==========
export { maskIdCard } from './maskIdCard.js'
export { maskPhone } from './maskPhone.js'
export { maskEmail } from './maskEmail.js'
export { maskName } from './maskName.js'
export { customMask } from './customMask.js'

// ========== E. 格式清洗 ==========
export { normalizeDates } from './normalizeDates.js'
export { roundNumbers } from './roundNumbers.js'
export { removeSpecialChars } from './removeSpecialChars.js'
export { convertWidth } from './convertWidth.js'

// ========== F. 文本处理 ==========
export { replaceText } from './replaceText.js'
export { letterMappingReplace } from './letterMappingReplace.js'
export { extractByRegex } from './extractByRegex.js'
export { extractEmails } from './extractEmails.js'
export { extractPhones } from './extractPhones.js'
export { columnToString } from './columnToString.js'

// ========== G. 统计计算 ==========
export { calculateSum } from './calculateSum.js'
export { calculateCount } from './calculateCount.js'
export { calculateAverage } from './calculateAverage.js'
export { calculateMax } from './calculateMax.js'
export { calculateMin } from './calculateMin.js'
export { batchMathOperation } from './batchMathOperation.js'
export { groupByAndSummarize } from './groupByAndSummarize.js'

// ========== H. 格式转换 ==========
export { toSQLInsert } from './toSQLInsert.js'
export { toSQLInQuery } from './toSQLInQuery.js'
export { toJSON } from './toJSON.js'
export { toCSV } from './toCSV.js'

// ========== I. 多文件合并 ==========
export { mergeWorkbooks } from './mergeWorkbooks.js'

// ========== J. VLOOKUP 匹配 ==========
export { lookupMatch } from './lookupMatch.js'

// ========== K. 工资条拆分 ==========
export { splitWageSlip } from './splitWageSlip.js'
export { exportWageSlipsToExcel } from './splitWageSlip.js'
