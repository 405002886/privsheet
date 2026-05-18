/**
 * 工资条拆分操作
 *
 * 将工资表拆分为每人一条带表头的工资条
 *
 * @param {Array[]} data - 工资表数据（二维数组，第一行为表头）
 * @param {Object} options - 拆分选项
 * @param {number} options.headerRowIndex - 表头行索引，默认 0
 * @param {number} options.nameColumn - 员工姓名列索引，默认 -1（自动检测）
 * @param {string} options.exportFormat - 'excel' | 'pdf'，默认 'excel'
 * @param {boolean} options.includeEmpty - 是否包含空工资条，默认 false
 * @param {Object} options.pdfOptions - PDF 导出选项（仅 pdf 模式生效）
 * @param {string} options.pdfOptions.orientation - 'portrait' | 'landscape'，默认 'portrait'
 * @param {number} options.pdfOptions.fontSize - 字体大小，默认 10
 * @param {boolean} options.pdfOptions.showHeaderOnEachPage - 每页显示表头，默认 true
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function splitWageSlip(data, options = {}) {
  const {
    headerRowIndex = 0,
    nameColumn = -1,
    exportFormat = 'excel',
    includeEmpty = false,
    pdfOptions = {}
  } = options

  // 参数验证
  if (!data || !Array.isArray(data) || data.length < 2) {
    return {
      success: false,
      data: [],
      info: { error: ErrorCodes.INVALID_WAGE_DATA }
    }
  }

  // 自动检测表头行
  const header = data[headerRowIndex] || data[0]
  const bodyStartIndex = headerRowIndex + 1
  const body = data.slice(bodyStartIndex)

  // 自动检测姓名列（查找包含"姓名"、"名字"、"name"等关键词的列）
  let detectedNameColumn = nameColumn
  if (nameColumn === -1) {
    detectedNameColumn = autoDetectNameColumn(header)
  }

  if (detectedNameColumn === -1) {
    return {
      success: false,
      data: [],
      info: { error: ErrorCodes.NAME_COLUMN_NOT_DETECTED }
    }
  }

  // 按员工姓名分组
  const employeeMap = new Map()

  for (const row of body) {
    const name = row[detectedNameColumn]
    const nameStr = name !== undefined && name !== null ? String(name).trim() : ''

    // 跳过空姓名
    if (!nameStr && !includeEmpty) {
      continue
    }

    if (!employeeMap.has(nameStr)) {
      employeeMap.set(nameStr, [])
    }
    employeeMap.get(nameStr).push(row)
  }

  // 生成每个员工的工资条
  // Excel 模式：每个工资条为一个二维数组（表头 + 数据行）
  // PDF 模式：返回工资条对象数组，后续由 pdfExporter 处理
  const wageSlips = []
  let totalSlipCount = 0

  for (const [employeeName, rows] of employeeMap) {
    for (const row of rows) {
      const slip = {
        employeeName: employeeName || '(未命名)',
        header: header,
        data: row,
        // 用于 Excel 导出的扁平化数据
        excelRow: [header, row]
      }
      wageSlips.push(slip)
      totalSlipCount++
    }
  }

  if (totalSlipCount === 0) {
    return {
      success: false,
      data: [],
      info: { error: ErrorCodes.NO_VALID_WAGE_RECORDS }
    }
  }

  // 返回结果
  if (exportFormat === 'pdf') {
    // PDF 模式返回工资条对象数组，由导出函数处理
    return {
      success: true,
      data: wageSlips,
      info: {
        totalEmployees: employeeMap.size,
        totalSlips: totalSlipCount,
        format: 'pdf',
        headerRowIndex,
        nameColumn: detectedNameColumn,
        pdfOptions
      }
    }
  }

  // Excel 模式：将所有工资条纵向拼接为一个二维数组
  // 格式：[表头, 数据行1, 表头, 数据行2, ...]
  const excelData = []
  for (const slip of wageSlips) {
    excelData.push(slip.header) // 表头行
    excelData.push(slip.data)    // 数据行
  }

  return {
    success: true,
    data: excelData,
    info: {
      totalEmployees: employeeMap.size,
      totalSlips: totalSlipCount,
      format: 'excel',
      headerRowIndex,
      nameColumn: detectedNameColumn
    }
  }
}

/**
 * 自动检测姓名列
 * @param {Array} header - 表头行
 * @returns {number} 列索引，-1 表示未找到
 */
function autoDetectNameColumn(header) {
  if (!header || header.length === 0) return -1

  const nameKeywords = [
    '姓名', '名字', '员工姓名', '员工', 'name', 'employee',
    'username', 'user_name', 'staff_name', 'customer', '客户姓名'
  ]

  for (let i = 0; i < header.length; i++) {
    const cell = header[i]
    if (!cell) continue

    const cellStr = String(cell).toLowerCase().trim()

    for (const keyword of nameKeywords) {
      if (cellStr.includes(keyword.toLowerCase())) {
        return i
      }
    }
  }

  // 如果找不到关键词，假设第一列是姓名
  return 0
}

/**
 * 导出工资条为多 Sheet Excel 文件
 * @param {Array} wageSlips - 工资条数组
 * @param {Object} options - 导出选项
 * @returns {Promise<boolean>} 是否成功
 */
export async function exportWageSlipsToExcel(wageSlips, options = {}) {
  const { filename = `工资条_${Date.now()}` } = options

  const XLSX = await import('xlsx')

  const workbook = XLSX.utils.book_new()

  for (let i = 0; i < wageSlips.length; i++) {
    const slip = wageSlips[i]
    const worksheet = XLSX.utils.aoa_to_sheet(slip.excelRow)

    // Sheet 名称最多 31 字符
    const sheetName = slip.employeeName.slice(0, 28) + `_${i + 1}`
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  }

  const wbout = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  })

  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })

  const { saveAs } = await import('file-saver')
  saveAs(blob, `${filename}.xlsx`)

  return true
}

export default splitWageSlip