<template>
  <div class="pipeline-step" :class="{ 'is-disabled': !step.enabled }">
    <!-- 步骤序号 -->
    <div class="step-number">{{ index + 1 }}</div>

    <!-- 连接线 -->
    <div class="step-connector" v-if="index < total - 1">
      <div class="connector-line"></div>
    </div>

    <!-- 步骤内容 -->
    <div class="step-content">
      <div class="step-header">
        <div class="step-info">
          <span class="step-icon">
            <component :is="getStepIcon(step.operation)" :size="20" :stroke-width="1.5" />
          </span>
          <span class="step-name">{{ step.name || step.operation }}</span>
        </div>
        <div class="step-actions">
          <button class="btn-toggle" @click="$emit('toggle')" :title="step.enabled ? t('pipelineStep.disable') : t('pipelineStep.enable')">
            <component :is="step.enabled ? Eye : EyeOff" :size="14" :stroke-width="1.5" />
          </button>
          <button class="btn-move" @click="$emit('move-up')" :disabled="index === 0" :title="t('pipelineStep.moveUp')">
            <ArrowUp :size="14" :stroke-width="1.5" />
          </button>
          <button class="btn-move" @click="$emit('move-down')" :disabled="index === total - 1" :title="t('pipelineStep.moveDown')">
            <ArrowDown :size="14" :stroke-width="1.5" />
          </button>
          <button class="btn-remove" @click="$emit('remove')" :title="t('pipelineStep.remove')">
            <span>×</span>
          </button>
          <button class="btn-edit" @click="$emit('edit')" :title="t('pipelineStep.edit')">
            <span>✎</span>
          </button>
        </div>
      </div>
      <div class="step-detail">
        <span class="step-operation">{{ getOperationLabel(step.operation) }}</span>
        <span class="step-params" v-if="hasParams">{{ getParamsSummary() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
// Lucide 图标导入
import {
  Trash2, Key, UserX, Smartphone, Mail, User,
  Scissors, Link, Search, RefreshCw,
  ArrowUp, ArrowDown, Calendar, Target,
  Eye, EyeOff
} from 'lucide-vue-next'

const { t } = useI18n()

const props = defineProps({
  step: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update', 'remove', 'toggle', 'move-up', 'move-down', 'edit'])

// 图标映射
const iconMap = {
  'dedup-exact': Trash2,
  'dedup-key': Key,
  'mask-id': UserX,
  'mask-phone': Smartphone,
  'mask-email': Mail,
  'mask-name': User,
  'split-delimiter': Scissors,
  'merge': Link,
  'trim-whitespace': Search,
  'replace-text': RefreshCw,
  'to-upper': ArrowUp,
  'to-lower': ArrowDown,
  'normalize-dates': Calendar,
  'round-numbers': Target,
  'remove-empty-rows': Trash2,
  'sort-data': ArrowUp,
  'remove-empty-cols': Trash2,
  'remove-all-spaces': Search,
  'remove-special-chars': Search,
  'sort-asc': ArrowUp,
  'sort-desc': ArrowDown,
  'shuffle': ArrowUp,
  'to-csv': Mail,
  'to-json': Mail,
  'to-sql-insert': Mail,
  'to-sql-inquery': Search,
  'column-to-string': Mail,
  'calculate-sum': ArrowUp,
  'calculate-count': ArrowUp,
  'calculate-avg': ArrowUp,
  'calculate-max': ArrowUp,
  'calculate-min': ArrowDown,
  'batch-math': ArrowUp,
  'group-summary': ArrowUp,
  'pipeline': ArrowUp,
  'replace-text': RefreshCw,
  'letter-mapping': ArrowUp,
  'custom-mask': ArrowUp,
  'to-upper': ArrowUp,
  'to-lower': ArrowDown,
  'capitalize': ArrowUp,
  'convert-width': ArrowUp,
  'round-numbers': Target
}

const operationLabels = computed(() => ({
  'dedup-exact': t('operations.dedup-exact'),
  'dedup-key': t('operations.dedup-key'),
  'mask-id': t('operations.mask-id'),
  'mask-phone': t('operations.mask-phone'),
  'mask-email': t('operations.mask-email'),
  'mask-name': t('operations.mask-name'),
  'custom-mask': t('operations.custom-mask'),
  'split-delimiter': t('operations.split-delimiter'),
  'split-width': t('operations.split-width'),
  'merge': t('operations.merge'),
  'trim-whitespace': t('operations.trim-whitespace'),
  'remove-all-spaces': t('operations.remove-all-spaces'),
  'remove-empty-rows': t('operations.remove-empty-rows'),
  'remove-empty-cols': t('operations.remove-empty-cols'),
  'remove-special-chars': t('operations.remove-special-chars'),
  'replace-text': t('operations.replace-text'),
  'letter-mapping': t('operations.letter-mapping'),
  'to-upper': t('operations.to-upper'),
  'to-lower': t('operations.to-lower'),
  'capitalize': t('operations.capitalize'),
  'normalize-dates': t('operations.normalize-dates'),
  'round-numbers': t('operations.round-numbers'),
  'convert-width': t('operations.convert-width'),
  'transpose': t('operations.transpose'),
  'extract-regex': t('operations.extract-regex'),
  'column-to-string': t('operations.column-to-string'),
  'calculate-sum': t('operations.calculate-sum'),
  'calculate-count': t('operations.calculate-count'),
  'calculate-avg': t('operations.calculate-avg'),
  'calculate-max': t('operations.calculate-max'),
  'calculate-min': t('operations.calculate-min'),
  'batch-math': t('operations.batch-math'),
  'group-summary': t('operations.group-summary'),
  'sort-asc': t('operations.sort-asc'),
  'sort-desc': t('operations.sort-desc'),
  'shuffle': t('operations.shuffle'),
  'to-csv': t('operations.to-csv'),
  'to-json': t('operations.to-json'),
  'to-sql-insert': t('operations.to-sql-insert'),
  'to-sql-inquery': t('operations.to-sql-inquery'),
  'merge-append': t('operations.merge-append'),
  'merge-horizontal': t('operations.merge-horizontal'),
  'lookup-match': t('operations.lookup-match'),
  'wage-slip-split': t('operations.wage-slip-split'),
  'pipeline': t('operations.pipeline')
}))

function getStepIcon(operation) {
  return iconMap[operation] || ArrowUp
}

function getOperationLabel(operation) {
  return operationLabels.value[operation] || operation
}

const hasParams = computed(() => {
  const params = props.step.params || {}
  return Object.keys(params).some(key => {
    const val = params[key]
    if (val === null || val === undefined || val === '' || val === false) return false
    if (Array.isArray(val) && val.length === 0) return false
    // 跳过默认值
    if (key === 'colIndex' && val === -1) return false
    if (key === 'keepStrategy' && val === 'first') return false
    if (key === 'maskType' && val === 'quick') return false
    if (key === 'quickMode' && val === 'keep-2-sides') return false
    if (key === 'type' && val === 'toHalfWidth') return false
    if (key === 'decimals' && val === 0) return false
    if (key === 'targetFormat' && val === 'YYYY-MM-DD') return false
    if (key === 'delimiter' && val === ',') return false
    if (key === 'replaceWith' && val === '***') return false
    if (key === 'exportFormat' && val === 'excel') return false
    return true
  })
})

function getParamsSummary() {
  const params = props.step.params || {}
  const parts = []
  const op = props.step.operation

  // ========== 单列脱敏操作（身份证、手机、邮箱、姓名）==========
  if (op === 'mask-id' || op === 'mask-phone' || op === 'mask-email' || op === 'mask-name') {
    if (params.colIndex !== undefined && params.colIndex !== -1) {
      parts.push(t('pipelineStep.columnIndex', { index: params.colIndex + 1 }))
    }
    if (params.maskType) {
      const maskTypeKey = 'pipelineStep.maskTypes.' + params.maskType
      const translated = t(maskTypeKey)
      parts.push(translated !== maskTypeKey ? translated : params.maskType)
    }
    return parts.join(' | ')
  }

  // ========== 自定义脱敏 ==========
  if (op === 'custom-mask') {
    if (params.colIndex !== undefined && params.colIndex !== -1) {
      parts.push(t('pipelineStep.columnIndex', { index: params.colIndex + 1 }))
    }
    if (params.maskType === 'quick') {
      parts.push(t('pipelineStep.quick'))
      if (params.quickMode) {
        parts.push(t('pipelineStep.quickMode.' + params.quickMode))
      }
    } else {
      parts.push(t('pipelineStep.regexMode'))
      if (params.pattern) {
        parts.push(params.pattern)
      }
    }
    if (params.replaceWith && params.replaceWith !== '***') {
      parts.push('→' + params.replaceWith)
    }
    return parts.join(' | ')
  }

  // ========== 分隔符拆分 ==========
  if (op === 'split-delimiter') {
    if (params.colIndex !== undefined) {
      parts.push(t('pipelineStep.columnIndex', { index: params.colIndex + 1 }))
    }
    if (params.delimiter) {
      const delimiterLabel = params.delimiter === ',' ? t('pipelineStep.delimiterComma') : (params.delimiter === '|' ? t('pipelineStep.delimiterPipe') : params.delimiter)
      parts.push(t('pipelineStep.delimiter', { value: delimiterLabel }))
    }
    return parts.join(' | ')
  }

  // ========== 按宽度拆分 ==========
  if (op === 'split-width') {
    if (params.colIndex !== undefined) {
      parts.push(t('pipelineStep.columnIndex', { index: params.colIndex + 1 }))
    }
    if (params.widthsStr) {
      parts.push(t('pipelineStep.widths') + ':' + params.widthsStr)
    }
    return parts.join(' | ')
  }

  // ========== 合并列 ==========
  if (op === 'merge') {
    if (params.colIndices && params.colIndices.length > 0) {
      parts.push(t('pipelineStep.columns') + ':' + params.colIndices.map(i => i + 1).join(','))
    }
    if (params.separator) {
      parts.push(t('pipelineStep.separator', { value: params.separator === ' ' ? t('pipelineStep.space') : params.separator }))
    }
    return parts.join(' | ')
  }

  // ========== 去重 ==========
  if (op === 'dedup-exact') {
    if (params.keepStrategy) {
      parts.push(t('pipelineStep.keepStrategy.' + params.keepStrategy))
    }
    return parts.join(' | ')
  }
  if (op === 'dedup-key') {
    if (params.colIndices && params.colIndices.length > 0) {
      parts.push(t('pipelineStep.keyColumns') + ':' + params.colIndices.map(i => i + 1).join(','))
    }
    if (params.keepStrategy) {
      parts.push(t('pipelineStep.keepStrategy.' + params.keepStrategy))
    }
    return parts.join(' | ')
  }

  // ========== 文本替换 ==========
  if (op === 'replace-text') {
    if (params.search !== undefined && params.search !== '') {
      parts.push('"' + params.search + '"')
    }
    if (params.replace !== undefined && params.replace !== '') {
      parts.push('→ "' + params.replace + '"')
    }
    return parts.join(' | ')
  }

  // ========== 字母映射 ==========
  if (op === 'letter-mapping') {
    if (params.letterMapping) {
      parts.push(t('pipelineStep.mapping') + ':' + params.letterMapping)
    }
    return parts.join(' | ')
  }

  // ========== 数字修约 ==========
  if (op === 'round-numbers') {
    if (params.colIndex !== undefined && params.colIndex !== -1) {
      parts.push(t('pipelineStep.columnIndex', { index: params.colIndex + 1 }))
    }
    if (params.decimals !== undefined) {
      parts.push(t('pipelineStep.decimals') + ':' + params.decimals)
    }
    return parts.join(' | ')
  }

  // ========== 全角半角转换 ==========
  if (op === 'convert-width') {
    if (params.type) {
      parts.push(t('pipelineStep.convertWidth.' + params.type))
    }
    return parts.join(' | ')
  }

  // ========== 日期格式化 ==========
  if (op === 'normalize-dates') {
    if (params.colIndex !== undefined && params.colIndex !== -1) {
      parts.push(t('pipelineStep.columnIndex', { index: params.colIndex + 1 }))
    }
    if (params.targetFormat) {
      parts.push(params.targetFormat)
    }
    return parts.join(' | ')
  }

  // ========== 正则提取 ==========
  if (op === 'extract-regex') {
    if (params.pattern) {
      parts.push(t('pipelineStep.regex', { pattern: params.pattern }))
    }
    return parts.join(' | ')
  }

  // ========== 排序 ==========
  if (op === 'sort-asc') {
    if (params.colIndex !== undefined) {
      parts.push(t('pipelineStep.columnIndex', { index: params.colIndex + 1 }))
    }
    parts.push(t('pipelineStep.order.asc'))
    return parts.join(' | ')
  }
  if (op === 'sort-desc') {
    if (params.colIndex !== undefined) {
      parts.push(t('pipelineStep.columnIndex', { index: params.colIndex + 1 }))
    }
    parts.push(t('pipelineStep.order.desc'))
    return parts.join(' | ')
  }

  // ========== SQL 导出 ==========
  if (op === 'to-sql-insert' || op === 'to-sql-inquery') {
    if (params.tableName) {
      parts.push(t('pipelineStep.toTable') + ':' + params.tableName)
    }
    return parts.join(' | ')
  }

  // ========== 批量数学运算 ==========
  if (op === 'batch-math') {
    if (params.colIndex !== undefined) {
      parts.push(t('pipelineStep.columnIndex', { index: params.colIndex + 1 }))
    }
    if (params.operator && params.mathValue !== undefined) {
      parts.push(t('pipelineStep.mathOp', { operator: params.operator, value: params.mathValue }))
    }
    return parts.join(' | ')
  }

  // ========== 分组汇总 ==========
  if (op === 'group-summary') {
    if (params.groupColumn !== undefined) {
      parts.push(t('pipelineStep.groupBy') + ':' + (params.groupColumn + 1))
    }
    if (params.aggType) {
      parts.push(t('pipelineStep.aggType.' + params.aggType))
    }
    return parts.join(' | ')
  }

  // ========== 特殊字符清理 ==========
  if (op === 'remove-special-chars') {
    if (params.removeChars) {
      parts.push(t('pipelineStep.removeChars') + ':' + params.removeChars)
    } else {
      parts.push(t('pipelineStep.removeChars'))
    }
    return parts.join(' | ')
  }

  // ========== 工资条拆分 ==========
  if (op === 'wage-slip-split') {
    if (params.nameColumn !== undefined) {
      parts.push(t('pipelineStep.nameColumn') + ':' + (params.nameColumn + 1))
    }
    if (params.exportFormat) {
      parts.push(t('pipelineStep.exportFormat.' + params.exportFormat))
    }
    return parts.join(' | ')
  }

  // ========== 简单操作：转大写/转小写/首字母大写/去空格/去空白行/去空白列/洗牌/转置 ==========
  if (op === 'to-upper' || op === 'to-lower' || op === 'capitalize' ||
      op === 'trim-whitespace' || op === 'remove-all-spaces' ||
      op === 'remove-empty-rows' || op === 'remove-empty-cols' ||
      op === 'shuffle' || op === 'transpose') {
    if (params.colIndex !== undefined && params.colIndex !== -1) {
      parts.push(t('pipelineStep.columnIndex', { index: params.colIndex + 1 }))
    }
    return parts.join(' | ')
  }

  // ========== 默认：显示所有有值的参数 ==========
  // 列索引（单列）
  if (params.colIndex !== undefined && params.colIndex !== -1) {
    parts.push(t('pipelineStep.columnIndex', { index: params.colIndex + 1 }))
  }
  // 列索引（多列）
  if (params.colIndices && params.colIndices.length > 0) {
    parts.push(t('pipelineStep.columnIndices', { indices: params.colIndices.map(i => i + 1).join(', ') }))
  }
  // 脱敏类型
  if (params.maskType) {
    const maskTypeKey = 'pipelineStep.maskTypes.' + params.maskType
    const translated = t(maskTypeKey)
    parts.push(translated !== maskTypeKey ? translated : params.maskType)
  }
  // 快速脱敏模式
  if (params.quickMode) {
    const quickModeKey = 'pipelineStep.quickMode.' + params.quickMode
    const translated = t(quickModeKey)
    parts.push(translated !== quickModeKey ? translated : params.quickMode)
  }
  // 分隔符
  if (params.delimiter) {
    parts.push(t('pipelineStep.delimiter', { value: params.delimiter }))
  }
  // 连接符
  if (params.separator) {
    parts.push(t('pipelineStep.separator', { value: params.separator }))
  }
  // 去重策略
  if (params.keepStrategy) {
    parts.push(params.keepStrategy === 'first' ? t('pipelineStep.keepFirst') : t('pipelineStep.keepLast'))
  }
  // 文本替换
  if (params.search !== undefined && params.search !== '') {
    parts.push(t('pipelineStep.replace', { search: params.search, replace: params.replace || '' }))
  }
  // 正则表达式
  if (params.pattern && params.pattern !== '') {
    parts.push('regex:' + params.pattern)
  }
  // 替换字符（自定义脱敏）
  if (params.replaceWith && params.replaceWith !== '***') {
    parts.push('→' + params.replaceWith)
  }
  // 数学运算
  if (params.operator && params.mathValue !== undefined) {
    parts.push(t('pipelineStep.mathOp', { operator: params.operator, value: params.mathValue }))
  }
  // 小数位数
  if (params.decimals !== undefined && params.decimals !== 0) {
    parts.push(t('pipeline.decimals', { n: params.decimals }))
  }
  // 分组列
  if (params.groupColumn !== undefined) {
    parts.push(t('pipeline.groupCol', { n: params.groupColumn + 1 }))
  }
  // 汇总类型
  if (params.aggType) {
    parts.push(t('pipelineStep.aggType.' + params.aggType))
  }
  // 表名
  if (params.tableName) {
    parts.push(params.tableName)
  }
  // 宽度拆分
  if (params.widthsStr) {
    parts.push(t('pipeline.width', { v: params.widthsStr }))
  }
  // 日期格式
  if (params.targetFormat && params.targetFormat !== 'YYYY-MM-DD') {
    parts.push(params.targetFormat)
  }
  // 移除字符
  if (params.removeChars) {
    parts.push(t('pipeline.removeChars', { v: params.removeChars }))
  }
  // 转换类型
  if (params.type && params.type !== 'toHalfWidth') {
    parts.push(params.type === 'toFullWidth' ? t('pipeline.fullWidth') : t('pipeline.halfWidth'))
  }
  // 工资条：姓名列
  if (params.nameColumn !== undefined) {
    parts.push(t('pipeline.nameCol', { n: params.nameColumn + 1 }))
  }
  // 字母映射
  if (params.letterMapping) {
    parts.push(t('pipeline.mapping', { v: params.letterMapping }))
  }

  return parts.join(' | ')
}
</script>

<style scoped>
/* ========== 深色赛博朋克风格变量 ========== */
.pipeline-step {
  --bg-primary: #0a0e14;
  --bg-secondary: #111820;
  --bg-card: #141c25;
  --bg-card-hover: #1a242f;
  --accent-primary: #00d4aa;
  --accent-secondary: #0099ff;
  --accent-danger: #ff4757;
  --text-primary: #e8eaed;
  --text-secondary: #8b949e;
  --text-muted: #5c6370;
  --border-color: #2a3441;

  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  animation: stepIn 0.4s ease-out;
}

@keyframes stepIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.pipeline-step.is-disabled {
  opacity: 0.5;
}

.step-number {
  width: 32px;
  height: 32px;
  background: var(--accent-primary);
  color: var(--bg-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  flex-shrink: 0;
  z-index: 1;
  box-shadow: 0 0 16px rgba(0, 212, 170, 0.4);
}

.pipeline-step.is-disabled .step-number {
  background: var(--text-muted);
  box-shadow: none;
}

.step-connector {
  position: absolute;
  left: 15px;
  top: 32px;
  width: 2px;
  height: calc(100% + 12px);
}

.connector-line {
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom, var(--accent-primary), var(--border-color));
}

.step-content {
  flex: 1;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.pipeline-step:hover .step-content {
  border-color: var(--accent-primary);
  background: var(--bg-card-hover);
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.step-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-icon {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.pipeline-step:hover .step-icon {
  transform: scale(1.1);
}

.step-name {
  font-size: 14px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  color: var(--text-primary);
}

.step-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.step-actions button {
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: var(--text-secondary);
}

.step-actions button:hover:not(:disabled) {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.1);
}

.step-actions button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-toggle {
  font-size: 12px !important;
}

.btn-remove {
  color: var(--accent-danger) !important;
  border-color: var(--accent-danger) !important;
}

.btn-remove:hover {
  background: var(--accent-danger) !important;
  color: #fff !important;
}

.btn-edit {
  color: var(--accent-secondary) !important;
  border-color: var(--accent-secondary) !important;
}

.btn-edit:hover {
  background: var(--accent-secondary) !important;
  color: #fff !important;
}

.step-detail {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-muted);
}

.step-params {
  background: rgba(0, 212, 170, 0.1);
  border: 1px solid rgba(0, 212, 170, 0.3);
  padding: 4px 10px;
  border-radius: 6px;
  color: var(--accent-primary);
}

.step-operation {
  color: var(--text-secondary);
}
</style>
