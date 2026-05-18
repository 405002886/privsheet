<template>
  <div class="data-preview">
    <!-- 表头区域 -->
    <div class="preview-header" v-if="showHeader && headers.length > 0">
      <div class="header-row">
        <div class="row-number">#</div>
        <div
          v-for="(header, index) in headers"
          :key="index"
          class="header-cell"
          :class="{ 'is-selected': isColumnSelected(index) }"
          @click="toggleColumnSelection(index)"
        >
          {{ header || t('dataPreview.column', { index: index + 1 }) }}
          <span v-if="isColumnSelected(index)" class="select-indicator">✓</span>
        </div>
      </div>
    </div>

    <!-- 数据表格区域 -->
    <div class="preview-table-wrapper" ref="tableWrapper">
      <table class="preview-table">
        <tbody>
          <tr
            v-for="(row, rowIndex) in displayData"
            :key="rowIndex"
            :class="{ 'is-empty-row': isEmptyRow(row) }"
          >
            <td class="row-number">{{ rowIndex + 1 }}</td>
            <td
              v-for="(cell, cellIndex) in row"
              :key="cellIndex"
              class="data-cell"
              :class="{
                'is-null': cell === null || cell === undefined || cell === '',
                'is-selected': isColumnSelected(cellIndex),
                'col-odd': cellIndex % 2 === 1
              }"
              @click="handleCellClick(rowIndex, cellIndex)"
            >
              {{ formatCell(cell) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 底部信息栏 -->
    <div class="preview-footer" v-if="showFooter">
      <div class="footer-info">
        <span>{{ t('dataPreview.rowCount', { rows: totalRows, cols: totalColumns }) }}</span>
        <span v-if="isTruncated">{{ t('dataPreview.truncated', { count: maxDisplayRows }) }}</span>
      </div>

      <div class="footer-actions" v-if="selectable">
        <button
          class="btn-select-all"
          @click="selectAllColumns"
          :disabled="selectedColumns.length === totalColumns"
        >
          {{ t('dataPreview.selectAll') }}
        </button>
        <button
          class="btn-clear-selection"
          @click="clearSelection"
          :disabled="selectedColumns.length === 0"
        >
          {{ t('dataPreview.clearSelection') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  // 表格数据（二维数组）
  data: {
    type: Array,
    default: () => []
  },
  // 表头行索引（默认为0）
  headerIndex: {
    type: Number,
    default: 0
  },
  // 是否显示表头
  showHeader: {
    type: Boolean,
    default: true
  },
  // 是否显示底部信息栏
  showFooter: {
    type: Boolean,
    default: true
  },
  // 最大显示行数
  maxDisplayRows: {
    type: Number,
    default: 100
  },
  // 是否支持列选择
  selectable: {
    type: Boolean,
    default: false
  },
  // 预选的列索引
  preSelectedColumns: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['cell-click', 'selection-change', 'selecting-start', 'selecting-end'])

const tableWrapper = ref(null)
const selectedColumns = ref([...props.preSelectedColumns])
// 使用 Set 存储选中列索引，查找复杂度 O(1)
const selectedColumnsSet = ref(new Set(props.preSelectedColumns))

// 计算属性
const headers = computed(() => {
  if (!Array.isArray(props.data) || props.data.length === 0) return []
  const headerRow = props.data[props.headerIndex] || []
  // 如果表头行比数据行短，使用数据行的长度填充
  const maxCols = totalColumns.value
  if (headerRow.length < maxCols) {
    return [...headerRow, ...Array(maxCols - headerRow.length).fill(null)]
  }
  return headerRow
})

const dataWithoutHeader = computed(() => {
  if (!Array.isArray(props.data) || props.data.length <= props.headerIndex + 1) return []
  return props.data.slice(props.headerIndex + 1)
})

const displayData = computed(() => {
  const rows = dataWithoutHeader.value
  if (rows.length <= props.maxDisplayRows) return rows
  return rows.slice(0, props.maxDisplayRows)
})

const isTruncated = computed(() => {
  return dataWithoutHeader.value.length > props.maxDisplayRows
})

const totalRows = computed(() => dataWithoutHeader.value.length)

const totalColumns = computed(() => {
  if (!Array.isArray(props.data) || props.data.length === 0) return 0
  return props.data.reduce((max, row) => Math.max(max, row ? row.length : 0), 0)
})

// 方法
function isColumnSelected(index) {
  // 使用 Set 的 has 方法，O(1) 复杂度
  return selectedColumnsSet.value.has(index)
}

function formatCell(cell) {
  if (cell === null || cell === undefined) return ''
  if (typeof cell === 'number') {
    // 格式化数字，避免过长显示
    const str = String(cell)
    if (str.length > 20) return str.substring(0, 17) + '...'
    return str
  }
  if (typeof cell === 'string' && cell.length > 50) {
    return cell.substring(0, 47) + '...'
  }
  return String(cell)
}

function isEmptyRow(row) {
  if (!Array.isArray(row)) return false
  return row.every(cell => cell === null || cell === undefined || cell === '')
}

function handleCellClick(rowIndex, cellIndex) {
  emit('cell-click', { row: rowIndex, column: cellIndex, value: displayData.value[rowIndex][cellIndex] })
}

function toggleColumnSelection(index) {
  if (!props.selectable) return

  if (selectedColumnsSet.value.has(index)) {
    selectedColumnsSet.value.delete(index)
  } else {
    selectedColumnsSet.value.add(index)
  }
  // Set 转 Array 用于 emit
  selectedColumns.value = Array.from(selectedColumnsSet.value)
  emit('selection-change', selectedColumns.value)
}

// 全选：使用 setTimeout(0) 将重量操作放到下一事件循环，让加载动画先显示
function selectAllColumns() {
  // 通知父组件显示加载状态
  emit('selecting-start')

  // 使用 setTimeout(0) 让出主线程，使加载动画能先渲染
  setTimeout(() => {
    selectedColumnsSet.value = new Set(Array.from({ length: totalColumns.value }, (_, i) => i))
    selectedColumns.value = Array.from(selectedColumnsSet.value)
    emit('selecting-end')
    emit('selection-change', selectedColumns.value)
  }, 0)
}

function clearSelection() {
  selectedColumnsSet.value.clear()
  selectedColumns.value = []
  emit('selection-change', selectedColumns.value)
}
</script>

<style scoped>
/* ========== 深色赛博朋克风格变量 ========== */
.data-preview {
  --bg-primary: #0a0e14;
  --bg-secondary: #111820;
  --bg-card: #141c25;
  --bg-card-hover: #1a242f;
  --accent-primary: #00d4aa;
  --accent-secondary: #0099ff;
  --text-primary: #e8eaed;
  --text-secondary: #8b949e;
  --text-muted: #5c6370;
  --border-color: #2a3441;

  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--bg-card);
}

.preview-header {
  overflow-x: auto;
  border-bottom: 2px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.header-row {
  display: flex;
  min-width: fit-content;
}

.row-number {
  flex-shrink: 0;
  width: 50px;
  padding: 10px 8px;
  text-align: center;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-muted);
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-color);
}

.header-cell {
  flex-shrink: 0;
  min-width: 100px;
  max-width: 200px;
  padding: 12px 14px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-secondary);
  border-right: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-cell:hover {
  background-color: var(--bg-card-hover);
  color: var(--accent-primary);
}

.header-cell.is-selected {
  background-color: rgba(0, 212, 170, 0.15);
  color: var(--accent-primary);
  border-bottom: 2px solid var(--accent-primary);
}

.select-indicator {
  font-weight: bold;
  font-size: 14px;
}

.preview-table-wrapper {
  overflow: auto;
  max-height: 400px;
}

.preview-table {
  width: 100%;
  min-width: fit-content;
  border-collapse: collapse;
}

.preview-table tr {
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s;
}

.preview-table tr:hover {
  background-color: var(--bg-card-hover);
}

.preview-table tr.is-empty-row {
  background-color: rgba(255, 107, 53, 0.1);
}

.data-cell {
  padding: 10px 14px;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-primary);
  border-right: 1px solid var(--border-color);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.data-cell.is-null {
  color: var(--text-muted);
  font-style: italic;
  background-color: var(--bg-secondary);
}

.data-cell.is-selected {
  background-color: rgba(0, 212, 170, 0.1);
}

.data-cell.col-odd:not(.is-selected) {
  background-color: rgba(0, 0, 0, 0.15);
}

.preview-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.footer-info {
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-muted);
}

.footer-actions {
  display: flex;
  gap: 10px;
}

.footer-actions button {
  padding: 6px 14px;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.footer-actions button:hover:not(:disabled) {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.08);
}

.footer-actions button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
