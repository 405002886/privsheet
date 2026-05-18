/**
 * 姓名脱敏
 * 支持中国姓名和外国姓名的脱敏处理
 * @param {Array[]} data - 二维数组数据
 * @param {Object} options - 选项 { colIndex: number, maskType: 'partial' | 'full' | 'initial' }
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function maskName(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const colIndex = options.colIndex ?? -1
  const maskType = options.maskType || 'partial'
  let affectedCount = 0

  /**
   * 检测是否为中文姓名
   * 规则：全部由中文字符组成，长度2-20
   */
  function isChineseName(name) {
    return /^[一-龥]{2,20}$/.test(name)
  }

  /**
   * 检测是否为英文姓名
   * 规则：由英文字母和空格组成，单词数量1-5个
   */
  function isEnglishName(name) {
    return /^[a-zA-Z\s]{2,50}$/.test(name) && name.trim().split(/\s+/).length <= 5
  }

  /**
   * 检测是否为混合姓名（中日韩+英文）
   * 如 "约翰·史密斯" 或 "Smith约翰"
   */
  function isMixedName(name) {
    return /[一-龥]/.test(name) && /[a-zA-Z]/.test(name)
  }

  /**
   * 获取姓名类型
   * @returns 'chinese' | 'english' | 'mixed'
   */
  function getNameType(name) {
    if (isChineseName(name)) return 'chinese'
    if (isEnglishName(name)) return 'english'
    if (isMixedName(name)) return 'mixed'
    return 'unknown'
  }

  /**
   * 脱敏中文姓名
   * 规则：保留姓氏（第一个字符），名字用*替代
   * 如：张三 -> 张*，欧阳娜娜 -> 欧***娜*
   */
  function maskChineseName(name, type) {
    if (maskType === 'full') {
      return '*'.repeat(name.length)
    }

    if (name.length === 2) {
      // 双字名：张三 -> 张*
      return name[0] + '*'
    } else if (name.length === 3) {
      // 三字名：张三丰 -> 张**丰
      return name[0] + '**' + name[2]
    } else if (name.length === 4) {
      // 四字复姓：欧阳修 -> 欧***修
      return name.substring(0, 2) + '**' + name.substring(3)
    } else {
      // 超长名字：取首尾，中间用*替代
      return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
    }
  }

  /**
   * 脱敏英文姓名
   * 规则：
   * - 单单词（名）：保留首字母，如 John -> J***
   * - 两个单词（名+姓）：各保留首字母，如 John Doe -> J*** D***
   * - 三个单词：保留首字母，如 John Smith Doe -> J*** S*** D***
   * - 末字母保留：使整体长度不变，如 John -> J*hn
   */
  function maskEnglishName(name, type) {
    if (maskType === 'full') {
      return '*'.repeat(name.length)
    }

    const parts = name.trim().split(/\s+/)
    return parts.map(part => {
      if (part.length === 1) {
        return part[0] + '***'
      } else if (part.length === 2) {
        return part[0] + '*'
      } else if (part.length === 3) {
        return part[0] + '*' + part[2]
      } else {
        // 4个字符以上：保留首字母和末字母，中间用*替代
        return part[0] + '*'.repeat(part.length - 2) + part[part.length - 1]
      }
    }).join(' ')
  }

  /**
   * 脱敏混合姓名（中日韩+英文）
   * 尽量分离中英文部分分别处理
   */
  function maskMixedName(name, type) {
    if (maskType === 'full') {
      return '*'.repeat(name.length)
    }

    // 尝试分离中英文部分
    let result = name

    // 处理中文部分（保留首尾，中间脱敏）
    result = result.replace(/[一-龥]{2,}/g, (match) => {
      if (match.length === 2) return match[0] + '*'
      if (match.length === 3) return match[0] + '*' + match[2]
      return match[0] + '*'.repeat(match.length - 2) + match[match.length - 1]
    })

    // 处理英文部分
    result = result.replace(/[a-zA-Z]{2,}/g, (match) => {
      if (match.length <= 3) {
        return match[0] + '*'.repeat(match.length - 1)
      }
      return match[0] + '*'.repeat(match.length - 2) + match[match.length - 1]
    })

    return result
  }

  /**
   * 主脱敏函数
   */
  function maskSingleName(name) {
    const trimmed = name.trim()
    if (!trimmed) return trimmed

    const nameType = getNameType(trimmed)

    switch (nameType) {
      case 'chinese':
        return maskChineseName(trimmed, nameType)
      case 'english':
        return maskEnglishName(trimmed, nameType)
      case 'mixed':
        return maskMixedName(trimmed, nameType)
      default:
        // 无法识别的格式：如果是纯字母，按英文处理；否则返回原文
        if (/^[a-zA-Z]+$/.test(trimmed)) {
          return maskEnglishName(trimmed, 'english')
        }
        return trimmed
    }
  }

  const result = data.map((row, rowIndex) => {
    if (!row) return []
    return row.map((cell, cellIndex) => {
      // 跳过表头行
      if (rowIndex > 0 && (colIndex === -1 || colIndex === cellIndex) && typeof cell === 'string') {
        const trimmed = cell.trim()
        // 简单检测是否为姓名（排除纯数字、邮箱等）
        if (trimmed.length >= 2 && trimmed.length <= 50 &&
            !/^\d+$/.test(trimmed) &&
            !/^[\w.-]+@[\w.-]+\.\w+$/.test(trimmed) &&
            !/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(trimmed)) {

          // 检测是否像姓名
          const nameType = getNameType(trimmed)
          if (nameType !== 'unknown') {
            affectedCount++
            return maskSingleName(trimmed)
          }
        }
      }
      return cell
    })
  })

  return {
    success: true,
    data: result,
    info: { maskedCount: affectedCount }
  }
}
