import * as XLSX from 'xlsx'

/**
 * Excel文件解析工具
 * 提供统一的接口来解析xlsx/xls/csv/ods格式的Excel文件
 */

/**
 * 解析Excel工作簿
 * @param {ArrayBuffer|Uint8Array} buffer - 文件数据
 * @returns {Object} 解析后的工作簿数据 { sheets: [{ name, data }] }
 */
export function parseWorkbook(buffer) {
  try {
    const workbook = XLSX.read(buffer, {
      type: 'array',
      cellDates: true,
      cellNF: true
    })

    const sheets = workbook.SheetNames.map(name => {
      const sheet = workbook.Sheets[name]
      const data = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: '',
        raw: false
      })
      return {
        name,
        data,
        range: sheet['!ref'] || null
      }
    })

    return {
      success: true,
      sheets,
      sheetNames: workbook.SheetNames,
      metadata: {
        author: workbook.Props?.Author || '',
        title: workbook.Props?.Title || '',
        subject: workbook.Props?.Subject || '',
        created: workbook.Props?.CreatedDate || null
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      sheets: [],
      sheetNames: []
    }
  }
}

/**
 * 获取工作表名称列表
 * @param {ArrayBuffer|Uint8Array} buffer - 文件数据
 * @returns {string[]} 工作表名称数组
 */
export function getSheetNames(buffer) {
  try {
    const workbook = XLSX.read(buffer, { type: 'array' })
    return workbook.SheetNames
  } catch {
    return []
  }
}

/**
 * 获取指定工作表的数据
 * @param {Object} workbook - XLSX工作簿对象
 * @param {string} sheetName - 工作表名称
 * @returns {Array} 二维数组数据
 */
export function getSheetData(workbook, sheetName) {
  try {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) return []
    return XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
      raw: false
    })
  } catch {
    return []
  }
}

/**
 * 导出数据为Excel文件
 * @deprecated 请使用 src/utils/export/excelExporter.js 中的 exportToExcelStyled 或 exportToExcelWithStyles
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 导出选项
 * @param {string} options.filename - 文件名（不含扩展名）
 * @param {string} options.sheetName - 工作表名称
 * @param {boolean} options.withHeader - 是否包含表头行
 * @param {Object[]} options.headers - 表头配置 [{ key, label }]
 */
export function exportToExcel(data, options = {}) {
  const {
    filename = 'export',
    sheetName = 'Sheet1',
    withHeader = false,
    headers = []
  } = options

  // 创建工作表
  let wsData = data

  // 如果有表头配置，在数据前插入表头行
  if (withHeader && headers.length > 0) {
    const headerRow = headers.map(h => h.label)
    wsData = [headerRow, ...data]
  }

  const worksheet = XLSX.utils.aoa_to_sheet(wsData)

  // 创建工作簿
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // 生成文件并触发下载
  const wbout = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  })

  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  // 使用file-saver触发下载
  import('file-saver').then(({ saveAs }) => {
    saveAs(blob, `${filename}.xlsx`)
  })

  return true
}

/**
 * 导出数据为CSV文件
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 导出选项
 * @param {string} options.filename - 文件名（不含扩展名）
 * @param {string} options.delimiter - 分隔符，默认逗号
 */
export function exportToCSV(data, options = {}) {
  const { filename = 'export', delimiter = ',' } = options

  const worksheet = XLSX.utils.aoa_to_sheet(data)
  const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: delimiter })

  const blob = new Blob(['﻿' + csv], {
    type: 'text/csv;charset=utf-8'
  })

  import('file-saver').then(({ saveAs }) => {
    saveAs(blob, `${filename}.csv`)
  })

  return true
}

/**
 * 导出数据为JSON文件
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 导出选项
 * @param {string} options.filename - 文件名（不含扩展名）
 * @param {boolean} options.includeHeader - 是否将第一行作为键名
 */
export function exportToJSON(data, options = {}) {
  const { filename = 'export', includeHeader = true } = options

  let jsonData
  if (includeHeader && data.length > 0) {
    const headers = data[0]
    jsonData = data.slice(1).map(row => {
      const obj = {}
      headers.forEach((header, index) => {
        obj[header] = row[index]
      })
      return obj
    })
  } else {
    jsonData = data
  }

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: 'application/json'
  })

  import('file-saver').then(({ saveAs }) => {
    saveAs(blob, `${filename}.json`)
  })

  return true
}

/**
 * 检测字节数组是否是有效的 UTF-8 编码
 * @param {Uint8Array} bytes
 * @returns {boolean}
 */
function checkValidUTF8(bytes) {
  let i = 0
  while (i < bytes.length) {
    const byte = bytes[i]

    // 单字节字符 (0x00-0x7F)
    if (byte <= 0x7F) {
      i++
      continue
    }

    // 确定 UTF-8 序列长度
    let seqLen = 0
    if ((byte & 0xE0) === 0xC0) {
      seqLen = 2 // 110xxxxx
    } else if ((byte & 0xF0) === 0xE0) {
      seqLen = 3 // 1110xxxx
    } else if ((byte & 0xF8) === 0xF0) {
      seqLen = 4 // 11110xxx
    } else {
      // 无效的 UTF-8 起始字节
      return false
    }

    // 检查是否有足够的字节
    if (i + seqLen > bytes.length) {
      return false
    }

    // 验证后续字节必须是 10xxxxxx 格式
    for (let j = 1; j < seqLen; j++) {
      if ((bytes[i + j] & 0xC0) !== 0x80) {
        return false
      }
    }

    i += seqLen
  }
  return true
}

/**
 * 从文件对象解析Excel
 * @param {File} file - 文件对象
 * @returns {Promise<Object>} 解析结果
 */
export async function parseFile(file) {
  const fileType = detectFileType(file)

  // CSV 文件需要处理编码问题
  if (fileType === 'csv') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const uint8 = new Uint8Array(e.target.result)
          let content
          let encoding = 'UTF-8'

          // UTF-8 BOM: EF BB BF
          if (uint8.length >= 3 && uint8[0] === 0xEF && uint8[1] === 0xBB && uint8[2] === 0xBF) {
            content = new TextDecoder('UTF-8').decode(uint8.slice(3))
          }
          // UTF-16 LE BOM: FF FE
          else if (uint8.length >= 2 && uint8[0] === 0xFF && uint8[1] === 0xFE) {
            content = new TextDecoder('UTF-16LE').decode(uint8.slice(2))
            encoding = 'UTF-16LE'
          }
          // UTF-16 BE BOM: FE FF
          else if (uint8.length >= 2 && uint8[0] === 0xFE && uint8[1] === 0xFF) {
            content = new TextDecoder('UTF-16BE').decode(uint8.slice(2))
            encoding = 'UTF-16BE'
          }
          // 无 BOM 时，检测是否为非 UTF-8 编码（常见于中文 Windows 生成的 GBK 编码 CSV）
          else if (uint8.length > 0 && !checkValidUTF8(uint8)) {
            content = new TextDecoder('GBK').decode(uint8)
            encoding = 'GBK'
          }
          else {
            // 无 BOM 的有效 UTF-8 或空文件
            content = new TextDecoder('UTF-8').decode(uint8)
          }

          // 使用 XLSX.read 按字符串处理 CSV
          const data = XLSX.read(content, {
            type: 'string',
            cellDates: true,
            cellNF: true
          })
          const sheets = data.SheetNames.map(name => {
            const sheet = data.Sheets[name]
            const sheetData = XLSX.utils.sheet_to_json(sheet, {
              header: 1,
              defval: '',
              raw: false
            })
            return {
              name,
              data: sheetData,
              range: sheet['!ref'] || null
            }
          })
          resolve({
            success: true,
            sheets,
            sheetNames: data.SheetNames,
            metadata: {
              author: data.Props?.Author || '',
              title: data.Props?.Title || '',
              subject: data.Props?.Subject || '',
              created: data.Props?.CreatedDate || null
            },
            encoding // 用于调试
          })
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }

      // 读取为 ArrayBuffer 以便检测编码
      reader.readAsArrayBuffer(file)
    })
  }

  // 其他格式（xlsx/xls/ods）使用 ArrayBuffer 读取
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const result = parseWorkbook(new Uint8Array(e.target.result))
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * 检测文件类型
 * @param {File} file - 文件对象
 * @returns {string} 文件类型 'xlsx' | 'xls' | 'csv' | 'ods' | 'unknown'
 */
export function detectFileType(file) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.xlsx')) return 'xlsx'
  if (name.endsWith('.xls')) return 'xls'
  if (name.endsWith('.csv')) return 'csv'
  if (name.endsWith('.ods')) return 'ods'
  return 'unknown'
}
