<template>
  <div class="intent-input-wrapper">
    <div class="intent-input-container">
      <input
        v-model="query"
        @keyup.enter="handleSearch"
        @input="handleInput"
        :placeholder="t('intent.placeholder')"
        class="intent-input"
        :class="{ focused: isFocused }"
      />
      <button
        @click="handleSearch"
        class="intent-btn"
        :disabled="!query.trim() || isParsing"
      >
        <svg v-if="isParsing" class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span v-else>↵</span>
      </button>
    </div>

    <!-- 解析状态指示 -->
    <Transition name="slide">
      <div v-if="isParsing" class="parsing-indicator">
        <span class="parsing-dot"></span>
        {{ t('intent.parsing') }}
      </div>
    </Transition>

    <!-- 等待文件上传提示 -->
    <Transition name="slide">
      <div v-if="hasPendingIntent && !isParsing && !parseResult" class="intent-preview waiting">
        <div class="waiting-content">
          <span class="waiting-icon">📋</span>
          <span class="waiting-text">{{ t('intent.waitingForFile') }}</span>
        </div>
        <button class="btn-confirm" @click="confirmIntent">
          {{ t('intent.confirm') }}
        </button>
      </div>
    </Transition>

    <!-- 解析结果预览 -->
    <Transition name="slide">
      <div v-if="parseResult && !isParsing" class="intent-preview">
        <div class="preview-header">
          <span class="preview-badge" :class="{ pipeline: parseResult.isPipeline }">
            {{ parseResult.isPipeline ? t('intent.multiAction') : t('intent.singleAction') }}
          </span>
          <button class="btn-confirm" @click="confirmIntent">
            {{ t('intent.confirm') }}
          </button>
        </div>
        <div class="intent-list">
          <span
            v-for="(intent, idx) in displayIntents"
            :key="idx"
            class="intent-tag"
            :class="{ active: selectedIntentIndex === idx, exclusive: isExclusiveOperation(intent.params?.actionId) }"
            @click="selectIntent(idx)"
          >
            {{ getActionDisplayName(intent) }}
            <span class="confidence">{{ (intent.confidence * 100).toFixed(0) }}%</span>
          </span>
        </div>
        <div class="intent-hint" v-if="parseResult.isPipeline && exclusiveCount > 0">
          {{ t('intent.exclusiveFiltered', { count: exclusiveCount }) }}
        </div>
        <div class="intent-hint" v-else-if="parseResult.isPipeline">
          {{ t('intent.autoExecute') }}
        </div>
      </div>
    </Transition>

    <!-- 无法识别时的建议 -->
    <Transition name="slide">
      <div v-if="showSuggestions && !isParsing && !parseResult" class="suggestion-panel">
        <div class="suggestion-header">
          <span>{{ t('intent.suggestionsLabel') }}</span>
          <button class="btn-close" @click="showSuggestions = false">×</button>
        </div>
        <div class="suggestion-list">
          <button
            v-for="suggestion in currentSuggestions"
            :key="suggestion.text"
            class="suggestion-item"
            @click="applySuggestion(suggestion.text)"
          >
            {{ suggestion.text }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { resolveIntentRoute, generatePipelineFromIntents } from '@/services/intent/IntentEngine.js'
import { extractColumnHints, extractMultiColumnHints, QUICK_RULES, EXTENDED_RULES, ACTION_DISPLAY_KEYS } from '@/services/intent/intentConfig.js'
import { useFileStore } from '@/stores/fileStore'

/**
 * 多文件独占操作列表（不支持多步骤管道）
 * 这些操作需要多文件上传，只适合单功能执行
 */
const EXCLUSIVE_OPERATIONS = [
  'merge-append',
  'merge-horizontal',
  'lookup-match'
]

/**
 * 检查操作是否为独占性操作
 */
function isExclusiveOperation(actionId) {
  return EXCLUSIVE_OPERATIONS.includes(actionId)
}

const router = useRouter()
const { t, locale } = useI18n()
const fileStore = useFileStore()

const query = ref('')
const isParsing = ref(false)
const isFocused = ref(false)
const parseResult = ref(null)
const selectedIntentIndex = ref(0)
const showSuggestions = ref(false)

// 计算属性：所有意图（独占性操作仍显示在预览中，仅在生成管道步骤时过滤）
const displayIntents = computed(() => {
  if (!parseResult.value?.intents) return []
  return parseResult.value.intents
})

// 计算属性：独占性操作的数量
const exclusiveCount = computed(() => {
  if (!parseResult.value?.intents) return 0
  return parseResult.value.intents.filter(intent => {
    const actionId = intent.params?.actionId
    return actionId && isExclusiveOperation(actionId)
  }).length
})

// 中英文建议列表
const suggestions = {
  zh: [
    { text: '隐藏身份证号' },
    { text: '去掉重复行' },
    { text: '合并两个文件' },
    { text: '按逗号分割' },
    { text: '排序姓名' },
    { text: '转成JSON' }
  ],
  en: [
    { text: 'mask ID number' },
    { text: 'remove duplicates' },
    { text: 'merge two files' },
    { text: 'split by comma' },
    { text: 'sort by name' },
    { text: 'convert to JSON' }
  ]
}

// 根据当前语言返回建议
const currentSuggestions = computed(() => {
  return suggestions[locale.value] || suggestions.zh
})

// 是否有待处理的意图（已输入文字但等待文件上传）
const hasPendingIntent = computed(() => {
  return fileStore.pendingIntentQuery && !fileStore.hasFile && !parseResult.value
})

function handleInput() {
  // 用户输入时隐藏之前的解析结果
  if (parseResult.value) {
    parseResult.value = null
  }
  // 如果用户清空了输入，同时清空待处理意图
  if (!query.value.trim()) {
    fileStore.clearPendingIntent()
  }
}

async function handleSearch() {
  if (!query.value.trim()) {
    showSuggestions.value = true
    return
  }

  isParsing.value = true
  parseResult.value = null
  showSuggestions.value = false

  try {
    // 保存用户的查询文字
    fileStore.setPendingIntentQuery(query.value)

    // 如果已有文件数据，立即解析（带上文件数据以获取列信息）
    if (fileStore.hasFile) {
      const fileData = fileStore.workbookData?.sheets?.[0]?.data || null
      const result = await parseIntent(query.value, fileData)

      if (!result.success) {
        fileStore.clearPendingIntent()
        showSuggestions.value = true
        return
      }

      parseResult.value = result
      selectedIntentIndex.value = 0
      fileStore.setPendingIntentResult(result)
    } else {
      // 没有文件：先规则快速匹配，未命中则回退 ML 模型分类
      const quickResult = quickMatchRules(query.value)
      if (quickResult && quickResult.length > 0) {
        const steps = quickResult.map((intent, idx) => ({
          id: `step_${idx}`,
          operation: intent.params.actionId,
          name: intent.intent,
          params: intent.params,
          enabled: true
        }))
        fileStore.setPendingPipelineSteps(steps)

        // 构建预览结果对象，与 parseIntent 返回结构一致
        parseResult.value = {
          success: true,
          intents: quickResult,
          isSingle: quickResult.length === 1,
          isPipeline: quickResult.length > 1,
          detectedLang: quickResult.length > 0 && /[一-鿿]/.test(quickResult[0].intent) ? 'zh' : 'en',
          confidence: 1.0
        }
        selectedIntentIndex.value = 0
      } else {
        // 规则未匹配，尝试 ML 模型分类（无文件数据）
        console.log('[IntentInput] 规则未命中，启用 ML 模型分类...')
        const mlResult = await parseIntent(query.value, null)
        if (mlResult.success) {
          parseResult.value = mlResult
          selectedIntentIndex.value = 0
        } else {
          // ML 也失败，清除待处理意图，显示建议
          fileStore.clearPendingIntent()
          parseResult.value = null
          showSuggestions.value = true
        }
      }
    }
  } catch (error) {
    console.error('意图解析失败:', error)
    fileStore.clearPendingIntent()
    showSuggestions.value = true
  } finally {
    isParsing.value = false
  }
}

/**
 * 规则快速匹配 - 同步版本（用于无文件时）
 * 增强：从输入文本提取列名提示和操作子类型参数
 * 先尝试 QUICK_RULES（精确匹配），未命中则尝试 EXTENDED_RULES（模糊匹配）
 * @param {string} input - 用户输入
 * @returns {Array|null} - 匹配的意图数组（含列名提示和子类型参数）
 */
function quickMatchRules(input) {
  const lower = input.toLowerCase()
  const matchedIntents = []

  // 1. 优先尝试 QUICK_RULES（精确匹配）
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

  // 2. 如果 QUICK_RULES 未命中，尝试 EXTENDED_RULES（模糊匹配）
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

  // 去重：同意图保留第一个匹配（规则列表已按具体→通用排列）
  const seen = new Set()
  const unique = matchedIntents.filter(item => {
    if (seen.has(item.intent)) return false
    seen.add(item.intent)
    return true
  })

  if (unique.length === 0) return null

  // ========== 增强：提取列名提示和子类型参数 ==========
  // 多意图时按文本片段分别提取列名
  const columnHints = unique.length > 1
    ? extractMultiColumnHints(input, unique)
    : [extractColumnHints(input)]

  for (let i = 0; i < unique.length; i++) {
    const hint = columnHints[i] || {}
    // 合并列名提示
    if (hint.suggestedColName) {
      unique[i].params.suggestedColName = hint.suggestedColName
    }
    // 合并子类型参数（规则中的 params 优先级更高，不覆盖已有值）
    if (hint.subTypeParams) {
      for (const [key, value] of Object.entries(hint.subTypeParams)) {
        if (!(key in unique[i].params)) {
          unique[i].params[key] = value
        }
      }
    }
  }

  return unique
}

/**
 * 获取操作的显示名称（根据语言设置返回对应语言）
 * @param {Object} intent - 意图对象
 * @returns {string} 国际化后的显示名称
 */
function getActionDisplayName(intent) {
  const actionId = intent.params?.actionId

  // 优先使用 actionId 对应的国际化 key
  if (actionId && ACTION_DISPLAY_KEYS[actionId]) {
    const key = ACTION_DISPLAY_KEYS[actionId]
    const translated = t(key)
    // 如果翻译结果等于 key，说明翻译失败，返回 enIntent 或 intent
    if (translated === key) {
      return locale.value === 'en' && intent.enIntent ? intent.enIntent : intent.intent
    }
    return translated
  }

  // 如果没有对应的 actionId，根据当前语言返回 enIntent 或 intent
  if (locale.value === 'en' && intent.enIntent) {
    return intent.enIntent
  }

  return intent.intent
}

function selectIntent(index) {
  selectedIntentIndex.value = index
}

function confirmIntent() {
  // 如果没有待处理的意图查询（用户可能没按回车直接点了确认），先保存查询文字
  if (!fileStore.pendingIntentQuery && query.value.trim()) {
    fileStore.setPendingIntentQuery(query.value)
  }

  // 如果有待处理的意图查询但还没有解析结果
  if (fileStore.pendingIntentQuery && !parseResult.value) {
    // 多文件操作：直接跳转功能页面（和手动点击首页卡片一样）
    const quickResult = quickMatchRules(fileStore.pendingIntentQuery)
    if (quickResult && quickResult.length > 0) {
      const multiFileIntent = quickResult.find(i => isExclusiveOperation(i.params?.actionId))
      if (multiFileIntent) {
        navigateToMultiFileTask(multiFileIntent)
        return
      }
    }
    // 非多文件操作：跳转到上传步骤，等上传完成后再解析
    router.push({
      name: 'task',
      params: { taskId: 'custom' },
      query: {
        actionId: 'pipeline',
        auto: 'true',
        intentQuery: fileStore.pendingIntentQuery
      }
    })
    return
  }

  if (!parseResult.value) return

  const result = parseResult.value

  // 多文件操作（lookup/merge）：直接跳转功能页面，不走管道逻辑
  const multiFileIntent = result.intents.find(i => isExclusiveOperation(i.params?.actionId))
  if (multiFileIntent) {
    navigateToMultiFileTask(multiFileIntent)
    return
  }

  // 单意图：直接跳转功能页面
  if (result.isSingle) {
    navigateToSingleIntent(result.intents[selectedIntentIndex.value])
    return
  }

  // 多意图且不包含多文件操作：跳转到管道配置页
  const steps = generatePipelineFromIntents(result.intents)
  fileStore.setPendingPipelineSteps(steps)
  navigateToPipeline(result.intents)
}

/**
 * 多文件操作跳转：和手动点击首页功能卡片一样，只传 taskId，不带 auto/actionId
 * 让 TaskPage 正常走选择操作→上传文件→配置的完整流程
 */
function navigateToMultiFileTask(intent) {
  const config = resolveIntentRoute(intent)
  // 清除意图状态，避免 TaskPage onMounted 从 fileStore 恢复管道步骤
  fileStore.clearPendingIntent()
  router.push({
    name: 'task',
    params: { taskId: config.taskId }
  })
}

function navigateToSingleIntent(intent) {
  const config = resolveIntentRoute(intent)

  const queryParams = {
    actionId: config.actionId,
    auto: 'true',
    ...Object.fromEntries(
      Object.entries(config).filter(([key]) => key !== 'taskId' && key !== 'actionId')
    )
  }

  // 传递列名提示和子类型参数
  if (intent.params.suggestedColName) {
    queryParams.suggestedColName = intent.params.suggestedColName
  }

  router.push({
    name: 'task',
    params: { taskId: config.taskId },
    query: queryParams
  })
}

function navigateToPipeline(intents) {
  // 如果 fileStore 中已经有 steps（由 confirmIntent 设置），直接使用
  const storedSteps = fileStore.pendingPipelineSteps
  const steps = storedSteps || generatePipelineFromIntents(intents)

  router.push({
    name: 'task',
    params: { taskId: 'custom' },
    query: {
      actionId: 'pipeline',
      auto: 'true',
      steps: JSON.stringify(steps)
    }
  })
}

function applySuggestion(text) {
  query.value = text
  showSuggestions.value = false
  handleSearch()
}
</script>

<style scoped>
.intent-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.intent-input-container {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-card, #141c25);
  border: 1px solid var(--border-color, #2a3441);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.intent-input-container:focus-within {
  border-color: var(--accent-primary, #00d4aa);
  box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
}

.intent-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 15px;
  color: var(--text-primary, #e8eaed);
  outline: none;
}

.intent-input::placeholder {
  color: var(--text-muted, #5c6370);
}

.intent-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: var(--accent-primary, #00d4aa);
  color: var(--bg-primary, #0a0e14);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.intent-btn:hover:not(:disabled) {
  background: #00f5c4;
  transform: translateY(-1px);
}

.intent-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 解析状态 */
.parsing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-secondary, #8b949e);
  background: var(--bg-secondary, #111820);
  border-radius: 8px;
}

.parsing-dot {
  width: 8px;
  height: 8px;
  background: var(--accent-primary, #00d4aa);
  border-radius: 50%;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

/* 解析结果预览 */
.intent-preview {
  padding: 16px;
  margin-top: 8px;
  background: var(--bg-secondary, #111820);
  border: 1px solid var(--border-color, #2a3441);
  border-radius: 12px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-badge {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  background: rgba(0, 212, 170, 0.15);
  color: var(--accent-primary, #00d4aa);
  border-radius: 4px;
}

.preview-badge.pipeline {
  background: rgba(255, 107, 53, 0.15);
  color: var(--accent-warning, #ff6b35);
}

.btn-confirm {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  background: var(--accent-primary, #00d4aa);
  color: var(--bg-primary, #0a0e14);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-confirm:hover {
  background: #00f5c4;
}

.intent-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.intent-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
  background: var(--bg-card, #141c25);
  border: 1px solid var(--border-color, #2a3441);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.intent-tag:hover {
  border-color: var(--accent-primary, #00d4aa);
}

.intent-tag.active {
  border-color: var(--accent-primary, #00d4aa);
  background: rgba(0, 212, 170, 0.1);
}

.intent-tag.exclusive {
  border-style: dashed;
  border-color: var(--accent-warning, #ff6b35);
}

.intent-tag.exclusive:hover {
  border-color: var(--accent-warning, #ff6b35);
  background: rgba(255, 107, 53, 0.1);
}

.confidence {
  font-size: 11px;
  color: var(--text-muted, #5c6370);
}

.intent-hint {
  margin-top: 12px;
  font-size: 12px;
  color: var(--text-muted, #5c6370);
}

/* 等待文件上传提示 */
.intent-preview.waiting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: rgba(0, 153, 255, 0.1);
  border: 1px solid rgba(0, 153, 255, 0.3);
  border-radius: 12px;
}

.waiting-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.waiting-icon {
  font-size: 18px;
}

.waiting-text {
  font-size: 13px;
  color: var(--accent-secondary, #0099ff);
}

/* 建议面板 */
.suggestion-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  padding: 16px;
  margin-top: 8px;
  background: var(--bg-card, #141c25);
  border: 1px solid var(--border-color, #2a3441);
  border-radius: 12px;
  z-index: 100;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--text-secondary, #8b949e);
}

.btn-close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--text-muted, #5c6370);
  font-size: 18px;
  cursor: pointer;
}

.suggestion-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-item {
  padding: 8px 14px;
  font-size: 13px;
  border: 1px solid var(--border-color, #2a3441);
  border-radius: 6px;
  background: transparent;
  color: var(--text-primary, #e8eaed);
  cursor: pointer;
  transition: all 0.2s ease;
}

.suggestion-item:hover {
  border-color: var(--accent-primary, #00d4aa);
  background: rgba(0, 212, 170, 0.05);
}

/* 过渡动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>