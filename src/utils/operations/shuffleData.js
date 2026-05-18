/**
 * 随机乱序
 * @param {Array[]} data - 二维数组数据
 * @returns {{ success: boolean, data: Array[], info: Object }}
 */
import { ErrorCodes } from '@/config/errorCodes'

export function shuffleData(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { success: false, data: [], info: { error: ErrorCodes.INVALID_DATA } }
  }

  const header = data[0]
  const rows = data.slice(1)

  // Fisher-Yates 洗牌算法
  const shuffledRows = [...rows]
  for (let i = shuffledRows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledRows[i], shuffledRows[j]] = [shuffledRows[j], shuffledRows[i]]
  }

  return {
    success: true,
    data: [header, ...shuffledRows],
    info: { shuffledCount: shuffledRows.length }
  }
}
