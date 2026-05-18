// src/services/intent/__tests__/IntentEngine.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { analyzeColumns, resolveIntentRoute } from '../IntentEngine.js'

describe('IntentEngine', () => {
  describe('analyzeColumns', () => {
    it('应正确识别身份证列', () => {
      const data = [
        ['姓名', '身份证号', '电话'],
        ['张三', '110101199001011234', '13800138000']
      ]
      const result = analyzeColumns(data)

      expect(result.sensitiveColumns.idCard).toHaveLength(1)
      expect(result.sensitiveColumns.idCard[0].index).toBe(1)
      expect(result.sensitiveColumns.idCard[0].name).toBe('身份证号')
    })

    it('应正确识别手机号列', () => {
      const data = [
        ['姓名', '手机', '邮箱'],
        ['张三', '13800138000', 'test@example.com']
      ]
      const result = analyzeColumns(data)

      expect(result.sensitiveColumns.phone).toHaveLength(1)
      expect(result.sensitiveColumns.phone[0].index).toBe(1)
    })

    it('应正确识别邮箱列', () => {
      const data = [
        ['姓名', '手机', '邮箱'],
        ['张三', '13800138000', 'test@example.com']
      ]
      const result = analyzeColumns(data)

      expect(result.sensitiveColumns.email).toHaveLength(1)
      expect(result.sensitiveColumns.email[0].index).toBe(2)
    })

    it('应处理空数据', () => {
      const result = analyzeColumns([])
      expect(result.columns).toHaveLength(0)
      expect(result.sensitiveColumns.idCard).toHaveLength(0)
    })
  })

  describe('resolveIntentRoute', () => {
    it('应正确解析脱敏意图', () => {
      const intent = {
        intent: '脱敏',
        params: { actionId: 'mask-id', colIndex: 1 }
      }
      const result = resolveIntentRoute(intent)

      expect(result.taskId).toBe('mask')
      expect(result.actionId).toBe('mask-id')
      expect(result.maskType).toBe('partial')
      expect(result.colIndex).toBe(1)
    })

    it('应正确解析去重意图', () => {
      const intent = {
        intent: '去重',
        params: { actionId: 'dedup-exact' }
      }
      const result = resolveIntentRoute(intent)

      expect(result.taskId).toBe('dedup')
      expect(result.actionId).toBe('dedup-exact')
      expect(result.keepStrategy).toBe('first')
    })
  })
})