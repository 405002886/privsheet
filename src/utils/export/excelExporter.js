/**
 * Excel 高保真导出模块
 * 使用 ExcelJS 实现完整样式克隆
 *
 * @description 支持克隆源文件的字体、填充、边框、列宽、行高、
 *              合并单元格、条件格式、数据验证等所有样式
 */

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

/**
 * 从 ArrayBuffer 读取源文件样式
 * @param {ArrayBuffer|Uint8Array} buffer - 文件数据
 * @returns {Promise<ExcelJS.Workbook>}
 */
export async function readWorkbookWithStyles(buffer) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  return workbook
}

/**
 * 克隆单元格样式（精确版本）
 * @param {ExcelJS.Cell} sourceCell - 源单元格
 * @param {ExcelJS.Cell} targetCell - 目标单元格
 */
function cloneCellStyle(sourceCell, targetCell) {
  if (!sourceCell) return

  // 字体克隆
  if (sourceCell.font) {
    targetCell.font = {
      name: sourceCell.font.name,
      size: sourceCell.font.size,
      bold: sourceCell.font.bold,
      italic: sourceCell.font.italic,
      underline: sourceCell.font.underline,
      strike: sourceCell.font.strike,
      color: sourceCell.font.color ? { argb: sourceCell.font.color.argb } : undefined
    }
  }

  // 填充克隆
  if (sourceCell.fill && sourceCell.fill.type) {
    targetCell.fill = {
      type: sourceCell.fill.type,
      pattern: sourceCell.fill.pattern,
      fgColor: sourceCell.fill.fgColor ? { argb: sourceCell.fill.fgColor.argb } : undefined,
      bgColor: sourceCell.fill.bgColor ? { argb: sourceCell.fill.bgColor.argb } : undefined
    }
  }

  // 边框克隆
  if (sourceCell.border) {
    const border = {}
    const sides = ['top', 'left', 'bottom', 'right', 'diagonal']
    sides.forEach(side => {
      if (sourceCell.border[side]) {
        border[side] = {
          style: sourceCell.border[side].style,
          color: sourceCell.border[side].color ? { argb: sourceCell.border[side].color.argb } : undefined
        }
      }
    })
    targetCell.border = border
  }

  // 对齐方式克隆
  if (sourceCell.alignment) {
    targetCell.alignment = {
      horizontal: sourceCell.alignment.horizontal,
      vertical: sourceCell.alignment.vertical,
      wrapText: sourceCell.alignment.wrapText,
      indent: sourceCell.alignment.indent,
      textRotation: sourceCell.alignment.textRotation
    }
  }

  // 数字格式克隆
  if (sourceCell.numFmt) {
    targetCell.numFmt = sourceCell.numFmt
  }
}

/**
 * 克隆列宽
 * @param {ExcelJS.Worksheet} sourceSheet - 源工作表
 * @param {ExcelJS.Worksheet} targetSheet - 目标工作表
 */
function cloneColumnWidths(sourceSheet, targetSheet) {
  if (!sourceSheet.columns) return

  sourceSheet.columns.forEach((col, index) => {
    const targetCol = targetSheet.getColumn(index + 1)
    if (col.width) {
      targetCol.width = col.width
    }
    if (col.hidden !== undefined) {
      targetCol.hidden = col.hidden
    }
    // 克隆列的样式
    if (col.style) {
      targetCol.style = col.style
    }
  })
}

/**
 * 克隆行高
 * @param {ExcelJS.Worksheet} sourceSheet - 源工作表
 * @param {ExcelJS.Worksheet} targetSheet - 目标工作表
 * @param {number} rowCount - 数据行数
 */
function cloneRowHeights(sourceSheet, targetSheet, rowCount) {
  if (!sourceSheet.model?.rows) return

  const sourceRows = sourceSheet.model.rows
  for (let i = 0; i < rowCount; i++) {
    const sourceRow = sourceRows[i]
    if (sourceRow) {
      const targetRow = targetSheet.getRow(i + 1)
      if (sourceRow.height) {
        targetRow.height = sourceRow.height
      }
      if (sourceRow.hidden !== undefined) {
        targetRow.hidden = sourceRow.hidden
      }
    }
  }
}

/**
 * 克隆合并单元格
 * @param {ExcelJS.Worksheet} sourceSheet - 源工作表
 * @param {ExcelJS.Worksheet} targetSheet - 目标工作表
 */
function cloneMerges(sourceSheet, targetSheet) {
  if (!sourceSheet.model?.merges || !sourceSheet.model.merges.length) return

  sourceSheet.model.merges.forEach(merge => {
    try {
      targetSheet.mergeCells(merge)
    } catch (e) {
      console.warn('合并单元格克隆失败:', merge, e.message)
    }
  })
}

/**
 * 克隆条件格式
 * @param {ExcelJS.Worksheet} sourceSheet - 源工作表
 * @param {ExcelJS.Worksheet} targetSheet - 目标工作表
 */
function cloneConditionalFormatting(sourceSheet, targetSheet) {
  if (!sourceSheet.conditionalFormats?.items?.length) return

  sourceSheet.conditionalFormats.items.forEach(cf => {
    try {
      targetSheet.addConditionalFormat({
        ref: cf.ref,
        rules: cf.rules
      })
    } catch (e) {
      console.warn('条件格式克隆失败:', cf.ref, e.message)
    }
  })
}

/**
 * 克隆数据验证
 * @param {ExcelJS.Worksheet} sourceSheet - 源工作表
 * @param {ExcelJS.Worksheet} targetSheet - 目标工作表
 */
function cloneDataValidation(sourceSheet, targetSheet) {
  if (!sourceSheet.dataValidations?.items?.length) return

  sourceSheet.dataValidations.items.forEach(dv => {
    try {
      const validation = {
        type: dv.type,
        allowBlank: dv.allowBlank,
        showDropDown: dv.showDropDown,
        sqref: dv.sqref
      }
      if (dv.formulae1) validation.formulae1 = dv.formulae1
      if (dv.formulae2) validation.formulae2 = dv.formulae2
      targetSheet.addDataValidation(validation)
    } catch (e) {
      console.warn('数据验证克隆失败:', dv.sqref, e.message)
    }
  })
}

/**
 * 精确克隆每个单元格的样式（同步版本）
 * @param {ExcelJS.Worksheet} sourceSheet - 源工作表
 * @param {ExcelJS.Worksheet} targetSheet - 目标工作表
 * @param {number} dataRowCount - 数据行数
 */
function cloneCellStylesExact(sourceSheet, targetSheet, dataRowCount) {
  if (!sourceSheet.model?.cells) return

  const cells = sourceSheet.model.cells

  // cells 是一个稀疏数组，每个元素是 { r: row, c: col, s: styleIndex }
  // 或者直接是行对象
  if (Array.isArray(cells)) {
    cells.forEach(cellData => {
      if (cellData && typeof cellData === 'object') {
        const row = cellData.r ?? cellData.row
        const col = cellData.c ?? cellData.col
        const styleIndex = cellData.s ?? cellData.style

        if (row !== undefined && col !== undefined) {
          const targetCell = targetSheet.getCell(row + 1, col + 1)
          if (styleIndex !== undefined && sourceSheet.model?.styles) {
            // 从样式表获取完整样式
            const fullStyle = sourceSheet.model.styles[styleIndex]
            if (fullStyle) {
              applyFullStyle(targetCell, fullStyle, sourceSheet)
            }
          }
        }
      }
    })
  }
}

/**
 * 精确克隆每个单元格的样式（异步分片版本）
 * @param {ExcelJS.Worksheet} sourceSheet - 源工作表
 * @param {ExcelJS.Worksheet} targetSheet - 目标工作表
 * @param {number} dataRowCount - 数据行数
 */
async function cloneCellStylesExactAsync(sourceSheet, targetSheet, dataRowCount) {
  if (!sourceSheet.model?.cells) return

  const cells = sourceSheet.model.cells
  const CHUNK_SIZE = 5000

  if (Array.isArray(cells)) {
    for (let i = 0; i < cells.length; i++) {
      const cellData = cells[i]
      if (cellData && typeof cellData === 'object') {
        const row = cellData.r ?? cellData.row
        const col = cellData.c ?? cellData.col
        const styleIndex = cellData.s ?? cellData.style

        if (row !== undefined && col !== undefined) {
          const targetCell = targetSheet.getCell(row + 1, col + 1)
          if (styleIndex !== undefined && sourceSheet.model?.styles) {
            const fullStyle = sourceSheet.model.styles[styleIndex]
            if (fullStyle) {
              applyFullStyle(targetCell, fullStyle, sourceSheet)
            }
          }
        }
      }
      // 每 CHUNK_SIZE 个单元格让出主线程
      if (i > 0 && i % CHUNK_SIZE === 0) {
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }
  }
}

/**
 * 应用完整样式对象到单元格
 * @param {ExcelJS.Cell} cell - 目标单元格
 * @param {Object} style - 完整样式对象
 * @param {ExcelJS.Worksheet} sourceSheet - 源工作表（用于获取字体、填充等定义）
 */
function applyFullStyle(cell, style, sourceSheet) {
  if (!style) return

  // 字体
  if (style.font && sourceSheet.workbook) {
    const fonts = sourceSheet.workbook.model?.fonts
    if (fonts && style.font >= 0 && fonts[style.font]) {
      const fontDef = fonts[style.font]
      cell.font = {
        name: fontDef.name,
        size: fontDef.sz,
        bold: fontDef.b,
        italic: fontDef.i,
        underline: fontDef.u ? { type: 'single' } : undefined,
        strike: fontDef.strike,
        color: fontDef.color ? { argb: fontDef.color.rgb || fontDef.color.argb } : undefined
      }
    }
  }

  // 填充
  if (style.fill && sourceSheet.workbook) {
    const fills = sourceSheet.workbook.model?.fills
    if (fills && style.fill >= 0 && fills[style.fill]) {
      const fillDef = fills[style.fill]
      if (fillDef.patternType) {
        cell.fill = {
          type: 'pattern',
          pattern: fillDef.patternType,
          fgColor: fillDef.fgColor ? { argb: fillDef.fgColor.rgb || fillDef.fgColor.argb } : undefined,
          bgColor: fillDef.bgColor ? { argb: fillDef.bgColor.rgb || fillDef.bgColor.argb } : undefined
        }
      }
    }
  }

  // 边框
  if (style.border && sourceSheet.workbook) {
    const borders = sourceSheet.workbook.model?.borders
    if (borders && style.border >= 0 && borders[style.border]) {
      const borderDef = borders[style.border]
      const border = {}
      const sides = ['top', 'left', 'bottom', 'right', 'diagonal']
      sides.forEach(side => {
        if (borderDef[side]) {
          border[side] = {
            style: borderDef[side].style,
            color: borderDef[side].color ? { argb: borderDef[side].color.rgb || borderDef[side].color.argb } : undefined
          }
        }
      })
      cell.border = border
    }
  }

  // 对齐
  if (style.alignment) {
    cell.alignment = {
      horizontal: style.alignment.horizontal,
      vertical: style.alignment.vertical,
      wrapText: style.alignment.wrapText,
      indent: style.alignment.indent
    }
  }

  // 数字格式
  if (style.numFmt) {
    cell.numFmt = style.numFmt
  }
}

/**
 * 使用源文件样式导出数据（精确版本）
 *
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 导出选项
 * @param {ArrayBuffer|Uint8Array} [options.sourceBuffer] - 源文件 buffer（用于提取样式）
 * @param {string} [options.filename='export'] - 文件名（不含扩展名）
 * @param {string} [options.sheetName='Sheet1'] - 工作表名称
 * @param {number} [options.sourceSheetIndex=0] - 源工作表索引
 * @param {number[]} [options.headerRows] - 哪些行是表头行（从0开始），这些行会使用源文件第0行的样式
 * @returns {Promise<boolean>}
 */
export async function exportToExcelWithStyles(data, options = {}) {
  const {
    sourceBuffer = null,
    filename = 'export',
    sheetName = 'Sheet1',
    sourceSheetIndex = 0,
    headerRows = []  // 默认空数组，表示每个位置按源文件对应行克隆样式
  } = options

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(sheetName)

  // 源工作表引用
  let sourceSheet = null

  // 如果有源文件，先读取并克隆样式结构
  if (sourceBuffer) {
    try {
      const sourceWB = await readWorkbookWithStyles(sourceBuffer)
      sourceSheet = sourceWB.worksheets[sourceSheetIndex]

      if (sourceSheet) {
        // 克隆列宽
        cloneColumnWidths(sourceSheet, worksheet)
        // 克隆合并单元格
        cloneMerges(sourceSheet, worksheet)
        // 克隆条件格式
        cloneConditionalFormatting(sourceSheet, worksheet)
        // 克隆数据验证
        cloneDataValidation(sourceSheet, worksheet)
      }
    } catch (e) {
      console.warn('源文件样式读取失败，将仅导出数据:', e.message)
    }
  }

  // 分片写入数据，让浏览器有时间渲染加载动画
  const CHUNK_SIZE = 5000
  async function writeDataChunked() {
    if (data && data.length > 0) {
      for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
        const row = data[rowIdx]
        for (let colIdx = 0; colIdx < row.length; colIdx++) {
          try {
            const cell = worksheet.getCell(rowIdx + 1, colIdx + 1)
            cell.value = row[colIdx]
          } catch (e) {
            console.warn(`写入单元格 (${rowIdx + 1}, ${colIdx + 1}) 失败:`, e.message)
          }
        }
        // 每 CHUNK_SIZE 行让出主线程，让浏览器渲染加载动画
        if (rowIdx > 0 && rowIdx % CHUNK_SIZE === 0) {
          await new Promise(resolve => setTimeout(resolve, 0))
        }
      }
    }
  }

  // 分片克隆样式
  async function cloneStylesChunked() {
    if (sourceSheet && data.length > 0) {
      try {
        if (sourceSheet.model?.cells) {
          await cloneCellStylesExactAsync(sourceSheet, worksheet, data.length)
        }

        const maxCol = data.length > 0 ? data.reduce((max, r) => Math.max(max, r.length), 0) : 0
        for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
          for (let colIdx = 0; colIdx < maxCol; colIdx++) {
            try {
              const sourceRowIdx = headerRows.includes(rowIdx) ? 0 : rowIdx
              const sourceCell = sourceSheet.getCell(sourceRowIdx + 1, colIdx + 1)
              const targetCell = worksheet.getCell(rowIdx + 1, colIdx + 1)
              cloneCellStyle(sourceCell, targetCell)
            } catch (e) {
              // 忽略超出范围的单元格
            }
          }
          if (rowIdx > 0 && rowIdx % CHUNK_SIZE === 0) {
            await new Promise(resolve => setTimeout(resolve, 0))
          }
        }
      } catch (e) {
        console.warn('单元格样式精确克隆失败:', e.message)
      }
    }
  }

  // 克隆行高
  if (sourceSheet && data.length > 0) {
    try {
      cloneRowHeights(sourceSheet, worksheet, data.length)
    } catch (e) {
      console.warn('行高克隆失败:', e.message)
    }
  }

  // 分片写入和克隆
  await writeDataChunked()
  await cloneStylesChunked()

  // 生成文件并触发下载
  try {
    // ExcelJS 4.x 使用 writeBuffer() 获取 ArrayBuffer，然后转换为 Blob
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    saveAs(blob, `${filename}.xlsx`)
    return true
  } catch (e) {
    console.error('Excel文件生成或下载失败:', e)
    throw new Error('Excel文件生成失败: ' + e.message)
  }
}

/**
 * 预设样式导出（不依赖源文件，使用内置样式模板）
 *
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 导出选项
 * @param {string} [options.filename='export'] - 文件名（不含扩展名）
 * @param {string} [options.sheetName='Sheet1'] - 工作表名称
 * @param {string[]} [options.headers=[]] - 表头配置
 * @param {boolean} [options.styled=true] - 是否应用预设样式
 * @returns {Promise<boolean>}
 */
export async function exportToExcelStyled(data, options = {}) {
  const {
    filename = 'export',
    sheetName = 'Sheet1',
    headers = [],
    styled = true
  } = options

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(sheetName)

  // 表头样式配置
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, name: '微软雅黑', size: 12 },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF00D4AA' }
    },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin', color: { argb: 'FF00D4AA' } },
      left: { style: 'thin', color: { argb: 'FF00D4AA' } },
      bottom: { style: 'thin', color: { argb: 'FF00D4AA' } },
      right: { style: 'thin', color: { argb: 'FF00D4AA' } }
    }
  }

  // 数据行样式配置
  const dataStyleEven = {
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF8F8F8' }
    },
    border: {
      top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
    },
    alignment: { vertical: 'middle' }
  }

  const dataStyleOdd = {
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFFFFF' }
    },
    border: {
      top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
    },
    alignment: { vertical: 'middle' }
  }

  // 添加表头
  if (headers.length > 0) {
    const headerRow = worksheet.addRow(headers)
    headerRow.eachCell(cell => {
      Object.assign(cell, headerStyle)
    })
    headerRow.height = 30
  }

  // 逐格写入数据行（确保单元格引用精确）
  if (data && data.length > 0) {
    for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
      const row = data[rowIdx]
      const worksheetRow = worksheet.getRow(headers.length > 0 ? rowIdx + 2 : rowIdx + 1)
      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const cell = worksheetRow.getCell(colIdx + 1)
        cell.value = row[colIdx]

        if (styled) {
          const isOdd = rowIdx % 2 === 0
          const style = isOdd ? dataStyleOdd : dataStyleEven
          cell.font = { name: '微软雅黑', size: 11 }
          Object.assign(cell, JSON.parse(JSON.stringify(style)))
        }
      }
      if (styled) {
        worksheetRow.height = 25
      }
    }
  }

  // 自动列宽
  worksheet.columns.forEach((column, colIndex) => {
    let maxLength = headers[colIndex]?.length || 10
    column.eachCell?.(cell => {
      if (cell.value) {
        const length = cell.value.toString().length
        if (length > maxLength) {
          maxLength = Math.min(length, 50)
        }
      }
    })
    column.width = maxLength + 4
  })

  // 生成文件并触发下载
  try {
    // ExcelJS 4.x 使用 writeBuffer() 获取 ArrayBuffer，然后转换为 Blob
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    saveAs(blob, `${filename}.xlsx`)
    return true
  } catch (e) {
    console.error('Excel文件生成或下载失败:', e)
    throw new Error('Excel文件生成失败: ' + e.message)
  }
}

/**
 * 兼容性别名 - 标记为废弃
 * @deprecated 请使用 exportToExcelWithStyles 或 exportToExcelStyled
 */
export function exportToExcel(data, options = {}) {
  // 兼容模式：尝试使用 exportToExcelStyled
  return exportToExcelStyled(data, options)
}

/**
 * 多Sheet导出 - 将多个二维数组导出为一个包含多个Sheet的Excel文件
 * @param {Array<{ name: string, data: Array[] }>} sheets - Sheet列表，每个Sheet包含名称和二维数组数据
 * @param {Object} options - 导出选项
 * @param {string} [options.filename='export'] - 文件名（不含扩展名）
 * @returns {Promise<boolean>}
 */
export async function exportToExcelMultiSheet(sheets, options = {}) {
  const { filename = 'export' } = options

  const workbook = new ExcelJS.Workbook()

  // 表头样式配置
  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' }, name: '微软雅黑', size: 12 },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF00D4AA' }
    },
    alignment: { horizontal: 'center', vertical: 'middle' },
    border: {
      top: { style: 'thin', color: { argb: 'FF00D4AA' } },
      left: { style: 'thin', color: { argb: 'FF00D4AA' } },
      bottom: { style: 'thin', color: { argb: 'FF00D4AA' } },
      right: { style: 'thin', color: { argb: 'FF00D4AA' } }
    }
  }

  // 数据行样式
  const dataStyleEven = {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8F8' } },
    border: {
      top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
    },
    alignment: { vertical: 'middle' }
  }

  const dataStyleOdd = {
    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
    border: {
      top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
    },
    alignment: { vertical: 'middle' }
  }

  for (const sheet of sheets) {
    // Sheet名称清理：移除Excel不允许的字符 * ? : \ / [ ]，最长31字符
    let sheetName = sheet.name.replace(/[*?:\\\/\[\]]/g, '_')
    sheetName = sheetName.length > 31 ? sheetName.substring(0, 31) : sheetName
    const worksheet = workbook.addWorksheet(sheetName)

    if (!sheet.data || sheet.data.length === 0) continue

    // 写入数据
    for (let rowIdx = 0; rowIdx < sheet.data.length; rowIdx++) {
      const row = sheet.data[rowIdx]
      const worksheetRow = worksheet.getRow(rowIdx + 1)
      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const cell = worksheetRow.getCell(colIdx + 1)
        cell.value = row[colIdx]

        // 表头行样式
        if (rowIdx === 0) {
          Object.assign(cell, headerStyle)
        } else {
          // 数据行样式
          const isOdd = rowIdx % 2 === 0
          const style = isOdd ? dataStyleOdd : dataStyleEven
          cell.font = { name: '微软雅黑', size: 11 }
          Object.assign(cell, JSON.parse(JSON.stringify(style)))
        }
      }
      if (rowIdx === 0) {
        worksheetRow.height = 30
      } else {
        worksheetRow.height = 25
      }
    }

    // 自动列宽
    worksheet.columns.forEach((column, colIndex) => {
      let maxLength = 10
      column.eachCell?.(cell => {
        if (cell.value) {
          const length = cell.value.toString().length
          if (length > maxLength) {
            maxLength = Math.min(length, 50)
          }
        }
      })
      column.width = maxLength + 4
    })
  }

  // 生成文件并触发下载
  try {
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    saveAs(blob, `${filename}.xlsx`)
    return true
  } catch (e) {
    console.error('多Sheet Excel文件生成失败:', e)
    throw new Error('Excel文件生成失败: ' + e.message)
  }
}

export default {
  exportToExcelWithStyles,
  exportToExcelStyled,
  exportToExcel,
  readWorkbookWithStyles
}
