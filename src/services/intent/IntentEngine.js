/**
 * 意图引擎（纯规则匹配版本）
 * ML 模型功能已暂时移除，后续重新接入时恢复 @xenova/transformers 依赖
 * 1. 规则快速预检（高频意图）
 * 2. 文件内容辅助分析（列名推断）
 */
import {
  INTENT_CANDIDATES,
  QUICK_RULES,
  EXTENDED_RULES,
  INTENT_ORDER,
  ACTION_PREFILL_MAP,
  INTENT_OPERATION_MAP,
  INTENT_MAP,
  getTaskIdByAction,
  getCanonicalIntent,
  detectLanguage
} from './intentConfig.js'

/**
 * 解析用户意图（纯规则匹配）
 * @param {string} userInput - 用户输入的自然语言
 * @param {Array[]} [fileData] - 可选的二维数组文件数据（用于辅助分析）
 * @returns {Promise<IntentResult>}
 */
export async function parseIntent(userInput, fileData = null) {
  const input = userInput.trim()
  if (!input) {
    return { success: false, error: '输入为空' }
  }

  // 检测输入语言
  const detectedLang = detectLanguage(input)

  // 规则快速匹配
  const ruleResults = quickMatchRules(input)
  if (ruleResults && ruleResults.length > 0) {
    // 如果有文件数据，辅助列名分析
    if (fileData) {
      const columnAnalysis = analyzeColumns(fileData)
      enrichIntentWithColumnInfo(ruleResults, columnAnalysis, detectedLang)
    }

    if (ruleResults.length === 1) {
      return {
        success: true,
        intents: ruleResults,
        isSingle: true,
        isPipeline: false,
        detectedLang,
        confidence: ruleResults[0].confidence
      }
    }
    return {
      success: true,
      intents: ruleResults,
      isSingle: false,
      isPipeline: true,
      detectedLang
    }
  }

  return { success: false, error: '规则未匹配，暂不支持ML模型分类' }
}

/**
 * 规则快速匹配 - 支持多意图
 * @param {string} input - 用户输入
 * @returns {Intent[]|null}
 */
function quickMatchRules(input) {
  const lower = input.toLowerCase()
  const matchedIntents = []

  for (const rule of QUICK_RULES) {
    const matched = rule.patterns.every(p => p.test(lower))
    if (matched) {
      matchedIntents.push({
        intent: rule.intent,
        enIntent: rule.enIntent,
        confidence: 1.0,
        params: { ...rule.params },
        matchedBy: 'rule'
      })
    }
  }

  if (matchedIntents.length === 0) {
    for (const rule of EXTENDED_RULES) {
      const matched = rule.patterns.every(p => p.test(lower))
      if (matched) {
        matchedIntents.push({
          intent: rule.intent,
          enIntent: rule.enIntent,
          confidence: 0.85,
          params: { ...rule.params },
          matchedBy: 'extended-rule'
        })
      }
    }
  }

  const uniqueIntents = deduplicateIntents(matchedIntents)
  return uniqueIntents.length === 0 ? null : uniqueIntents
}

function deduplicateIntents(intents) {
  const seen = new Map()
  for (const intent of intents) {
    const key = intent.intent
    if (!seen.has(key) || intent.confidence > seen.get(key).confidence) {
      seen.set(key, intent)
    }
  }
  return Array.from(seen.values())
}

/**
 * 分析文件列名
 * @param {Array[]} data - 二维数组数据
 * @returns {ColumnAnalysis}
 */
export function analyzeColumns(data) {
  if (!data || data.length === 0) {
    return {
      columns: [],
      sensitiveColumns: {
        idCard: [],
        phone: [],
        email: [],
        name: []
      }
    }
  }

  const headers = data[0] || []
  const columns = headers.map((name, index) => ({
    index,
    name: String(name || '').toLowerCase(),
    sample: data[1]?.[index] || ''
  }))

  return {
    columns,
    sensitiveColumns: {
      idCard: columns.filter(c => /身份证/.test(c.name)),
      idCardEn: columns.filter(c => /id.?card|national.?id|identity.?no/i.test(c.name)),
      phone: columns.filter(c => /手机|电话/.test(c.name)),
      phoneEn: columns.filter(c => /phone|mobile|telephone|cell/i.test(c.name)),
      email: columns.filter(c => /邮箱|邮件/.test(c.name)),
      emailEn: columns.filter(c => /email|e-mail/i.test(c.name)),
      name: columns.filter(c => /姓名|名字/.test(c.name)),
      nameEn: columns.filter(c => /name|username|full.?name/i.test(c.name))
    }
  }
}

function enrichIntentWithColumnInfo(intents, analysis, detectedLang = 'zh') {
  const { sensitiveColumns } = analysis

  for (const intent of intents) {
    const canonicalIntent = getCanonicalIntent(intent.intent)

    switch (canonicalIntent) {
      case 'mask':
      case '脱敏':
        if (detectedLang === 'zh') {
          if (sensitiveColumns.idCard?.length > 0) {
            Object.assign(intent.params, { actionId: 'mask-id', colIndex: sensitiveColumns.idCard[0].index })
          } else if (sensitiveColumns.phone?.length > 0) {
            Object.assign(intent.params, { actionId: 'mask-phone', colIndex: sensitiveColumns.phone[0].index })
          } else if (sensitiveColumns.email?.length > 0) {
            Object.assign(intent.params, { actionId: 'mask-email', colIndex: sensitiveColumns.email[0].index })
          } else if (sensitiveColumns.name?.length > 0) {
            Object.assign(intent.params, { actionId: 'mask-name', colIndex: sensitiveColumns.name[0].index })
          }
        } else {
          if (sensitiveColumns.idCardEn?.length > 0) {
            Object.assign(intent.params, { actionId: 'mask-id', colIndex: sensitiveColumns.idCardEn[0].index })
          } else if (sensitiveColumns.phoneEn?.length > 0) {
            Object.assign(intent.params, { actionId: 'mask-phone', colIndex: sensitiveColumns.phoneEn[0].index })
          } else if (sensitiveColumns.emailEn?.length > 0) {
            Object.assign(intent.params, { actionId: 'mask-email', colIndex: sensitiveColumns.emailEn[0].index })
          } else if (sensitiveColumns.nameEn?.length > 0) {
            Object.assign(intent.params, { actionId: 'mask-name', colIndex: sensitiveColumns.nameEn[0].index })
          }
        }
        if (!intent.params.actionId) {
          intent.params.actionId = 'mask-id'
        }
        break

      case 'dedup':
      case '去重':
        if (!intent.params.actionId) intent.params.actionId = 'dedup-exact'
        break

      case 'merge':
      case '合并':
        if (!intent.params.actionId) intent.params.actionId = 'merge-append'
        break

      case 'split':
      case '分割':
        if (!intent.params.actionId || intent.params.actionId === 'split-delimiter') {
          intent.params.actionId = 'split-delimiter'
        }
        break

      case 'sort':
      case '排序':
        if (!intent.params.actionId) intent.params.actionId = 'sort-asc'
        break

      case 'convert':
      case '格式转换':
        if (!intent.params.actionId) intent.params.actionId = 'to-json'
        break

      case 'calc':
      case '计算':
        if (!intent.params.actionId) intent.params.actionId = 'calculate-sum'
        break

      case 'lookup':
      case '查找匹配':
        if (!intent.params.actionId) intent.params.actionId = 'lookup-match'
        break

      case 'clean':
      case '清洗':
        if (!intent.params.actionId) intent.params.actionId = 'trim-whitespace'
        break
    }
  }
}

const EXCLUSIVE_OPERATIONS = ['merge-append', 'merge-horizontal', 'lookup-match']

function isExclusiveOperation(actionId) {
  return EXCLUSIVE_OPERATIONS.includes(actionId)
}

/**
 * 根据意图列表自动生成管道步骤
 */
export function generatePipelineFromIntents(intents) {
  const filteredIntents = intents.filter(intent => {
    const actionId = intent.params?.actionId
    if (actionId && isExclusiveOperation(actionId)) {
      console.warn(`[IntentEngine] 独占性操作 "${actionId}" 已从管道中移除`)
      return false
    }
    return true
  })

  return filteredIntents
    .sort((a, b) => (INTENT_ORDER[a.intent] || 5) - (INTENT_ORDER[b.intent] || 5))
    .map((intent, index) => ({
      id: `step_${index}`,
      operation: intent.params.actionId,
      name: intent.intent,
      params: buildStepParams(intent.params),
      enabled: true
    }))
}

function buildStepParams(params) {
  const { actionId, intent, ...rest } = params
  return rest
}

/**
 * 解析意图配置获取路由参数
 */
export function resolveIntentRoute(intent) {
  const actionId = intent.params.actionId
  let taskId = getTaskIdByAction(actionId)

  if (!taskId) {
    const canonicalIntent = intent.intent
    const intentConfig = INTENT_OPERATION_MAP[canonicalIntent] || INTENT_MAP[canonicalIntent]
    if (intentConfig && intentConfig.taskId) {
      taskId = intentConfig.taskId
    }
  }

  if (!taskId) {
    taskId = 'custom'
  }

  const prefillParams = ACTION_PREFILL_MAP[actionId] || {}
  if (intent.params.colIndex !== undefined) {
    prefillParams.colIndex = intent.params.colIndex
  }

  return { taskId, actionId, ...prefillParams }
}