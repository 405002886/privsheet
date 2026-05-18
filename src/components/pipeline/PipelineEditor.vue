<template>
  <div class="pipeline-editor">
    <div class="pipeline-header">
      <h3>{{ title || t('pipelineEditor.defaultTitle') }}</h3>
      <div class="pipeline-actions">
        <button class="btn-add" @click="showAddDialog = true">
          + {{ t('pipelineEditor.addStep') }}
        </button>
      </div>
    </div>

    <!-- 管道步骤列表 -->
    <div class="pipeline-steps" v-if="localSteps.length > 0">
      <PipelineStep
        v-for="(step, index) in localSteps"
        :key="step.id"
        :step="step"
        :index="index"
        :total="localSteps.length"
        @update="handleStepUpdate(index, $event)"
        @remove="handleStepRemove(index)"
        @toggle="handleStepToggle(index)"
        @move-up="handleMoveUp(index)"
        @move-down="handleMoveDown(index)"
        @edit="handleStepEdit(index)"
      />
    </div>

    <!-- 空状态 -->
    <div class="pipeline-empty" v-else>
      <p>{{ t('pipelineEditor.noSteps') }}</p>
      <p class="hint">{{ t('pipelineEditor.noStepsHint') }}</p>
    </div>

    <!-- 添加步骤对话框 -->
    <div class="dialog-overlay" v-if="showAddDialog" @click.self="showAddDialog = false">
      <div class="dialog" :class="{ 'has-selection': selectedOperation }">
        <div class="dialog-header">
          <h4>{{ editingStepIndex >= 0 ? t('pipelineEditor.editStepTitle') : t('pipelineEditor.addStepTitle') }}</h4>
          <button class="btn-close" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <!-- 操作选择区 -->
          <div class="operation-panel">
            <div class="operation-categories">
              <div
                v-for="category in operationCategories"
                :key="category.id"
                class="category"
              >
                <h5>{{ category.name }}</h5>
                <div class="operation-grid">
                  <button
                    v-for="op in category.operations"
                    :key="op.id"
                    class="operation-item"
                    :class="{ selected: selectedOperation?.id === op.id }"
                    @click="selectOperation(op)"
                    :title="op.name"
                  >
                    <component :is="iconMap[op.id]" :size="20" :stroke-width="1.5" />
                    <span>{{ op.name }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 配置面板 -->
          <div class="config-panel" v-if="selectedOperation">
            <div class="config-header">
              <span class="selected-op-icon">
                <component :is="iconMap[selectedOperation.id]" :size="18" :stroke-width="1.5" />
              </span>
              <span class="selected-op-name">{{ selectedOperation.name }}</span>
            </div>
            <div class="config-form">
              <div class="form-group">
                <label>{{ t('pipelineEditor.stepName') }}</label>
                <input type="text" v-model="newStepName" :placeholder="t('pipelineEditor.stepNamePlaceholder')" />
              </div>

              <!-- 根据操作类型显示不同配置 -->
              <template v-if="selectedOperation.id.startsWith('mask-')">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.selectColumn') }}</label>
                  <select v-model="stepConfig.colIndex">
                    <option value="-1">{{ t('pipelineEditor.allColumns') }}</option>
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.maskType') }}</label>
                  <select v-model="stepConfig.maskType">
                    <template v-if="selectedOperation.id === 'mask-name'">
                      <option value="partial">{{ t('pipelineEditor.keepFirstLast') }}</option>
                      <option value="full">{{ t('pipelineEditor.hideCompletely') }}</option>
                      <option value="initial">{{ t('pipelineEditor.keepInitial') }}</option>
                    </template>
                    <template v-else-if="selectedOperation.id === 'mask-id' || selectedOperation.id === 'mask-phone'">
                      <option value="partial">{{ t('pipelineEditor.keepFirstLast') }}</option>
                      <option value="full">{{ t('pipelineEditor.hideCompletely') }}</option>
                      <option value="random">{{ t('pipelineEditor.random') }}</option>
                    </template>
                    <template v-else-if="selectedOperation.id === 'mask-email'">
                      <option value="partial">{{ t('pipelineEditor.keepFirstLast') }}</option>
                      <option value="full">{{ t('pipelineEditor.hideCompletely') }}</option>
                    </template>
                    <template v-else>
                      <option value="partial">{{ t('pipelineEditor.keepFirstLast') }}</option>
                      <option value="full">{{ t('pipelineEditor.hideCompletely') }}</option>
                    </template>
                  </select>
                </div>
                <!-- 姓名脱敏预览 -->
                <template v-if="selectedOperation.id === 'mask-name'">
                  <div class="mask-preview-inline">
                    <div class="preview-item">
                      <span class="preview-label">{{ t('task.tasks.mask.chinese') }}:</span>
                      <span class="preview-original">{{ t('pipelinePreviewExamples.chineseName') }}</span>
                      <span class="preview-arrow">→</span>
                      <span class="preview-result">{{ getMaskNamePreview('chinese') }}</span>
                    </div>
                    <div class="preview-item">
                      <span class="preview-label">{{ t('task.tasks.mask.english') }}:</span>
                      <span class="preview-original">{{ t('pipelinePreviewExamples.englishName') }}</span>
                      <span class="preview-arrow">→</span>
                      <span class="preview-result">{{ getMaskNamePreview('english') }}</span>
                    </div>
                  </div>
                </template>
                <!-- 邮箱脱敏预览 -->
                <template v-if="selectedOperation.id === 'mask-email'">
                  <div class="mask-preview-inline">
                    <div class="preview-item">
                      <span class="preview-label">{{ t('task.tasks.mask.email') || 'Email' }}:</span>
                      <span class="preview-original">{{ t('pipelinePreviewExamples.email') }}</span>
                      <span class="preview-arrow">→</span>
                      <span class="preview-result">{{ getMaskEmailPreview() }}</span>
                    </div>
                  </div>
                </template>
                <!-- 身份证脱敏预览 -->
                <template v-if="selectedOperation.id === 'mask-id'">
                  <div class="mask-preview-inline">
                    <div class="preview-item">
                      <span class="preview-label">{{ t('task.tasks.mask.actions.id.title') || 'ID Card' }}:</span>
                      <span class="preview-original">{{ t('pipelinePreviewExamples.idCard') }}</span>
                      <span class="preview-arrow">→</span>
                      <span class="preview-result">{{ getMaskIdPreview() }}</span>
                    </div>
                  </div>
                </template>
                <!-- 手机号脱敏预览 -->
                <template v-if="selectedOperation.id === 'mask-phone'">
                  <div class="mask-preview-inline">
                    <div class="preview-item">
                      <span class="preview-label">{{ t('task.tasks.mask.actions.phone.title') || 'Phone' }}:</span>
                      <span class="preview-original">{{ t('pipelinePreviewExamples.phone') }}</span>
                      <span class="preview-arrow">→</span>
                      <span class="preview-result">{{ getMaskPhonePreview() }}</span>
                    </div>
                  </div>
                </template>
              </template>

              <template v-else-if="selectedOperation.id === 'split-delimiter'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.selectColumn') }}</label>
                  <select v-model="stepConfig.colIndex">
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.splitDelimiter') }}</label>
                  <input type="text" v-model="stepConfig.delimiter" :placeholder="t('pipelineEditor.delimiterPlaceholder')" />
                </div>
              </template>

              <template v-else-if="selectedOperation.id === 'split-width'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.selectColumn') }}</label>
                  <select v-model="stepConfig.colIndex">
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.splitWidths') }}</label>
                  <input type="text" v-model="stepConfig.widthsStr" :placeholder="t('pipelineEditor.widthsPlaceholder')" />
                  <p class="form-hint">{{ t('pipelineEditor.widthsExample') }}</p>
                </div>
              </template>

              <template v-else-if="selectedOperation.id === 'split-to-sheets'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.selectColumn') }}</label>
                  <select v-model="stepConfig.colIndex">
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
              </template>

              <template v-else-if="selectedOperation.id === 'merge'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.mergeColumns') }}</label>
                  <div class="checkbox-grid">
                    <label v-for="col in availableColumns" :key="col">
                      <input type="checkbox" :value="col" v-model="stepConfig.colIndices" />
                      {{ getColumnLabel(col) }}
                    </label>
                  </div>
                </div>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.joiner') }}</label>
                  <input type="text" v-model="stepConfig.separator" :placeholder="t('pipelineEditor.joinerPlaceholder')" />
                </div>
              </template>

              <template v-else-if="selectedOperation.id === 'dedup-exact'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.dedupStrategy') }}</label>
                  <select v-model="stepConfig.keepStrategy">
                    <option value="first">{{ t('pipelineEditor.keepFirst') }}</option>
                    <option value="last">{{ t('pipelineEditor.keepLast') }}</option>
                  </select>
                </div>
              </template>

              <template v-else-if="selectedOperation.id === 'dedup-key'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.selectKeyColumn') }}</label>
                  <div class="checkbox-grid">
                    <label v-for="col in availableColumns" :key="col">
                      <input type="checkbox" :value="col" v-model="stepConfig.colIndices" />
                      {{ getColumnLabel(col) }}
                    </label>
                  </div>
                </div>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.dedupStrategy') }}</label>
                  <select v-model="stepConfig.keepStrategy">
                    <option value="first">{{ t('pipelineEditor.keepFirst') }}</option>
                    <option value="last">{{ t('pipelineEditor.keepLast') }}</option>
                  </select>
                </div>
              </template>

              <template v-else-if="selectedOperation.id === 'replace-text'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.selectColumn2') }}</label>
                  <select v-model="stepConfig.colIndex">
                    <option value="-1">{{ t('pipelineEditor.allColumns') }}</option>
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.search') }}</label>
                  <input type="text" v-model="stepConfig.search" :placeholder="t('pipelineEditor.searchPlaceholder')" />
                </div>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.replaceWith') }}</label>
                  <input type="text" v-model="stepConfig.replace" :placeholder="t('pipelineEditor.replacePlaceholder')" />
                </div>
              </template>

              <template v-else-if="selectedOperation.id === 'letter-mapping'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.selectColumn2') }}</label>
                  <select v-model="stepConfig.colIndex">
                    <option value="-1">{{ t('pipelineEditor.allColumns') }}</option>
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.mappingRule') }}</label>
                  <input type="text" v-model="stepConfig.letterMapping" :placeholder="t('pipelineEditor.mappingPlaceholder')" />
                </div>
              </template>

              <template v-else-if="selectedOperation.id === 'round-numbers'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.selectColumn2') }}</label>
                  <select v-model="stepConfig.colIndex">
                    <option value="-1">{{ t('pipelineEditor.allColumns') }}</option>
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.decimalPlaces') }}</label>
                  <input type="number" v-model="stepConfig.decimals" min="0" max="10" />
                </div>
              </template>

              <template v-else-if="selectedOperation.id === 'convert-width'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.selectColumn') }}</label>
                  <select v-model="stepConfig.colIndex">
                    <option value="-1">{{ t('pipelineEditor.allColumns') }}</option>
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.conversionType') }}</label>
                  <select v-model="stepConfig.type">
                    <option value="toHalfWidth">{{ t('pipelineEditor.toHalfWidth') }}</option>
                    <option value="toFullWidth">{{ t('pipelineEditor.toFullWidth') }}</option>
                  </select>
                </div>
              </template>

              <template v-else-if="selectedOperation.id === 'normalize-dates'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.selectColumn') }}</label>
                  <select v-model="stepConfig.colIndex">
                    <option value="-1">{{ t('pipelineEditor.allColumns') }}</option>
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.targetFormat') }}</label>
                  <input type="text" v-model="stepConfig.targetFormat" placeholder="YYYY-MM-DD" />
                  <p class="form-hint">{{ t('pipelineEditor.dateFormatHint') }}</p>
                </div>
              </template>

              <template v-else-if="selectedOperation.id === 'extract-regex'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.selectColumn') }}</label>
                  <select v-model="stepConfig.colIndex">
                    <option value="-1">{{ t('pipelineEditor.allColumns') }}</option>
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.regex') }}</label>
                  <input type="text" v-model="stepConfig.pattern" :placeholder="t('pipelineEditor.regexPlaceholder')" />
                </div>
              </template>

              <template v-else-if="selectedOperation.id === 'custom-mask'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.selectColumn') }}</label>
                  <select v-model="stepConfig.colIndex">
                    <option value="-1">{{ t('pipelineEditor.allColumns') }}</option>
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.maskType') }}</label>
                  <select v-model="stepConfig.maskType">
                    <option value="quick">{{ t('pipelineEditor.quickMask') }}</option>
                    <option value="regex">{{ t('pipelineEditor.regexMask') }}</option>
                  </select>
                </div>
                <template v-if="stepConfig.maskType === 'quick'">
                  <div class="form-group">
                    <label>{{ t('pipelineEditor.quickMode') }}</label>
                    <select v-model="stepConfig.quickMode">
                      <option value="keep-2-sides">{{ t('pipelineEditor.keep2Sides') }}</option>
                      <option value="skip-one">{{ t('pipelineEditor.skipOne') }}</option>
                      <option value="keep-first-half">{{ t('pipelineEditor.keepFirstHalf') }}</option>
                      <option value="keep-last-half">{{ t('pipelineEditor.keepLastHalf') }}</option>
                    </select>
                  </div>
                  <div class="mask-preview-inline">
                    <span class="preview-label">{{ t('pipelineEditor.example') || 'Example' }}:</span>
                    <span class="preview-original">{{ t('pipelinePreviewExamples.sampleText') }}</span>
                    <span class="preview-arrow">→</span>
                    <span class="preview-result" v-if="stepConfig.quickMode === 'keep-2-sides'">{{ t('pipelinePreviewExamples.keep2SidesResult') }}</span>
                    <span class="preview-result" v-else-if="stepConfig.quickMode === 'skip-one'">{{ t('pipelinePreviewExamples.skipOneResult') }}</span>
                    <span class="preview-result" v-else-if="stepConfig.quickMode === 'keep-first-half'">{{ t('pipelinePreviewExamples.keepFirstHalfResult') }}</span>
                    <span class="preview-result" v-else-if="stepConfig.quickMode === 'keep-last-half'">{{ t('pipelinePreviewExamples.keepLastHalfResult') }}</span>
                  </div>
                </template>
                <template v-else>
                  <div class="form-group">
                    <label>{{ t('pipelineEditor.regex') }}</label>
                    <input type="text" v-model="stepConfig.pattern" :placeholder="t('pipelineEditor.regexPlaceholder')" />
                  </div>
                  <div class="form-group">
                    <label>{{ t('pipelineEditor.replaceWith') }}</label>
                    <input type="text" v-model="stepConfig.replaceWith" placeholder="***" />
                  </div>
                </template>
              </template>

              <template v-else-if="selectedOperation.id === 'batch-math'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.selectColumn') }}</label>
                  <select v-model="stepConfig.colIndex">
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
                <div class="form-row">
                  <div class="form-group">
                    <label>{{ t('pipelineEditor.operator') }}</label>
                    <select v-model="stepConfig.operator">
                      <option value="+">+</option>
                      <option value="-">-</option>
                      <option value="*">*</option>
                      <option value="/">/</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>{{ t('pipelineEditor.value') }}</label>
                    <input type="number" v-model="stepConfig.mathValue" />
                  </div>
                </div>
              </template>

              <template v-else-if="selectedOperation.id === 'group-summary'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.groupColumn') }}</label>
                  <select v-model="stepConfig.groupColumn">
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.aggColumn') }}</label>
                  <select v-model="stepConfig.aggColIndex">
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.aggType') }}</label>
                  <select v-model="stepConfig.aggType">
                    <option value="sum">{{ t('pipelineEditor.sum') }}</option>
                    <option value="count">{{ t('pipelineEditor.count') }}</option>
                    <option value="avg">{{ t('pipelineEditor.avg') }}</option>
                    <option value="max">{{ t('pipelineEditor.max') }}</option>
                    <option value="min">{{ t('pipelineEditor.min') }}</option>
                  </select>
                </div>
              </template>

              <template v-else-if="selectedOperation.id === 'sort-asc' || selectedOperation.id === 'sort-desc'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.selectSortColumn') }}</label>
                  <select v-model="stepConfig.colIndex">
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
              </template>

              <template v-else-if="selectedOperation.id === 'to-sql-insert' || selectedOperation.id === 'to-sql-inquery'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.tableName') }}</label>
                  <input type="text" v-model="stepConfig.tableName" :placeholder="t('pipelineEditor.tableNamePlaceholder')" />
                </div>
              </template>

              <template v-else-if="selectedOperation.id === 'wage-slip-split'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.nameColumn') }}</label>
                  <select v-model="stepConfig.nameColumn">
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.exportFormat') }}</label>
                  <select v-model="stepConfig.exportFormat">
                    <option value="excel">{{ t('pipelineEditor.exportExcel') }}</option>
                    <option value="pdf">{{ t('pipelineEditor.exportPdf') }}</option>
                  </select>
                </div>
              </template>

              <template v-else-if="selectedOperation.id === 'remove-special-chars'">
                <div class="form-group">
                  <label>{{ t('pipelineEditor.selectColumn') }}</label>
                  <select v-model="stepConfig.colIndex">
                    <option value="-1">{{ t('pipelineEditor.allColumns') }}</option>
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.removeChars') }}</label>
                  <input type="text" v-model="stepConfig.removeChars" :placeholder="t('pipelineEditor.removeCharsPlaceholder')" />
                  <p class="form-hint">{{ t('pipelineEditor.removeCharsHint') }}</p>
                </div>
              </template>

              <template v-else>
                <div class="form-group">
                  <label>{{ t('pipelineEditor.selectColumn') }}</label>
                  <select v-model="stepConfig.colIndex">
                    <option value="-1">{{ t('pipelineEditor.allColumns') }}</option>
                    <option v-for="col in availableColumns" :key="col" :value="col">
                      {{ getColumnLabel(col) }}
                    </option>
                  </select>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn-secondary" @click="closeDialog">{{ t('pipelineEditor.cancel') }}</button>
          <button class="btn-primary" @click="addStep" :disabled="!selectedOperation">
            {{ editingStepIndex >= 0 ? t('pipelineEditor.update') : t('pipelineEditor.add') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import PipelineStep from './PipelineStep.vue'
import { useI18n } from 'vue-i18n'
// Lucide 图标导入
import {
  Trash2, Key, UserX, Smartphone, Mail, User,
  Scissors, Link, Search, RefreshCw,
  ArrowUp, ArrowDown, Calendar, Target,
  ArrowUpDown, Shuffle, AlignLeft, AlignRight,
  Type, Hash, Percent, Calculator,
  FileText, Database, Copy, Filter,
  SortAsc, SortDesc, Rows3, Columns3,
  Sparkles, Wand2, GripHorizontal
} from 'lucide-vue-next'

// 图标映射表
const iconMap = {
  // 去重
  'dedup-exact': Trash2,
  'dedup-key': Key,
  // 脱敏
  'mask-id': UserX,
  'mask-phone': Smartphone,
  'mask-email': Mail,
  'mask-name': User,
  'custom-mask': Wand2,
  // 拆分合并
  'split-delimiter': Scissors,
  'split-width': AlignLeft,
  'split-to-sheets': Rows3,
  'merge': Link,
  'transpose': Rows3,
  // 清洗
  'remove-empty-rows': Trash2,
  'remove-empty-cols': Columns3,
  'trim-whitespace': Search,
  'remove-all-spaces': AlignRight,
  'capitalize': Type,
  // 格式处理
  'normalize-dates': Calendar,
  'round-numbers': Target,
  'remove-special-chars': Filter,
  'convert-width': Hash,
  // 文本处理
  'replace-text': RefreshCw,
  'letter-mapping': Sparkles,
  // 提取
  'extract-regex': Copy,
  // 排序
  'sort-asc': SortAsc,
  'sort-desc': SortDesc,
  'shuffle': Shuffle,
  // 统计
  'calculate-sum': Calculator,
  'calculate-count': Hash,
  'calculate-avg': Percent,
  'calculate-max': ArrowUp,
  'calculate-min': ArrowDown,
  'batch-math': Calculator,
  'group-summary': Database,
  // 导出
  'to-csv': FileText,
  'to-json': FileText,
  'to-sql-insert': Database,
  'to-sql-inquery': Database,
  'column-to-string': Copy,
  // 转换
  'to-upper': ArrowUp,
  'to-lower': ArrowDown,
  'remove-special-chars': Filter,
  'convert-width': Hash
}

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  steps: {
    type: Array,
    default: () => []
  },
  availableColumns: {
    type: Array,
    default: () => []
  },
  columnHeaders: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:steps', 'execute'])

const { t } = useI18n()

// 获取列的显示名称（表头或"列X"）
function getColumnLabel(colIndex) {
  const header = props.columnHeaders[colIndex]
  if (header && String(header).trim()) {
    return String(header)
  }
  return t('pipelineEditor.column', { index: colIndex + 1 })
}

// 获取姓名脱敏预览
function getMaskNamePreview(type) {
  if (type === 'chinese') {
    const example = t('pipelinePreviewExamples.chineseName')
    if (stepConfig.value.maskType === 'partial') {
      return example.charAt(0) + '***'
    } else if (stepConfig.value.maskType === 'full') {
      return '***'
    } else {
      return example.charAt(0) + '***'
    }
  } else {
    const example = t('pipelinePreviewExamples.englishName')
    const parts = example.split(' ')
    if (parts.length >= 2) {
      if (stepConfig.value.maskType === 'partial') {
        return parts[0].charAt(0) + '*** ' + parts[1].charAt(0) + '***'
      } else if (stepConfig.value.maskType === 'full') {
        return '*** ***'
      } else {
        return parts[0].charAt(0) + '*** ' + parts[1].charAt(0) + '****'
      }
    }
    return '***'
  }
}

// 获取邮箱脱敏预览
function getMaskEmailPreview() {
  const example = t('pipelinePreviewExamples.email')
  const atIndex = example.indexOf('@')
  if (stepConfig.value.maskType === 'full') {
    return '***@***.***'
  }
  if (atIndex <= 1) return `***@${example.slice(atIndex + 1)}`
  const local = example.slice(0, atIndex)
  const domain = example.slice(atIndex + 1)
  if (local.length <= 2) return `${local[0]}***@${domain}`
  return `${local[0]}***${local[local.length - 1]}@${domain}`
}

// 获取身份证脱敏预览
function getMaskIdPreview() {
  const example = t('pipelinePreviewExamples.idCard')
  if (stepConfig.value.maskType === 'full') {
    return '*******************'
  }
  if (example.length === 18) {
    return example.substring(0, 3) + '***********' + example.substring(example.length - 4)
  }
  return example.substring(0, 3) + '***********' + example.substring(example.length - 4)
}

// 获取手机号脱敏预览
function getMaskPhonePreview() {
  const example = t('pipelinePreviewExamples.phone')
  if (stepConfig.value.maskType === 'full') {
    return '***********'
  }
  return example.substring(0, 3) + '****' + example.substring(example.length - 4)
}

// 本地步骤副本
const localSteps = ref([...props.steps])
const showAddDialog = ref(false)
const editingStepIndex = ref(-1) // -1 表示新增模式，非负表示编辑模式
const selectedOperation = ref(null)
const newStepName = ref('')
const stepConfig = ref({
  colIndex: -1,
  colIndices: [],
  maskType: 'quick',
  quickMode: 'keep-2-sides',
  delimiter: ',',
  separator: '',
  keepStrategy: 'first',
  search: '',
  replace: '',
  // 数字修约
  decimals: 0,
  // 全角半角
  type: 'toHalfWidth',
  // 批量运算
  operator: '+',
  mathValue: 0,
  // 分组汇总
  groupColumn: 0,
  aggColIndex: 1,
  aggType: 'sum',
  // SQL导出
  tableName: 'my_table',
  // 正则提取
  pattern: '',
  // 字母映射
  letterMapping: '',
  // 按宽度拆分
  widths: [],
  widthsStr: '',
  // 日期格式统一
  targetFormat: 'YYYY-MM-DD',
  // 特殊字符清理
  removeChars: '',
  // 自定义脱敏
  replaceWith: '***',
  // 工资条拆分
  nameColumn: 0,
  exportFormat: 'excel'
})

// 操作分类 - 使用 computed 确保响应式
const operationCategories = computed(() => [
  {
    id: 'dedup',
    name: t('pipelineEditor.category.dedup'),
    operations: [
      { id: 'dedup-exact', name: t('operations.dedup-exact') },
      { id: 'dedup-key', name: t('operations.dedup-key') }
    ]
  },
  {
    id: 'mask',
    name: t('pipelineEditor.category.mask'),
    operations: [
      { id: 'mask-id', name: t('operations.mask-id') },
      { id: 'mask-phone', name: t('operations.mask-phone') },
      { id: 'mask-email', name: t('operations.mask-email') },
      { id: 'mask-name', name: t('operations.mask-name') },
      { id: 'custom-mask', name: t('pipelineEditor.customMask') }
    ]
  },
  {
    id: 'split-merge',
    name: t('pipelineEditor.category.splitMerge'),
    operations: [
      { id: 'split-delimiter', name: t('operations.split-delimiter') },
      { id: 'split-width', name: t('pipelineEditor.splitWidth') },
      { id: 'split-to-sheets', name: t('operations.split-to-sheets') },
      { id: 'merge', name: t('operations.merge') },
      { id: 'transpose', name: t('pipelineEditor.transpose') }
    ]
  },
  {
    id: 'clean',
    name: t('pipelineEditor.category.clean'),
    operations: [
      { id: 'remove-empty-rows', name: t('pipelineEditor.removeEmptyRows') },
      { id: 'remove-empty-cols', name: t('pipelineEditor.removeEmptyCols') },
      { id: 'trim-whitespace', name: t('operations.trim-whitespace') },
      { id: 'remove-all-spaces', name: t('operations.remove-all-spaces') },
      { id: 'capitalize', name: t('operations.capitalize') },
      { id: 'remove-special-chars', name: t('operations.remove-special-chars') }
    ]
  },
  {
    id: 'format',
    name: t('pipelineEditor.category.format'),
    operations: [
      { id: 'normalize-dates', name: t('operations.normalize-dates') },
      { id: 'round-numbers', name: t('operations.round-numbers') },
      { id: 'convert-width', name: t('operations.convert-width') }
    ]
  },
  {
    id: 'text',
    name: t('pipelineEditor.category.text'),
    operations: [
      { id: 'replace-text', name: t('operations.replace-text') },
      { id: 'letter-mapping', name: t('pipelineEditor.letterMapping') },
      { id: 'to-upper', name: t('operations.to-upper') },
      { id: 'to-lower', name: t('operations.to-lower') }
    ]
  },
  {
    id: 'extract',
    name: t('pipelineEditor.category.extract'),
    operations: [
      { id: 'extract-regex', name: t('pipelineEditor.extractRegex') }
    ]
  },
  {
    id: 'sort',
    name: t('pipelineEditor.category.sort'),
    operations: [
      { id: 'sort-asc', name: t('pipelineEditor.sortAsc') },
      { id: 'sort-desc', name: t('pipelineEditor.sortDesc') },
      { id: 'shuffle', name: t('pipelineEditor.shuffle') }
    ]
  },
  {
    id: 'calc',
    name: t('pipelineEditor.category.calc'),
    operations: [
      { id: 'calculate-sum', name: t('operations.calculate-sum') },
      { id: 'calculate-count', name: t('pipelineEditor.calculateCount') },
      { id: 'calculate-avg', name: t('pipelineEditor.calculateAvg') },
      { id: 'calculate-max', name: t('pipelineEditor.calculateMax') },
      { id: 'calculate-min', name: t('pipelineEditor.calculateMin') },
      { id: 'batch-math', name: t('pipelineEditor.batchMath') },
      { id: 'group-summary', name: t('pipelineEditor.groupSummary') }
    ]
  },
  {
    id: 'wage',
    name: t('pipelineEditor.category.wage'),
    operations: [
      { id: 'wage-slip-split', name: t('pipelineEditor.wageSlipSplit') }
    ]
  },
  {
    id: 'export',
    name: t('pipelineEditor.category.export'),
    operations: [
      { id: 'to-csv', name: t('pipelineEditor.toCsv') },
      { id: 'to-json', name: t('pipelineEditor.toJson') },
      { id: 'to-sql-insert', name: t('pipelineEditor.toSqlInsert') },
      { id: 'to-sql-inquery', name: t('pipelineEditor.toSqlInquery') },
      { id: 'column-to-string', name: t('pipelineEditor.columnToString') }
    ]
  }
])

// 监听 props 变化
watch(() => props.steps, (newSteps) => {
  localSteps.value = [...newSteps]
}, { deep: true, immediate: true })

// 注意：本地变化通过各操作函数手动同步到父组件（不使用 watch 监听 localSteps 避免循环）

// 同步步骤到父组件
function syncSteps() {
  emit('update:steps', [...localSteps.value])
}

function selectOperation(op) {
  selectedOperation.value = op
  newStepName.value = op.name
  // 如果不是编辑模式，才重置编辑状态
  // 编辑模式下切换操作类型，仍然保持编辑状态
  if (editingStepIndex.value < 0) {
    editingStepIndex.value = -1
    // 根据操作类型重置配置
    stepConfig.value = {
      colIndex: -1,
      colIndices: [],
      maskType: 'quick',
      quickMode: 'keep-2-sides',
      delimiter: ',',
      separator: '',
      keepStrategy: 'first',
      search: '',
      replace: '',
      decimals: 0,
      type: 'toHalfWidth',
      operator: '+',
      mathValue: 0,
      groupColumn: 0,
      aggColIndex: 1,
      aggType: 'sum',
      tableName: 'my_table',
      pattern: '',
      letterMapping: '',
      widths: [],
      widthsStr: '',
      targetFormat: 'YYYY-MM-DD',
      removeChars: '',
      replaceWith: '***',
      nameColumn: 0,
      exportFormat: 'excel'
    }
  }
}

function handleStepEdit(index) {
  const step = localSteps.value[index]
  // 根据 operation id 找到对应的操作
  const op = findOperationById(step.operation)
  if (!op) return

  selectedOperation.value = op
  newStepName.value = step.name || step.name
  // 加载步骤的现有配置
  stepConfig.value = { ...step.params }
  // 设置为编辑模式
  editingStepIndex.value = index
  showAddDialog.value = true
}

function findOperationById(opId) {
  for (const category of operationCategories.value) {
    const found = category.operations.find(o => o.id === opId)
    if (found) return found
  }
  return null
}

function closeDialog() {
  showAddDialog.value = false
  editingStepIndex.value = -1
  selectedOperation.value = null
}

function addStep() {
  if (!selectedOperation.value) return

  // 如果是编辑模式且有有效的索引
  if (editingStepIndex.value >= 0 && editingStepIndex.value < localSteps.value.length) {
    // 编辑模式：更新现有步骤
    const step = localSteps.value[editingStepIndex.value]
    step.name = newStepName.value || selectedOperation.value.name
    step.operation = selectedOperation.value.id
    step.params = { ...stepConfig.value }
    // 清理空数组
    if (step.params.colIndices && step.params.colIndices.length === 0) {
      delete step.params.colIndices
    }
    syncSteps()
    editingStepIndex.value = -1
    showAddDialog.value = false
    selectedOperation.value = null
    return
  }

  // 新增模式：根据操作类型只保留相关参数
  const relevantParams = getRelevantParams(selectedOperation.value.id)

  const step = {
    id: `step_${Date.now()}`,
    operation: selectedOperation.value.id,
    name: newStepName.value || selectedOperation.value.name,
    enabled: true,
    params: relevantParams
  }

  console.log('添加步骤:', step.operation, '参数:', step.params)

  localSteps.value.push(step)
  syncSteps()
  showAddDialog.value = false
  selectedOperation.value = null
}

// 根据操作类型过滤出相关参数，排除无关的默认值
function getRelevantParams(opId) {
  const raw = { ...stepConfig.value }

  // 简单操作：只保留 colIndex（如果有值且不是默认值 -1）
  const simpleOps = [
    'to-upper', 'to-lower', 'capitalize',
    'trim-whitespace', 'remove-all-spaces',
    'remove-empty-rows', 'remove-empty-cols',
    'shuffle', 'transpose'
  ]
  if (simpleOps.includes(opId)) {
    const result = {}
    if (raw.colIndex !== undefined && raw.colIndex !== -1) {
      result.colIndex = raw.colIndex
    }
    return result
  }

  // 去重（exact）：只保留 keepStrategy（如果不是默认值 first）
  if (opId === 'dedup-exact') {
    const result = {}
    if (raw.keepStrategy && raw.keepStrategy !== 'first') {
      result.keepStrategy = raw.keepStrategy
    }
    return result
  }

  // 去重（key）：只保留 colIndices 和 keepStrategy
  if (opId === 'dedup-key') {
    const result = {}
    if (raw.colIndices && raw.colIndices.length > 0) {
      result.colIndices = raw.colIndices
    }
    if (raw.keepStrategy && raw.keepStrategy !== 'first') {
      result.keepStrategy = raw.keepStrategy
    }
    return result
  }

  // 脱敏操作：只保留 colIndex 和 maskType
  if (opId.startsWith('mask-')) {
    const result = {}
    if (raw.colIndex !== undefined && raw.colIndex !== -1) {
      result.colIndex = raw.colIndex
    }
    if (raw.maskType && raw.maskType !== 'partial') {
      result.maskType = raw.maskType
    }
    return result
  }

  // 自定义脱敏
  if (opId === 'custom-mask') {
    const result = {}
    if (raw.colIndex !== undefined && raw.colIndex !== -1) {
      result.colIndex = raw.colIndex
    }
    if (raw.maskType) {
      result.maskType = raw.maskType
    }
    if (raw.maskType === 'quick' && raw.quickMode && raw.quickMode !== 'keep-2-sides') {
      result.quickMode = raw.quickMode
    }
    if (raw.maskType === 'regex') {
      if (raw.pattern) result.pattern = raw.pattern
      if (raw.replaceWith && raw.replaceWith !== '***') result.replaceWith = raw.replaceWith
    }
    return result
  }

  // 文本替换
  if (opId === 'replace-text') {
    const result = {}
    if (raw.colIndex !== undefined && raw.colIndex !== -1) {
      result.colIndex = raw.colIndex
    }
    if (raw.search !== undefined && raw.search !== '') result.search = raw.search
    if (raw.replace !== undefined && raw.replace !== '') result.replace = raw.replace
    return result
  }

  // 字母映射
  if (opId === 'letter-mapping') {
    const result = {}
    if (raw.colIndex !== undefined && raw.colIndex !== -1) {
      result.colIndex = raw.colIndex
    }
    if (raw.letterMapping) result.letterMapping = raw.letterMapping
    return result
  }

  // 分隔符拆分
  if (opId === 'split-delimiter') {
    const result = {}
    if (raw.colIndex !== undefined) result.colIndex = raw.colIndex
    if (raw.delimiter && raw.delimiter !== ',') result.delimiter = raw.delimiter
    return result
  }

  // 按宽度拆分
  if (opId === 'split-width') {
    const result = {}
    if (raw.colIndex !== undefined) result.colIndex = raw.colIndex
    if (raw.widthsStr) result.widthsStr = raw.widthsStr
    return result
  }

  // 按列拆分为多Sheet
  if (opId === 'split-to-sheets') {
    const result = {}
    if (raw.colIndex !== undefined) result.colIndex = raw.colIndex
    return result
  }

  // 合并
  if (opId === 'merge') {
    const result = {}
    if (raw.colIndices && raw.colIndices.length > 0) {
      result.colIndices = raw.colIndices
    }
    if (raw.separator) result.separator = raw.separator
    return result
  }

  // 数字修约
  if (opId === 'round-numbers') {
    const result = {}
    if (raw.colIndex !== undefined && raw.colIndex !== -1) {
      result.colIndex = raw.colIndex
    }
    if (raw.decimals !== undefined && raw.decimals !== 0) {
      result.decimals = raw.decimals
    }
    return result
  }

  // 全角半角
  if (opId === 'convert-width') {
    const result = {}
    if (raw.colIndex !== undefined && raw.colIndex !== -1) {
      result.colIndex = raw.colIndex
    }
    if (raw.type && raw.type !== 'toHalfWidth') {
      result.type = raw.type
    }
    return result
  }

  // 日期格式化
  if (opId === 'normalize-dates') {
    const result = {}
    if (raw.colIndex !== undefined && raw.colIndex !== -1) {
      result.colIndex = raw.colIndex
    }
    if (raw.targetFormat && raw.targetFormat !== 'YYYY-MM-DD') {
      result.targetFormat = raw.targetFormat
    }
    return result
  }

  // 正则提取
  if (opId === 'extract-regex') {
    const result = {}
    if (raw.colIndex !== undefined && raw.colIndex !== -1) {
      result.colIndex = raw.colIndex
    }
    if (raw.pattern && raw.pattern !== '') result.pattern = raw.pattern
    return result
  }

  // 排序
  if (opId === 'sort-asc' || opId === 'sort-desc') {
    const result = {}
    if (raw.colIndex !== undefined) result.colIndex = raw.colIndex
    return result
  }

  // SQL 导出
  if (opId === 'to-sql-insert' || opId === 'to-sql-inquery') {
    const result = {}
    if (raw.tableName) result.tableName = raw.tableName
    return result
  }

  // 批量数学
  if (opId === 'batch-math') {
    const result = {}
    if (raw.colIndex !== undefined) result.colIndex = raw.colIndex
    if (raw.operator && raw.mathValue !== undefined) {
      result.operator = raw.operator
      result.mathValue = raw.mathValue
    }
    return result
  }

  // 分组汇总
  if (opId === 'group-summary') {
    const result = {}
    if (raw.groupColumn !== undefined) result.groupColumn = raw.groupColumn
    if (raw.aggColIndex !== undefined) result.aggColIndex = raw.aggColIndex
    if (raw.aggType && raw.aggType !== 'sum') result.aggType = raw.aggType
    return result
  }

  // 工资条拆分
  if (opId === 'wage-slip-split') {
    const result = {}
    if (raw.nameColumn !== undefined) result.nameColumn = raw.nameColumn
    if (raw.exportFormat && raw.exportFormat !== 'excel') result.exportFormat = raw.exportFormat
    return result
  }

  // 特殊字符清理
  if (opId === 'remove-special-chars') {
    const result = {}
    if (raw.colIndex !== undefined && raw.colIndex !== -1) {
      result.colIndex = raw.colIndex
    }
    if (raw.removeChars) result.removeChars = raw.removeChars
    return result
  }

  // 默认：返回全部参数（清理空数组）
  const result = { ...raw }
  if (result.colIndices && result.colIndices.length === 0) {
    delete result.colIndices
  }
  return result
}

function handleStepUpdate(index, updatedStep) {
  localSteps.value[index] = { ...localSteps.value[index], ...updatedStep }
  syncSteps()
}

function handleStepRemove(index) {
  localSteps.value.splice(index, 1)
  syncSteps()
}

function handleStepToggle(index) {
  localSteps.value[index].enabled = !localSteps.value[index].enabled
  syncSteps()
}

function handleMoveUp(index) {
  if (index > 0) {
    const temp = localSteps.value[index]
    localSteps.value[index] = localSteps.value[index - 1]
    localSteps.value[index - 1] = temp
    syncSteps()
  }
}

function handleMoveDown(index) {
  if (index < localSteps.value.length - 1) {
    const temp = localSteps.value[index]
    localSteps.value[index] = localSteps.value[index + 1]
    localSteps.value[index + 1] = temp
    syncSteps()
  }
}
</script>

<style scoped>
/* ========== 深色赛博朋克风格变量 ========== */
.pipeline-editor {
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

  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
}

.pipeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.pipeline-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  color: var(--text-primary);
}

.btn-add {
  padding: 10px 20px;
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 212, 170, 0.25);
}

.btn-add:hover {
  background: #00f5c4;
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 212, 170, 0.35);
}

.pipeline-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pipeline-empty {
  text-align: center;
  padding: 48px 24px;
  color: var(--text-muted);
}

.pipeline-empty p {
  margin: 0;
  font-size: 14px;
}

.pipeline-empty .hint {
  font-size: 13px;
  margin-top: 10px;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
}

/* 对话框 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.dialog {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  width: 90%;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.03);
  animation: dialogIn 0.3s ease-out;
}

@keyframes dialogIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.dialog-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  color: var(--text-primary);
}

.btn-close {
  background: transparent;
  border: 1px solid var(--border-color);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-close:hover {
  color: #ff4757;
  border-color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
}

.dialog-body {
  padding: 0;
  overflow: hidden;
  flex: 1;
  display: flex;
  gap: 0;
}

/* 操作面板 - 左侧 */
.operation-panel {
  width: 50%;
  min-width: 300px;
  max-width: 400px;
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid var(--border-color);
  max-height: 60vh;
}

.operation-categories {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category h5 {
  margin: 0 0 8px;
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.operation-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.operation-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  padding: 8px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.operation-item:hover {
  background: var(--bg-card-hover);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.operation-item.selected {
  background: rgba(0, 212, 170, 0.15);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.operation-item svg {
  flex-shrink: 0;
}

/* 配置面板 - 右侧 */
.config-panel {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  max-height: 60vh;
  background: var(--bg-secondary);
}

.config-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.selected-op-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(0, 212, 170, 0.15);
  border-radius: 8px;
  color: var(--accent-primary);
}

.selected-op-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  background: var(--bg-card);
  color: var(--text-primary);
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.15);
}

.form-group select option {
  background: var(--bg-card);
  color: var(--text-primary);
}

.mask-preview-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border-radius: 6px;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
}

.mask-preview-inline .preview-label {
  color: var(--text-secondary);
}

.mask-preview-inline .preview-original {
  color: var(--text-muted);
}

.mask-preview-inline .preview-arrow {
  color: var(--accent-primary);
}

.mask-preview-inline .preview-result {
  color: var(--text-primary);
  font-weight: 600;
}

.mask-preview-inline .preview-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mask-preview-inline .preview-item:not(:last-child) {
  margin-bottom: 4px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-height: 120px;
  overflow-y: auto;
  padding: 4px;
  background: var(--bg-card);
  border-radius: 6px;
}

.checkbox-grid label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  cursor: pointer;
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', monospace;
  padding: 4px;
  border-radius: 4px;
}

.checkbox-grid label:hover {
  background: var(--bg-card-hover);
}

.checkbox-grid input[type="checkbox"] {
  width: 14px;
  height: 14px;
  accent-color: var(--accent-primary);
}

/* 响应式 - 移动端 */
@media (max-width: 768px) {
  .dialog {
    width: 100%;
    max-height: 95vh;
  }

  .dialog-body {
    flex-direction: column;
  }

  .operation-panel {
    width: 100%;
    max-width: none;
    max-height: 40vh;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }

  .config-panel {
    max-height: 45vh;
  }

  .operation-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .checkbox-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .operation-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-row {
    flex-direction: column;
    gap: 8px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.btn-secondary {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.05);
}

.btn-primary {
  padding: 10px 20px;
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(0, 212, 170, 0.25);
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
</style>
