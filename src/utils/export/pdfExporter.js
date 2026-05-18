/**
 * PDF 导出工具
 *
 * 使用 pdfmake 生成 PDF 文件
 */

import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

// 初始化 pdfmake 字体（支持中文）
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs

/**
 * 导出工资条为 PDF
 * @param {Array} wageSlips - 工资条数组
 * @param {Object} options - PDF 选项
 * @param {string} options.filename - 文件名（不含扩展名）
 * @param {string} options.orientation - 'portrait' | 'landscape'，默认 'portrait'
 * @param {number} options.fontSize - 字体大小，默认 10
 * @param {boolean} options.showHeaderOnEachPage - 每页显示表头，默认 true
 * @returns {Promise<{ success: boolean, blob: Blob, error?: string }>}
 */
export async function exportWageSlipsToPdf(wageSlips, options = {}) {
  const {
    filename = `工资条_${Date.now()}`,
    orientation = 'portrait',
    fontSize = 10,
    showHeaderOnEachPage = true
  } = options

  if (!wageSlips || wageSlips.length === 0) {
    return { success: false, blob: null, error: '没有可导出的工资条数据' }
  }

  // 构建 PDF 内容
  const content = []

  for (let i = 0; i < wageSlips.length; i++) {
    const slip = wageSlips[i]

    // 每个工资条：表头行 + 数据行
    const tableBody = [
      // 表头行（加粗）
      slip.header.map(cell => ({
        text: String(cell ?? ''),
        fontSize,
        bold: true,
        alignment: 'center'
      })),
      // 数据行
      slip.data.map(cell => ({
        text: String(cell ?? ''),
        fontSize,
        alignment: 'center'
      }))
    ]

    // 添加工资条表格
    const tableEntry = {
      table: {
        headerRows: 1,
        widths: Array(tableBody[0].length).fill('*'),
        body: tableBody
      },
      layout: 'lightHorizontalLines',
      margin: [0, i > 0 && showHeaderOnEachPage ? 20 : 0, 0, 0]
    }

    content.push(tableEntry)
  }

  // 创建文档定义
  const docDefinition = {
    pageOrientation: orientation,
    content,
    defaultStyle: {
      fontSize
    },
    // 页脚设置
    footer: (currentPage, pageCount) => ({
      text: `第 ${currentPage} / ${pageCount} 页`,
      alignment: 'center',
      margin: [0, 10, 0, 0],
      fontSize: 8
    })
  }

  // 使用 download 方法直接下载
  return new Promise((resolve, reject) => {
    try {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition)

      // 使用 download 方法并指定文件名
      pdfDocGenerator.download(filename, (blob) => {
        if (blob) {
          resolve({
            success: true,
            blob,
            filename: `${filename}.pdf`
          })
        } else {
          reject(new Error('PDF blob 为空'))
        }
      })
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * 导出通用表格数据为 PDF
 * @param {Array[]} data - 二维数组数据（第一行为表头）
 * @param {Object} options - PDF 选项
 * @param {string} options.filename - 文件名（不含扩展名）
 * @param {string} options.title - PDF 标题
 * @param {string} options.orientation - 'portrait' | 'landscape'
 * @param {number} options.fontSize - 字体大小
 */
export async function exportTableToPdf(data, options = {}) {
  const {
    filename = `导出_${Date.now()}`,
    title = '',
    orientation = 'portrait',
    fontSize = 10
  } = options

  if (!data || data.length === 0) {
    return { success: false, blob: null, error: '没有可导出的数据' }
  }

  try {
    const header = data[0]
    const body = data.slice(1)

    const content = []

    // 添加标题
    if (title) {
      content.push({
        text: title,
        fontSize: fontSize + 4,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 20]
      })
    }

    // 构建表格
    const tableBody = [
      // 表头行
      header.map(cell => ({
        text: String(cell ?? ''),
        fontSize,
        bold: true,
        fillColor: '#f0f0f0'
      }))
    ]

    // 数据行
    for (const row of body) {
      tableBody.push(
        row.map(cell => ({
          text: String(cell ?? ''),
          fontSize
        }))
      )
    }

    content.push({
      table: {
        headerRows: 1,
        widths: Array(header.length).fill('*'),
        body: tableBody
      },
      layout: 'lightHorizontalLines'
    })

    const docDefinition = {
      pageOrientation: orientation,
      content,
      defaultStyle: { fontSize }
    }

    const pdfDocGenerator = pdfMake.createPdf(docDefinition)

    return new Promise((resolve) => {
      pdfDocGenerator.getBlob((blob) => {
        resolve({
          success: true,
          blob,
          filename: `${filename}.pdf`
        })
      })
    })
  } catch (error) {
    return {
      success: false,
      blob: null,
      error: `PDF生成失败: ${error.message}`
    }
  }
}

/**
 * 下载 blob 文件
 * @param {Blob} blob - Blob 对象
 * @param {string} filename - 文件名
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default {
  exportWageSlipsToPdf,
  exportTableToPdf,
  downloadBlob
}