<template>
  <div class="merge-wizard">
    <div class="merge-config">
      <h3>{{ t('task.tasks.merge.configMerge') }}</h3>

      <!-- 已上传文件列表 -->
      <div v-if="fileStore.multiFileData.length > 0" class="file-list">
        <div
          v-for="(file, index) in fileStore.multiFileData"
          :key="file.id"
          class="file-item"
        >
          <div class="file-info">
            <span class="file-icon">📄</span>
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
        </div>
      </div>

      <!-- Sheet 选择 -->
      <div class="config-section">
        <label class="config-label">{{ t('task.tasks.merge.selectSheets') }}</label>
        <div class="sheet-selection">
          <div
            v-for="(file, fileIndex) in fileStore.multiFileData"
            :key="file.id"
            class="file-sheet-card"
          >
            <div class="file-header">
              <span class="file-icon">📄</span>
              <span class="file-name">{{ file.name }}</span>
            </div>
            <div class="sheet-options">
              <label
                v-for="(sheetName, sheetIndex) in file.sheets?.map(s => s.name) || []"
                :key="sheetIndex"
                class="sheet-option"
              >
                <input
                  type="checkbox"
                  :checked="file.selectedSheets.includes(sheetIndex)"
                  @change="toggleSheet(fileIndex, sheetIndex)"
                />
                <span>{{ sheetName }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 合并模式 -->
      <div class="config-section">
        <label class="config-label">{{ t('task.tasks.merge.mergeMode') }}</label>
        <select v-model="mergeConfig.mergeMode" class="config-select">
          <option value="append">{{ t('task.tasks.merge.appendMode') }}</option>
          <option value="horizontal">{{ t('task.tasks.merge.horizontalMode') }}</option>
        </select>
      </div>

      <!-- 去重选项（仅追加模式） -->
      <div class="config-section" v-if="mergeConfig.mergeMode === 'append'">
        <label class="checkbox-label">
          <input type="checkbox" v-model="mergeConfig.deduplicate" />
          {{ t('task.tasks.merge.deduplicate') }}
        </label>
      </div>

      <div class="config-section" v-if="mergeConfig.deduplicate && mergeConfig.mergeMode === 'append'">
        <label class="config-label">{{ t('task.tasks.merge.deduplicateColumns') }}</label>
        <div class="checkbox-grid">
          <label v-for="(header, idx) in previewHeaders" :key="idx">
            <input type="checkbox" :value="idx" v-model="mergeConfig.deduplicateColumns" />
            {{ header || t('merge.colFallback', { n: idx + 1 }) }}
          </label>
        </div>
      </div>

      <!-- 保留策略 -->
      <div class="config-section">
        <label class="config-label">{{ t('task.tasks.dedup.strategy') }}</label>
        <select v-model="mergeConfig.keepStrategy" class="config-select">
          <option value="first">{{ t('task.tasks.dedup.keepFirst') }}</option>
          <option value="last">{{ t('task.tasks.dedup.keepLast') }}</option>
        </select>
      </div>

      <!-- 合并预览 -->
      <div class="merge-preview">
        <h4>{{ t('task.tasks.merge.mergePreview') }}</h4>
        <div class="preview-info">
          <span>{{ t('merge.fileCount', { n: fileStore.multiFileData.length }) }}</span>
          <span>{{ t('merge.rowCount', { n: totalRows }) }}</span>
        </div>
      </div>

      <div class="step-actions">
        <button class="btn-secondary" @click="cancelMerge">{{ t('common.cancel') }}</button>
        <button
          class="btn-primary"
          :disabled="!hasSelectedSheets"
          @click="executeMerge"
        >
          {{ t('common.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFileStore } from '@/stores/fileStore'
import { mergeWorkbooks } from '@/utils/operations/mergeWorkbooks'
import { toast } from '@/services/toastService'

const { t } = useI18n()
const fileStore = useFileStore()

const emit = defineEmits(['complete', 'cancel'])

// 合并配置
const mergeConfig = ref({
  mergeMode: 'append',
  deduplicate: false,
  deduplicateColumns: [],
  keepStrategy: 'first'
})

// 根据 fileStore 保存的 actionId 设置初始合并模式
onMounted(() => {
  console.log('MergeWizard mounted, selectedActionId:', fileStore.selectedActionId)
  const actionId = fileStore.selectedActionId
  if (actionId === 'merge-horizontal') {
    mergeConfig.value.mergeMode = 'horizontal'
  } else if (actionId === 'merge-append') {
    mergeConfig.value.mergeMode = 'append'
  }
})

// 检查是否有选中的 Sheet
const hasSelectedSheets = computed(() => {
  return fileStore.multiFileData.some(f => f.selectedSheets && f.selectedSheets.length > 0)
})

// 预览表头
const previewHeaders = computed(() => {
  const firstFile = fileStore.multiFileData[0]
  if (!firstFile?.sheets?.[0]?.data?.[0]) return []
  return firstFile.sheets[0].data[0]
})

// 总行数
const totalRows = computed(() => {
  let total = 0
  for (const file of fileStore.multiFileData) {
    for (const sheetIndex of file.selectedSheets || []) {
      const sheet = file.sheets?.[sheetIndex]
      if (sheet?.data) {
        total += sheet.data.length - 1 // 减去表头行
      }
    }
  }
  return total
})

// 切换 Sheet 选择
function toggleSheet(fileIndex, sheetIndex) {
  const file = fileStore.multiFileData[fileIndex]
  if (!file.selectedSheets) {
    file.selectedSheets = []
  }

  const idx = file.selectedSheets.indexOf(sheetIndex)
  if (idx === -1) {
    file.selectedSheets.push(sheetIndex)
  } else {
    file.selectedSheets.splice(idx, 1)
  }
}

// 取消
function cancelMerge() {
  fileStore.clearMultiFiles()
  emit('cancel')
}

// 执行合并
async function executeMerge() {
  console.log('executeMerge 开始, mergeMode:', mergeConfig.value.mergeMode)

  // 先设置 loading 状态
  fileStore.setLoading(true)

  // 使用 requestAnimationFrame 确保加载动画先渲染
  await new Promise(resolve => {
    requestAnimationFrame(() => resolve())
  })
  await new Promise(resolve => setTimeout(resolve, 100))

  // 构建 dataList
  const dataList = []

  for (const file of fileStore.multiFileData) {
    for (const sheetIndex of file.selectedSheets || []) {
      const sheet = file.sheets?.[sheetIndex]
      if (sheet?.data) {
        dataList.push({
          fileId: file.id,
          fileName: file.name,
          sheetName: sheet.name,
          data: sheet.data
        })
      }
    }
  }

  if (dataList.length < 2) {
    fileStore.setLoading(false)
    toast.warning(t('task.tasks.merge.needAtLeastTwoSheets'))
    return
  }

  // 执行合并
  const result = mergeWorkbooks(null, {
    dataList,
    mergeMode: mergeConfig.value.mergeMode,
    deduplicate: mergeConfig.value.deduplicate,
    deduplicateColumns: mergeConfig.value.deduplicateColumns,
    keepStrategy: mergeConfig.value.keepStrategy,
    hasHeader: true
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
    toast.error(result.info.error ? t('task.tasks.merge.mergeFailed') : result.info.error)
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
</script>

<style scoped>
.merge-wizard {
  padding: 20px 0;
}

.merge-wizard h3 {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 文件列表 */
.file-list {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  font-size: 20px;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
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

.file-actions {
  display: flex;
  gap: 8px;
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
.sheet-selection {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.file-sheet-card {
  padding: 16px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.file-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.file-header .file-name {
  font-weight: 600;
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
  padding: 8px 12px;
  background: var(--bg-card);
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

/* 配置区域 */
.config-section {
  margin-bottom: 20px;
}

.config-label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.config-select {
  width: 100%;
  max-width: 300px;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--text-primary);
}

.checkbox-label input {
  accent-color: var(--accent-primary);
  width: 16px;
  height: 16px;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-height: 120px;
  overflow-y: auto;
  padding: 8px;
  background: var(--bg-card);
  border-radius: 8px;
}

.checkbox-grid label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.checkbox-grid label:hover {
  background: var(--bg-card-hover);
}

.checkbox-grid input {
  accent-color: var(--accent-primary);
}

/* 合并预览 */
.merge-preview {
  margin-top: 24px;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.merge-preview h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.preview-info {
  display: flex;
  gap: 24px;
}

.preview-info span {
  font-size: 13px;
  color: var(--text-secondary);
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