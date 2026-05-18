/**
 * VLOOKUP 智能匹配操作
 *
 * 类似 Excel VLOOKUP/INDEX+MATCH 的多表关联匹配
 *
 * @param {Array[]} data - 主表数据（二维数组，第一行为表头）
 * @param {Object} options - 匹配选项
 * @param {Array[]} options.lookupData - 查找表数据
 * @param {number} options.keyColumn - 主表关键列索引
 * @param {number} options.lookupKeyColumn - 查找表关键列索引
 * @param {number[]} options.returnColumns - 要返回的查找表列索引数组
 * @param {boolean} options.fuzzyMatch - 是否模糊匹配，默认 false
 * @param {string} options.ifNotFound - 未找到时填充的值，默认 '#N/A'
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function lookupMatch(data, options = {}) {
  const {
    lookupData = [],
    keyColumn = 0,
    lookupKeyColumn = 0,
    returnColumns = [],
    fuzzyMatch = false,
    ifNotFound = '#N/A'
  } = options

  // 参数验证
  if (!data || !Array.isArray(data) || data.length < 2) {
    return {
      success: false,
      data: [],
      info: { error: ErrorCodes.INVALID_MAIN_TABLE }
    }
  }

  if (!lookupData || !Array.isArray(lookupData) || lookupData.length < 2) {
    return {
      success: false,
      data: [],
      info: { error: ErrorCodes.INVALID_LOOKUP_TABLE }
    }
  }

  if (returnColumns.length === 0) {
    return {
      success: false,
      data: [],
      info: { error: ErrorCodes.SELECT_AT_LEAST_ONE_COLUMN }
    }
  }

  const mainHeader = data[0]
  const mainBody = data.slice(1)
  const lookupHeader = lookupData[0]
  const lookupBody = lookupData.slice(1)

  // 构建查找表 Map（关键列 -> 行数据）
  const lookupMap = new Map()

  for (const row of lookupBody) {
    // 获取关键列的值
    const keyValue = row[lookupKeyColumn]

    if (keyValue === undefined || keyValue === null || keyValue === '') {
      continue
    }

    const mapKey = fuzzyMatch ? normalizeKey(keyValue) : String(keyValue)

    // 如果是模糊匹配，使用前缀匹配
    if (fuzzyMatch) {
      // 对于模糊匹配，存储所有匹配的行
      if (!lookupMap.has(mapKey)) {
        lookupMap.set(mapKey, [])
      }
      lookupMap.get(mapKey).push(row)
    } else {
      // 精确匹配，只存储第一行
      if (!lookupMap.has(mapKey)) {
        lookupMap.set(mapKey, row)
      }
    }
  }

  // 构建返回表头
  const returnHeaders = returnColumns.map(idx => lookupHeader[idx] || `列${idx + 1}`)

  // 构建新的表头：主表表头 + 返回列表头
  const newHeader = [...mainHeader, ...returnHeaders]

  // 执行匹配
  const result = [newHeader]
  let matchedCount = 0
  let unmatchedCount = 0

  for (const mainRow of mainBody) {
    const mainKeyValue = mainRow[keyColumn]
    const mapKey = fuzzyMatch ? normalizeKey(mainKeyValue) : String(mainKeyValue)

    // 复制主表数据列（包括关键列）
    const newRow = [...mainRow]

    // 获取匹配行
    let matchedRow = null

    if (fuzzyMatch) {
      // 模糊匹配：查找最长前缀匹配
      const candidates = lookupMap.get(mapKey) || []
      let bestMatch = null
      let bestLength = 0

      for (const candidate of candidates) {
        const candidateKey = normalizeKey(candidate[lookupKeyColumn])
        if (mapKey.startsWith(candidateKey) && candidateKey.length > bestLength) {
          bestMatch = candidate
          bestLength = candidateKey.length
        }
      }

      matchedRow = bestMatch
    } else {
      matchedRow = lookupMap.get(mapKey) || null
    }

    if (matchedRow) {
      matchedCount++
      // 添加返回列的值
      for (const colIdx of returnColumns) {
        newRow.push(matchedRow[colIdx] !== undefined ? matchedRow[colIdx] : ifNotFound)
      }
    } else {
      unmatchedCount++
      // 未找到时填充 ifNotFound
      for (const colIdx of returnColumns) {
        newRow.push(ifNotFound)
      }
    }

    result.push(newRow)
  }

  return {
    success: true,
    data: result,
    info: {
      totalRows: mainBody.length,
      matchedRows: matchedCount,
      unmatchedRows: unmatchedCount,
      returnColumns: returnColumns.length
    }
  }
}

/**
 * 标准化键值（用于模糊匹配）
 * @param {any} key - 键值
 * @returns {string} 标准化后的键值
 */
function normalizeKey(key) {
  if (key === null || key === undefined) return ''
  return String(key).trim().toLowerCase()
}

/**
 * 计算字符串相似度（用于更高级的模糊匹配）
 * @param {string} str1 - 字符串1
 * @param {string} str2 - 字符串2
 * @returns {number} 相似度 0-1
 */
export function diceCoefficient(str1, str2) {
  if (!str1 || !str2) return 0

  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()

  if (s1 === s2) return 1

  // 二元组
  const bigrams1 = getBigrams(s1)
  const bigrams2 = getBigrams(s2)

  let intersection = 0
  for (const bigram of bigrams1) {
    const idx = bigrams2.indexOf(bigram)
    if (idx !== -1) {
      bigrams2.splice(idx, 1)
      intersection++
    }
  }

  return (2 * intersection) / (bigrams1.length + bigrams2.length)
}

function getBigrams(str) {
  const bigrams = []
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.push(str.slice(i, i + 2))
  }
  return bigrams
}

export default lookupMatch