<template>
  <div class="lookup-wizard">
    <!-- 步骤1：上传主表 -->
    <div v-if="lookupStep === 'mainTable'" class="lookup-step">
      <h3>{{ t('task.tasks.lookup.uploadMainTable') }}</h3>
      <FileUploader
        :multiple="false"
        :drag-text="t('uploader.dragText')"
        :hint-text="t('uploader.hintText')"
        @file-selected="handleMainFileSelected"
        @error="handleError"
      />

      <!-- 已上传主表信息 -->
      <div v-if="mainFile" class="file-info">
        <div class="file-info-main">
          <span class="file-icon">📄</span>
          <span class="file-name">{{ mainFile.name }}</span>
          <span class="file-size">{{ formatFileSize(mainFile.size) }}</span>
          <span v-if="mainWorkbook" class="file-sheets">
            {{ mainWorkbook.sheetNames?.length || 0 }} Sheets
          </span>
        </div>
        <button class="btn-remove-file" @click="removeMainFile">{{ t('common.remove') }}</button>
      </div>

      <!-- 主表 Sheet 选择 -->
      <div v-if="mainWorkbook" class="sheet-select">
        <label class="config-label">{{ t('task.tasks.lookup.selectMainSheet') }}</label>
        <div class="sheet-options">
          <label
            v-for="(sheetName, idx) in mainWorkbook.sheetNames || []"
            :key="idx"
            class="sheet-option"
          >
            <input
              type="radio"
              :value="idx"
              v-model="selectedMainSheet"
            />
            <span>{{ sheetName }}</span>
          </label>
        </div>
      </div>

      <!-- 主表预览 -->
      <div v-if="mainSheetData.length > 0" class="table-preview">
        <h4>{{ t('task.tasks.lookup.mainTablePreview') }}</h4>
        <DataPreview :data="mainSheetData" :maxDisplayRows="5" />
      </div>

      <div class="step-actions">
        <button class="btn-secondary" @click="cancelLookup">{{ t('common.cancel') }}</button>
        <button
          class="btn-primary"
          :disabled="!mainFile || selectedMainSheet === null"
          @click="goToLookupTable"
        >
          {{ t('common.next') }}
        </button>
      </div>
    </div>

    <!-- 步骤2：上传查找表 -->
    <div v-if="lookupStep === 'lookupTable'" class="lookup-step">
      <h3>{{ t('task.tasks.lookup.uploadLookupTable') }}</h3>
      <FileUploader
        :multiple="false"
        :drag-text="t('uploader.dragLookupTable')"
        :hint-text="t('uploader.hintText')"
        @file-selected="handleLookupFileSelected"
        @error="handleError"
      />

      <!-- 已上传查找表信息 -->
      <div v-if="lookupFile" class="file-info">
        <div class="file-info-main">
          <span class="file-icon">📋</span>
          <span class="file-name">{{ lookupFile.name }}</span>
          <span class="file-size">{{ formatFileSize(lookupFile.size) }}</span>
          <span v-if="lookupWorkbook" class="file-sheets">
            {{ lookupWorkbook.sheetNames?.length || 0 }} Sheets
          </span>
        </div>
        <button class="btn-remove-file" @click="removeLookupFile">{{ t('common.remove') }}</button>
      </div>

      <!-- 查找表 Sheet 选择 -->
      <div v-if="lookupWorkbook" class="sheet-select">
        <label class="config-label">{{ t('task.tasks.lookup.selectLookupSheet') }}</label>
        <div class="sheet-options">
          <label
            v-for="(sheetName, idx) in lookupWorkbook.sheetNames || []"
            :key="idx"
            class="sheet-option"
          >
            <input
              type="radio"
              :value="idx"
              v-model="selectedLookupSheet"
            />
            <span>{{ sheetName }}</span>
          </label>
        </div>
      </div>

      <!-- 查找表预览 -->
      <div v-if="lookupSheetData.length > 0" class="table-preview">
        <h4>{{ t('task.tasks.lookup.lookupTablePreview') }}</h4>
        <DataPreview :data="lookupSheetData" :maxDisplayRows="5" />
      </div>

      <div class="step-actions">
        <button class="btn-secondary" @click="lookupStep = 'mainTable'">{{ t('common.prev') }}</button>
        <button
          class="btn-primary"
          :disabled="!lookupFile || selectedLookupSheet === null"
          @click="goToConfig"
        >
          {{ t('common.next') }}
        </button>
      </div>
    </div>

    <!-- 步骤3：配置匹配 -->
    <div v-if="lookupStep === 'config'" class="lookup-step">
      <h3>{{ t('task.tasks.lookup.configMatch') }}</h3>

      <div class="config-section">
        <label class="config-label">{{ t('task.tasks.lookup.mainKeyColumn') }}</label>
        <select v-model="config.mainKeyColumn" class="config-select">
          <option value="">-- {{ t('task.selectColumns') }} --</option>
          <option v-for="(header, idx) in mainHeaders" :key="idx" :value="idx">
            {{ header || t('dataPreview.column', { index: idx + 1 }) }}
          </option>
        </select>
      </div>

      <div class="config-section">
        <label class="config-label">{{ t('task.tasks.lookup.lookupKeyColumn') }}</label>
        <select v-model="config.lookupKeyColumn" class="config-select">
          <option value="">-- {{ t('task.selectColumns') }} --</option>
          <option v-for="(header, idx) in lookupHeaders" :key="idx" :value="idx">
            {{ header || t('dataPreview.column', { index: idx + 1 }) }}
          </option>
        </select>
      </div>

      <div class="config-section">
        <label class="config-label">{{ t('task.tasks.lookup.returnColumns') }}</label>
        <p class="config-hint">{{ t('task.tasks.lookup.returnColumnsHint') }}</p>
        <div class="checkbox-grid">
          <label
            v-for="(header, idx) in lookupHeaders"
            :key="idx"
            class="checkbox-item"
            :class="{ 'is-key': idx === config.lookupKeyColumn }"
          >
            <input
              type="checkbox"
              :value="idx"
              v-model="config.returnColumns"
              :disabled="idx === config.lookupKeyColumn"
            />
            <span>{{ header || t('dataPreview.column', { index: idx + 1 }) }}</span>
            <span v-if="idx === config.lookupKeyColumn" class="key-badge">{{ t('task.tasks.lookup.keyColumn') }}</span>
          </label>
        </div>
      </div>

      <div class="config-section">
        <label class="config-label">{{ t('task.tasks.lookup.matchMode') }}</label>
        <div class="match-mode-options">
          <label class="mode-option" :class="{ 'is-active': !config.fuzzyMatch }">
            <input type="radio" :value="false" v-model="config.fuzzyMatch" />
            <span class="mode-title">{{ t('task.tasks.lookup.exactMatch') }}</span>
            <span class="mode-desc">{{ t('task.tasks.lookup.exactMatchDesc') }}</span>
          </label>
          <label class="mode-option" :class="{ 'is-active': config.fuzzyMatch }">
            <input type="radio" :value="true" v-model="config.fuzzyMatch" />
            <span class="mode-title">{{ t('task.tasks.lookup.fuzzyMatch') }}</span>
            <span class="mode-desc">{{ t('task.tasks.lookup.fuzzyMatchDesc') }}</span>
          </label>
        </div>
      </div>

      <div class="config-section">
        <label class="config-label">{{ t('task.tasks.lookup.ifNotFound') }}</label>
        <input
          type="text"
          v-model="config.ifNotFound"
          placeholder="#N/A"
          class="config-input"
        />
        <p class="config-hint">{{ t('task.tasks.lookup.ifNotFoundHint') }}</p>
      </div>

      <!-- 匹配预览统计 -->
      <div class="match-preview">
        <h4>{{ t('task.tasks.lookup.matchPreview') }}</h4>
        <div class="preview-stats">
          <div class="stat-item">
            <span class="stat-label">{{ t('task.tasks.lookup.mainTableRows') }}</span>
            <span class="stat-value">{{ mainSheetData.length - 1 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ t('task.tasks.lookup.lookupTableRows') }}</span>
            <span class="stat-value">{{ lookupSheetData.length - 1 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ t('task.tasks.lookup.returnColumnsCount') }}</span>
            <span class="stat-value">{{ config.returnColumns.length }}</span>
          </div>
        </div>
      </div>

      <div class="step-actions">
        <button class="btn-secondary" @click="lookupStep = 'lookupTable'">{{ t('common.prev') }}</button>
        <button
          class="btn-primary"
          :disabled="!isConfigValid"
          @click="executeLookup"
        >
          {{ t('common.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import FileUploader from '@/components/common/FileUploader.vue'
import DataPreview from '@/components/common/DataPreview.vue'
import { parseFile } from '@/utils/parser/xlsxParser'
import { lookupMatch } from '@/utils/operations/lookupMatch'
import { useFileStore } from '@/stores/fileStore'
import { toast } from '@/services/toastService'

const { t } = useI18n()
const fileStore = useFileStore()

const emit = defineEmits(['complete', 'cancel'])

const lookupStep = ref('mainTable') // mainTable | lookupTable | config

// 主表数据
const mainFile = ref(null)
const mainWorkbook = ref(null)
const selectedMainSheet = ref(null)

// 查找表数据
const lookupFile = ref(null)
const lookupWorkbook = ref(null)
const selectedLookupSheet = ref(null)

// 配置
const config = ref({
  mainKeyColumn: '',
  lookupKeyColumn: '',
  returnColumns: [],
  fuzzyMatch: false,
  ifNotFound: '#N/A'
})

// 主表数据
const mainSheetData = computed(() => {
  if (!mainWorkbook.value || selectedMainSheet.value === null) return []
  const sheet = mainWorkbook.value.sheets?.[selectedMainSheet.value]
  return sheet?.data || []
})

// 查找表数据
const lookupSheetData = computed(() => {
  if (!lookupWorkbook.value || selectedLookupSheet.value === null) return []
  const sheet = lookupWorkbook.value.sheets?.[selectedLookupSheet.value]
  return sheet?.data || []
})

// 主表表头
const mainHeaders = computed(() => {
  if (mainSheetData.value.length === 0) return []
  return mainSheetData.value[0] || []
})

// 查找表表头
const lookupHeaders = computed(() => {
  if (lookupSheetData.value.length === 0) return []
  return lookupSheetData.value[0] || []
})

// 配置是否有效
const isConfigValid = computed(() => {
  return (
    config.value.mainKeyColumn !== '' &&
    config.value.lookupKeyColumn !== '' &&
    config.value.returnColumns.length > 0
  )
})

// 处理主表文件选择
async function handleMainFileSelected(file) {
  const result = await parseFile(file)
  if (result.success) {
    mainFile.value = file
    mainWorkbook.value = result
    selectedMainSheet.value = 0
  }
}

// 处理查找表文件选择
async function handleLookupFileSelected(file) {
  const result = await parseFile(file)
  if (result.success) {
    lookupFile.value = file
    lookupWorkbook.value = result
    selectedLookupSheet.value = 0
  }
}

// 移除主表
function removeMainFile() {
  mainFile.value = null
  mainWorkbook.value = null
  selectedMainSheet.value = null
}

// 移除查找表
function removeLookupFile() {
  lookupFile.value = null
  lookupWorkbook.value = null
  selectedLookupSheet.value = null
}

// 跳转到查找表上传
function goToLookupTable() {
  lookupStep.value = 'lookupTable'
}

// 跳转到配置
function goToConfig() {
  // 自动选择关键列（如果之前没选过）
  if (config.value.mainKeyColumn === '' && mainHeaders.value.length > 0) {
    config.value.mainKeyColumn = 0
  }
  if (config.value.lookupKeyColumn === '' && lookupHeaders.value.length > 0) {
    config.value.lookupKeyColumn = 0
  }
  lookupStep.value = 'config'
}

// 执行匹配
function executeLookup() {
  // 显示加载状态
  fileStore.setLoading(true)

  // 准备数据格式：二维数组
  const mainData = mainSheetData.value
  const lookupData = lookupSheetData.value

  // 执行匹配
  const result = lookupMatch(mainData, {
    lookupData: lookupData,
    keyColumn: parseInt(config.value.mainKeyColumn),
    lookupKeyColumn: parseInt(config.value.lookupKeyColumn),
    returnColumns: config.value.returnColumns.map(Number),
    fuzzyMatch: config.value.fuzzyMatch,
    ifNotFound: config.value.ifNotFound
  })

  if (result.success) {
    // 隐藏加载状态
    fileStore.setLoading(false)
    emit('complete', {
      data: result.data,
      info: result.info
    })
  } else {
    fileStore.setLoading(false)
    toast.error(result.info.error || t('task.tasks.lookup.matchFailed'))
  }
}

// 取消
function cancelLookup() {
  resetState()
  emit('cancel')
}

// 重置状态
function resetState() {
  lookupStep.value = 'mainTable'
  mainFile.value = null
  mainWorkbook.value = null
  selectedMainSheet.value = null
  lookupFile.value = null
  lookupWorkbook.value = null
  selectedLookupSheet.value = null
  config.value = {
    mainKeyColumn: '',
    lookupKeyColumn: '',
    returnColumns: [],
    fuzzyMatch: false,
    ifNotFound: '#N/A'
  }
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 处理错误
function handleError(error) {
  console.error('File error:', error)
}
</script>

<style scoped>
.lookup-wizard {
  padding: 20px 0;
}

.lookup-wizard h3 {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.lookup-step {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 文件信息 */
.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin-top: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.file-info-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  font-size: 20px;
}

.file-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.file-size {
  font-size: 12px;
  color: var(--text-muted);
}

.file-sheets {
  font-size: 12px;
  color: var(--accent-primary);
  padding: 2px 8px;
  background: rgba(0, 212, 170, 0.1);
  border-radius: 4px;
}

.btn-remove-file {
  padding: 6px 12px;
  font-size: 12px;
  border: 1px solid var(--accent-danger);
  border-radius: 6px;
  background: transparent;
  color: var(--accent-danger);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-remove-file:hover {
  background: var(--accent-danger);
  color: white;
}

/* Sheet 选择 */
.sheet-select {
  margin-top: 24px;
}

.config-label {
  display: block;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sheet-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.sheet-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sheet-option:hover {
  border-color: var(--accent-primary);
}

.sheet-option input {
  accent-color: var(--accent-primary);
}

/* 表格预览 */
.table-preview {
  margin-top: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.table-preview h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

/* 配置区域 */
.config-section {
  margin-bottom: 24px;
}

.config-hint {
  margin: 8px 0;
  font-size: 12px;
  color: var(--text-muted);
}

.config-select,
.config-input {
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  font-size: 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.config-select:focus,
.config-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
}

.config-select option {
  background: var(--bg-card);
  color: var(--text-primary);
}

/* 复选框网格 */
.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 8px;
  max-height: 180px;
  overflow-y: auto;
  padding: 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  color: var(--text-primary);
}

.checkbox-item:hover {
  border-color: var(--accent-primary);
}

.checkbox-item.is-key {
  background: rgba(0, 212, 170, 0.08);
  border-color: rgba(0, 212, 170, 0.3);
}

.checkbox-item input {
  accent-color: var(--accent-primary);
}

.checkbox-item input:disabled {
  opacity: 0.5;
}

.key-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: rgba(0, 153, 255, 0.2);
  color: var(--accent-secondary);
  border-radius: 4px;
  margin-left: auto;
}

/* 匹配模式选项 */
.match-mode-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.mode-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-option:hover {
  border-color: var(--accent-primary);
}

.mode-option.is-active {
  border-color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.08);
}

.mode-option input {
  display: none;
}

.mode-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.mode-desc {
  font-size: 12px;
  color: var(--text-muted);
}

/* 匹配预览 */
.match-preview {
  margin-top: 24px;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.match-preview h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.preview-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-primary);
}

/* 按钮 */
.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: #00f5c4;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
}
</style>