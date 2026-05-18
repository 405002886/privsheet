<template>
  <div class="task-page">
    <!-- 顶部导航 -->
    <header class="task-header">
      <button class="btn-back" @click="goHome">
        <span>←</span> {{ t('task.backHome') }}
      </button>
      <h1 class="task-title">{{ currentTask?.title || t('task.selectTask') }}</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 主内容区域 -->
    <main class="task-main">
      <!-- 步骤指示器 -->
      <div class="step-indicator" v-if="currentStep > 0">
        <div
          v-for="(step, index) in stepKeys"
          :key="index"
          class="step-item"
          :class="{
            'is-active': currentStep === index,
            'is-completed': currentStep > index
          }"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-label">{{ t(`task.steps.${step}`) }}</div>
        </div>
      </div>

      <!-- 步骤内容区域 -->
      <div class="step-content">
        <!-- 步骤1: 选择任务（如果未选择） -->
        <div v-if="currentStep === 0" class="step-panel">
          <div class="task-description">
            <p>{{ currentTask?.description || t('task.selectTask') }}</p>
          </div>
          <div class="action-cards">
            <div
              v-for="action in currentTask?.actions || []"
              :key="action.id"
              class="action-card"
              @click="selectAction(action)"
            >
              <div class="action-icon">
                <component :is="iconMap[action.id]" :size="28" :stroke-width="1.5" />
              </div>
              <div class="action-info">
                <h3>{{ action.title }}</h3>
                <p>{{ action.hint }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 步骤2: 上传文件 -->
        <div v-if="currentStep === 1" class="step-panel">
          <h2>{{ t('task.uploadHint', { task: currentTask?.title }) }}</h2>

          <!-- 多文件合并模式 -->
          <template v-if="currentAction?.id === 'merge-append' || currentAction?.id === 'merge-horizontal'">
            <FileUploader
              :multiple="true"
              :drag-text="t('uploader.dragText')"
              :hint-text="t('uploader.hintText')"
              @file-selected="handleFileSelected"
              @error="handleError"
            />

            <!-- 多文件已上传列表 -->
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
                <div class="file-actions">
                  <button class="btn-remove" @click="fileStore.removeMultiFile(index)">{{ t('common.remove') }}</button>
                </div>
              </div>
            </div>

            <div class="step-actions">
              <button class="btn-secondary" @click="prevStep">{{ t('common.prev') }}</button>
              <button
                class="btn-primary"
                :disabled="fileStore.multiFileData.length < 2"
                @click="nextStep"
              >
                {{ t('common.next') }}
              </button>
            </div>
          </template>

          <!-- 普通单文件模式 -->
          <template v-else>
            <FileUploader
              :multiple="false"
              :drag-text="t('uploader.dragText')"
              :hint-text="t('uploader.hintText')"
              @file-selected="handleFileSelected"
              @error="handleError"
            />

            <!-- 文件已上传状态 -->
            <div v-if="fileStore.hasFile" class="file-info">
              <div class="file-details">
                <span class="file-name">{{ fileStore.activeFile?.name }}</span>
                <span class="file-size">{{ formatFileSize(fileStore.activeFile?.size) }}</span>
              </div>
              <button class="btn-remove" @click="fileStore.clearFiles">{{ t('common.remove') }}</button>
            </div>

            <!-- 数据预览 -->
            <DataPreview
              v-if="fileStore.workbookData"
              :data="currentSheetData"
              :selectable="true"
              @selection-change="handleColumnSelection"
              @selecting-start="fileStore.setLoading(true)"
              @selecting-end="fileStore.setLoading(false)"
            />

            <div class="step-actions">
              <button class="btn-secondary" @click="prevStep">{{ t('common.prev') }}</button>
              <button
                class="btn-primary"
                :disabled="!fileStore.hasFile"
                @click="nextStep"
              >
                {{ t('common.next') }}
              </button>
            </div>
          </template>
        </div>

        <!-- 步骤3: 配置处理参数 -->
        <div v-if="currentStep === 2" class="step-panel">
          <h2>{{ t('task.configTitle') }}</h2>

          <!-- 管道编辑器模式 -->
          <template v-if="currentAction?.id === 'pipeline'">
            <div class="config-section">
              <label class="config-label">{{ t('task.selectColumns') }}</label>
              <div class="selected-columns" v-if="selectedColumns.length > 0">
                {{ t('task.selectedColumns') }}: {{ step3ColumnNames.join(', ') }}
              </div>
              <p v-else class="no-selection">{{ t('task.noSelection') }}</p>
            </div>

            <PipelineEditor
              v-model:steps="pipelineSteps"
              :available-columns="availableColumns"
              :column-headers="currentSheetHeaders"
              :title="t('task.tasks.custom.actions.pipeline.title')"
            />

            <div class="step-actions">
              <button class="btn-secondary" @click="prevStep">{{ t('common.prev') }}</button>
              <button
                class="btn-primary"
                :disabled="pipelineSteps.length === 0"
                @click="executePipeline"
              >
                {{ t('common.confirm') }}
              </button>
            </div>
          </template>

          <!-- 多文件合并模式 -->
          <template v-else-if="currentAction?.id === 'merge-append' || currentAction?.id === 'merge-horizontal'">
            <MergeWizard
              @complete="handleMergeComplete"
              @cancel="prevStep"
            />
          </template>

          <!-- VLOOKUP 智能匹配模式 -->
          <template v-else-if="currentAction?.id === 'lookup-match'">
            <LookupWizard
              @complete="handleLookupComplete"
              @cancel="handleLookupCancel"
            />
          </template>

          <!-- 普通操作模式 -->
          <template v-else>
            <div class="config-section">
              <label class="config-label">{{ t('task.selectColumns') }}</label>
              <div class="selected-columns" v-if="selectedColumns.length > 0">
                {{ t('task.selectedColumns', { columns: step3ColumnNames.join(', ') }) }}
              </div>
              <p v-else class="no-selection">{{ t('task.noSelection') }}</p>
            </div>

            <!-- 根据不同任务显示不同的配置选项 -->
            <div class="config-section" v-if="currentAction">
              <label class="config-label">{{ currentAction.configLabel }}</label>
              <div class="config-options">
                <!-- 去重配置 -->
                <template v-if="currentAction.id === 'dedup-exact'">
                  <select v-model="actionConfig.keepStrategy">
                    <option value="first">{{ t('task.tasks.dedup.keepFirst') }}</option>
                    <option value="last">{{ t('task.tasks.dedup.keepLast') }}</option>
                    <option value="none">{{ t('task.tasks.dedup.deleteAll') }}</option>
                  </select>
                </template>

                <!-- 脱敏配置 -->
                <template v-else-if="currentAction.id === 'mask-id'">
                  <select v-model="actionConfig.maskType">
                    <option value="partial">{{ t('task.tasks.mask.partial') }}</option>
                    <option value="full">{{ t('task.tasks.mask.full') }}</option>
                    <option value="random">{{ t('task.tasks.mask.random') }}</option>
                  </select>
                </template>

                <!-- 手机号脱敏 -->
                <template v-else-if="currentAction.id === 'mask-phone'">
                  <select v-model="actionConfig.maskType">
                    <option value="partial">{{ t('task.tasks.mask.partial') }}</option>
                    <option value="full">{{ t('task.tasks.mask.full') }}</option>
                    <option value="random">{{ t('task.tasks.mask.random') }}</option>
                  </select>
                </template>

                <!-- 邮箱脱敏 -->
                <template v-else-if="currentAction.id === 'mask-email'">
                  <select v-model="actionConfig.maskType">
                    <option value="partial">{{ t('task.tasks.mask.partial') }}</option>
                    <option value="full">{{ t('task.tasks.mask.full') }}</option>
                  </select>
                </template>

                <!-- 姓名脱敏 -->
                <template v-else-if="currentAction.id === 'mask-name'">
                  <div class="mask-type-info">
                    <p class="mask-hint">{{ t('task.tasks.mask.nameHint') }}</p>
                  </div>
                  <select v-model="actionConfig.maskType" class="mask-type-select">
                    <option value="partial">{{ t('task.tasks.mask.partial') }}</option>
                    <option value="full">{{ t('task.tasks.mask.full') }}</option>
                    <option value="initial">{{ t('task.tasks.mask.initial') }}</option>
                  </select>
                  <div class="mask-preview">
                    <div class="preview-item">
                      <span class="preview-label">{{ t('task.tasks.mask.chinese') }}:</span>
                      <span class="preview-original">{{ t('task.tasks.mask.chineseExample') }}</span>
                      <span class="preview-arrow">→</span>
                      <span class="preview-result">{{ getMaskPreview('chinese') }}</span>
                    </div>
                    <div class="preview-item">
                      <span class="preview-label">{{ t('task.tasks.mask.english') }}:</span>
                      <span class="preview-original">{{ t('task.tasks.mask.englishExample') }}</span>
                      <span class="preview-arrow">→</span>
                      <span class="preview-result">{{ getMaskPreview('english') }}</span>
                    </div>
                  </div>
                </template>

                <!-- 按分隔符拆分配置 -->
                <template v-else-if="currentAction.id === 'split-delimiter'">
                  <div class="column-select-wrapper">
                    <label class="sub-label">{{ t('task.selectColumns') }}:</label>
                    <select v-model="actionConfig.splitColumn" class="column-select">
                      <option value="">-- {{ t('task.selectColumns') }} --</option>
                      <option v-for="(header, idx) in currentSheetHeaders" :key="idx" :value="idx">
                        {{ header || t('dataPreview.column', { index: idx + 1 }) }}
                      </option>
                    </select>
                  </div>
                  <input
                    type="text"
                    v-model="actionConfig.delimiter"
                    :placeholder="t('task.tasks.split.delimiter')"
                    class="delimiter-input"
                  />
                </template>

                <!-- 按固定宽度拆分配置 -->
                <template v-else-if="currentAction.id === 'split-width'">
                  <div class="column-select-wrapper">
                    <label class="sub-label">{{ t('task.selectColumns') }}</label>
                    <select v-model="actionConfig.splitColumn" class="column-select">
                      <option value="">-- {{ t('task.selectColumns') }} --</option>
                      <option v-for="(header, idx) in currentSheetHeaders" :key="idx" :value="idx">
                        {{ header || t('dataPreview.column', { index: idx + 1 }) }}
                      </option>
                    </select>
                  </div>
                  <div class="width-config">
                    <label class="sub-label">{{ t('task.tasks.split.widthHint') }}</label>
                    <input
                      type="text"
                      v-model="actionConfig.widthsStr"
                      :placeholder="t('task.tasks.split.widthPlaceholder')"
                      class="widths-input"
                    />
                    <p class="width-hint">{{ t('task.tasks.split.widthExample') }}</p>
                  </div>
                </template>

                <!-- 按列拆分为多Sheet配置 -->
                <template v-else-if="currentAction.id === 'split-to-sheets'">
                  <div class="column-select-wrapper">
                    <label class="sub-label">{{ t('task.tasks.split.selectColumn') }}:</label>
                    <select v-model="actionConfig.splitColumn" class="column-select">
                      <option value="">-- {{ t('task.selectColumns') }} --</option>
                      <option v-for="(header, idx) in currentSheetHeaders" :key="idx" :value="idx">
                        {{ header || t('dataPreview.column', { index: idx + 1 }) }}
                      </option>
                    </select>
                  </div>
                </template>

                <!-- 合并多列配置 -->
                <template v-else-if="currentAction.id === 'merge'">
                  <div class="column-select-wrapper">
                    <label class="sub-label">{{ t('task.selectColumns') }}:</label>
                    <div class="selected-columns" v-if="selectedColumns.length > 0">
                      {{ step3ColumnNames.join(', ') }}
                    </div>
                  </div>
                  <input
                    type="text"
                    v-model="actionConfig.separator"
                    :placeholder="t('task.tasks.split.joiner')"
                    class="separator-input"
                  />
                </template>

                <!-- 日期格式统一配置 -->
                <template v-else-if="currentAction.id === 'normalize-dates'">
                  <div class="column-select-wrapper">
                    <label class="sub-label">{{ t('task.selectColumns') }}:</label>
                    <select v-model="actionConfig.dateColumn" class="column-select">
                      <option value="">-- {{ t('task.selectColumns') }} --</option>
                      <option v-for="(header, idx) in currentSheetHeaders" :key="idx" :value="idx">
                        {{ header || t('dataPreview.column', { index: idx + 1 }) }}
                      </option>
                    </select>
                  </div>
                  <input
                    type="text"
                    v-model="actionConfig.targetFormat"
                    placeholder="YYYY-MM-DD"
                    class="date-format-input"
                  />
                </template>

                <!-- 排序配置 - 显示列名下拉选择 -->
                <template v-else-if="currentAction.id === 'sort-asc' || currentAction.id === 'sort-desc'">
                  <div class="column-select-wrapper">
                    <label class="sub-label">{{ t('task.tasks.sort.column') }}:</label>
                    <select v-model="actionConfig.sortColumn" class="column-select">
                      <option value="">-- {{ t('task.selectColumns') }} --</option>
                      <option v-for="(header, idx) in currentSheetHeaders" :key="idx" :value="idx">
                        {{ header || t('dataPreview.column', { index: idx + 1 }) }}
                      </option>
                    </select>
                  </div>
                </template>

                <!-- 批量运算配置 -->
                <template v-else-if="currentAction.id === 'batch-math'">
                  <div class="column-select-wrapper">
                    <label class="sub-label">{{ t('task.selectColumns') }}:</label>
                    <select v-model="actionConfig.mathColumn" class="column-select">
                      <option value="">-- {{ t('task.selectColumns') }} --</option>
                      <option v-for="(header, idx) in currentSheetHeaders" :key="idx" :value="idx">
                        {{ header || t('dataPreview.column', { index: idx + 1 }) }}
                      </option>
                    </select>
                  </div>
                  <div class="math-options">
                    <select v-model="actionConfig.operator" class="operator-select">
                      <option value="+">{{ t('task.tasks.calc.add') }} (+)</option>
                      <option value="-">{{ t('task.tasks.calc.subtract') }} (-)</option>
                      <option value="*">{{ t('task.tasks.calc.multiply') }} (×)</option>
                      <option value="/">{{ t('task.tasks.calc.divide') }} (÷)</option>
                    </select>
                    <input type="number" v-model="actionConfig.mathValue" :placeholder="t('task.tasks.calc.mathValuePlaceholder')" class="math-value-input" />
                  </div>
                </template>

                <!-- 分组汇总配置 -->
                <template v-else-if="currentAction.id === 'group-summary'">
                  <div class="column-select-wrapper">
                    <label class="sub-label">{{ t('task.tasks.calc.groupColumn') }}:</label>
                    <select v-model="actionConfig.groupColumn" class="column-select">
                      <option value="">-- {{ t('task.selectColumns') }} --</option>
                      <option v-for="(header, idx) in currentSheetHeaders" :key="idx" :value="idx">
                        {{ header || t('dataPreview.column', { index: idx + 1 }) }}
                      </option>
                    </select>
                  </div>
                  <div class="column-select-wrapper">
                    <label class="sub-label">{{ t('task.tasks.calc.aggColumn') }}:</label>
                    <select v-model="actionConfig.aggColumn" class="column-select">
                      <option value="">-- {{ t('task.selectColumns') }} --</option>
                      <option v-for="(header, idx) in currentSheetHeaders" :key="idx" :value="idx">
                        {{ header || t('dataPreview.column', { index: idx + 1 }) }}
                      </option>
                    </select>
                  </div>
                  <select v-model="actionConfig.aggType" class="agg-type-select">
                    <option value="sum">{{ t('task.tasks.calc.actions.sum.title') }}</option>
                    <option value="count">{{ t('task.tasks.calc.actions.count.title') }}</option>
                    <option value="avg">{{ t('task.tasks.calc.actions.avg.title') }}</option>
                    <option value="max">{{ t('task.tasks.calc.actions.max.title') }}</option>
                    <option value="min">{{ t('task.tasks.calc.actions.min.title') }}</option>
                  </select>
                </template>

                <!-- 正则提取配置 -->
                <template v-else-if="currentAction.id === 'extract-regex'">
                  <input
                    type="text"
                    v-model="actionConfig.regexPattern"
                    :placeholder="t('task.tasks.extract.pattern')"
                    class="regex-input"
                  />
                </template>

                <!-- 文本替换配置 -->
                <template v-else-if="currentAction.id === 'replace-text'">
                  <input
                    type="text"
                    v-model="actionConfig.searchText"
                    :placeholder="t('task.tasks.custom.searchPlaceholder')"
                    class="replace-input"
                  />
                  <input
                    type="text"
                    v-model="actionConfig.replaceText"
                    :placeholder="t('task.tasks.custom.replacePlaceholder')"
                    class="replace-input"
                  />
                </template>

                <!-- 字母映射替换配置 -->
                <template v-else-if="currentAction.id === 'letter-mapping'">
                  <div class="letter-mapping-container">
                    <div class="letter-mapping-header">
                      <span>{{ t('task.tasks.custom.letterMappingTitle') }}</span>
                    </div>
                    <div class="letter-mapping-rules">
                      <div
                        v-for="(rule, index) in letterMappingRules"
                        :key="index"
                        class="letter-mapping-row"
                      >
                        <input
                          type="text"
                          v-model="rule.from"
                          :placeholder="t('task.tasks.custom.letterFrom')"
                          class="letter-from-input"
                          maxlength="1"
                        />
                        <span class="arrow">→</span>
                        <input
                          type="text"
                          v-model="rule.to"
                          :placeholder="t('task.tasks.custom.letterTo')"
                          class="letter-to-input"
                          maxlength="1"
                        />
                        <button
                          v-if="letterMappingRules.length > 1"
                          @click="removeLetterMappingRule(index)"
                          class="remove-rule-btn"
                          type="button"
                        >
                          −
                        </button>
                        <button
                          v-if="index === letterMappingRules.length - 1"
                          @click="addLetterMappingRule"
                          class="add-rule-btn"
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 自定义脱敏配置 -->
                <template v-else-if="currentAction.id === 'custom-mask'">
                  <!-- 脱敏类型选择 -->
                  <div class="mask-type-selector">
                    <label class="sub-label">{{ t('task.tasks.custom.actions.customMask.maskType') || 'Mask Type' }}:</label>
                    <select v-model="actionConfig.maskType" class="mask-type-select">
                      <option value="quick">{{ t('task.tasks.custom.actions.customMask.quick') || 'Quick' }}</option>
                      <option value="regex">{{ t('task.tasks.custom.actions.customMask.regex') || 'Regex' }}</option>
                    </select>
                  </div>

                  <!-- 快速脱敏模式选择 -->
                  <div v-if="actionConfig.maskType === 'quick'" class="quick-mask-modes">
                    <label class="sub-label">{{ t('task.tasks.custom.actions.customMask.quickMode') || 'Quick Mode' }}:</label>
                    <div class="quick-mode-buttons">
                      <label class="quick-mode-btn">
                        <input type="radio" v-model="actionConfig.quickMode" value="keep-2-sides" />
                        <span>{{ t('task.tasks.custom.actions.customMask.quickModes.keep-2-sides') }}</span>
                      </label>
                      <label class="quick-mode-btn">
                        <input type="radio" v-model="actionConfig.quickMode" value="skip-one" />
                        <span>{{ t('task.tasks.custom.actions.customMask.quickModes.skip-one') }}</span>
                      </label>
                      <label class="quick-mode-btn">
                        <input type="radio" v-model="actionConfig.quickMode" value="keep-first-half" />
                        <span>{{ t('task.tasks.custom.actions.customMask.quickModes.keep-first-half') }}</span>
                      </label>
                      <label class="quick-mode-btn">
                        <input type="radio" v-model="actionConfig.quickMode" value="keep-last-half" />
                        <span>{{ t('task.tasks.custom.actions.customMask.quickModes.keep-last-half') }}</span>
                      </label>
                    </div>
                    <p class="mask-example">
                      <template v-if="actionConfig.quickMode === 'keep-2-sides'">{{ t('task.tasks.custom.actions.customMask.examples.keep2sides') }}</template>
                      <template v-else-if="actionConfig.quickMode === 'skip-one'">{{ t('task.tasks.custom.actions.customMask.examples.skipOne') }}</template>
                      <template v-else-if="actionConfig.quickMode === 'keep-first-half'">{{ t('task.tasks.custom.actions.customMask.examples.keepFirstHalf') }}</template>
                      <template v-else-if="actionConfig.quickMode === 'keep-last-half'">{{ t('task.tasks.custom.actions.customMask.examples.keepLastHalf') }}</template>
                    </p>
                  </div>

                  <!-- 正则脱敏配置 -->
                  <div v-if="actionConfig.maskType === 'regex'" class="regex-mask-config">
                    <input
                      type="text"
                      v-model="actionConfig.pattern"
                      :placeholder="t('task.tasks.custom.patternPlaceholder') || 'Regex pattern'"
                      class="mask-pattern-input"
                    />
                    <input
                      type="text"
                      v-model="actionConfig.replaceWith"
                      :placeholder="t('task.tasks.custom.actions.customMask.replaceWith') || 'Replace with'"
                      class="mask-replace-input"
                    />
                  </div>
                </template>

                <!-- 数字修约配置 -->
                <template v-else-if="currentAction.id === 'round-numbers'">
                  <div class="round-config">
                    <label class="sub-label">{{ t('task.tasks.custom.decimalPlaces') }}:</label>
                    <input type="number" v-model="actionConfig.decimals" min="0" max="10" value="2" class="decimals-input" />
                  </div>
                </template>

                <!-- 全角半角转换配置 -->
                <template v-else-if="currentAction.id === 'convert-width'">
                  <select v-model="actionConfig.widthType" class="width-type-select">
                    <option value="toHalfWidth">{{ t('task.tasks.custom.toHalfWidth') }}</option>
                    <option value="toFullWidth">{{ t('task.tasks.custom.toFullWidth') }}</option>
                  </select>
                </template>

                <!-- 移除特殊字符配置 -->
                <template v-else-if="currentAction.id === 'remove-special-chars'">
                  <input
                    type="text"
                    v-model="actionConfig.removeChars"
                    :placeholder="currentAction.configPlaceholder"
                    class="remove-chars-input"
                  />
                  <p class="remove-chars-hint">{{ t('task.tasks.clean.specialCharsHint') }}</p>
                </template>

                <!-- 通用文本配置 -->
                <template v-else-if="currentAction.configPlaceholder && currentAction.id !== 'to-sql-inquery'">
                  <input
                    type="text"
                    v-model="actionConfig.customValue"
                    :placeholder="currentAction.configPlaceholder"
                  />
                </template>

                <!-- SQL IN查询配置 - 需要选择列 -->
                <template v-else-if="currentAction.id === 'to-sql-inquery'">
                  <div class="column-select-wrapper">
                    <label class="sub-label">{{ currentAction.configLabel || t('task.tasks.convert.actions.sqlInquery.columnLabel') }}:</label>
                    <select v-model="actionConfig.column" class="column-select">
                      <option value="">-- {{ t('task.selectColumns') }} --</option>
                      <option v-for="(header, idx) in currentSheetHeaders" :key="idx" :value="idx">
                        {{ header || t('dataPreview.column', { index: idx + 1 }) }}
                      </option>
                    </select>
                  </div>
                </template>

                <!-- 多文件合并配置 -->
                <template v-else-if="currentAction.id === 'merge-append' || currentAction.id === 'merge-horizontal'">
                  <div class="merge-config">
                    <div class="config-section">
                      <label class="config-label">{{ t('task.tasks.merge.deduplicate') }}</label>
                      <label class="checkbox-label">
                        <input type="checkbox" v-model="actionConfig.deduplicate" />
                        {{ t('task.tasks.merge.deduplicate') }}
                      </label>
                    </div>
                    <div class="config-section" v-if="actionConfig.deduplicate">
                      <label class="config-label">{{ t('task.tasks.merge.deduplicateColumns') }}</label>
                      <div class="checkbox-grid">
                        <label v-for="(header, idx) in currentSheetHeaders" :key="idx">
                          <input type="checkbox" :value="idx" v-model="actionConfig.deduplicateColumns" />
                          {{ header || t('dataPreview.column', { index: idx + 1 }) }}
                        </label>
                      </div>
                    </div>
                    <div class="config-section">
                      <label class="config-label">{{ t('task.tasks.merge.keepFirst') }}</label>
                      <select v-model="actionConfig.keepStrategy" class="config-select">
                        <option value="first">{{ t('task.tasks.dedup.keepFirst') }}</option>
                        <option value="last">{{ t('task.tasks.dedup.keepLast') }}</option>
                      </select>
                    </div>
                  </div>
                </template>

                <!-- VLOOKUP 匹配配置 -->
                <template v-else-if="currentAction.id === 'lookup-match'">
                  <div class="lookup-config">
                    <div class="config-section">
                      <label class="config-label">{{ t('task.tasks.lookup.keyColumn') }}</label>
                      <select v-model="actionConfig.keyColumn" class="config-select">
                        <option v-for="(header, idx) in currentSheetHeaders" :key="idx" :value="idx">
                          {{ header || t('dataPreview.column', { index: idx + 1 }) }}
                        </option>
                      </select>
                    </div>
                    <div class="config-section">
                      <label class="config-label">{{ t('task.tasks.lookup.returnColumns') }}</label>
                      <div class="checkbox-grid">
                        <label v-for="(header, idx) in currentSheetHeaders" :key="idx">
                          <input type="checkbox" :value="idx" v-model="actionConfig.returnColumns" />
                          {{ header || t('dataPreview.column', { index: idx + 1 }) }}
                        </label>
                      </div>
                    </div>
                    <div class="config-section">
                      <label class="config-label">{{ t('task.tasks.lookup.fuzzyMatch') }}</label>
                      <label class="checkbox-label">
                        <input type="checkbox" v-model="actionConfig.fuzzyMatch" />
                        {{ t('task.tasks.lookup.fuzzyMatchHint') }}
                      </label>
                    </div>
                    <div class="config-section">
                      <label class="config-label">{{ t('task.tasks.lookup.ifNotFound') }}</label>
                      <input type="text" v-model="actionConfig.ifNotFound" placeholder="#N/A" class="config-input" />
                    </div>
                  </div>
                </template>

                <!-- 工资条拆分配置 -->
                <template v-else-if="currentAction.id === 'wage-slip-split'">
                  <div class="wage-config">
                    <div class="config-section">
                      <label class="config-label">{{ t('task.tasks.wage.selectNameColumn') }}</label>
                      <select v-model="actionConfig.nameColumn" class="config-select">
                        <option v-for="(header, idx) in currentSheetHeaders" :key="idx" :value="idx">
                          {{ header || t('dataPreview.column', { index: idx + 1 }) }}
                        </option>
                      </select>
                    </div>
                  </div>
                </template>

                <!-- 不需要额外配置的操作 -->
                <template v-else>
                  <p class="no-extra-config">{{ t('task.noExtraConfig') }}</p>
                </template>
              </div>
            </div>

            <div class="step-actions">
              <button class="btn-secondary" @click="prevStep">{{ t('common.prev') }}</button>
              <button
                class="btn-primary"
                @click="executeAndPreview"
              >
                {{ t('common.confirm') }}
              </button>
            </div>
          </template>
        </div>

        <!-- 步骤4: 预览结果 -->
        <div v-if="currentStep === 3" class="step-panel">
          <h2>{{ t('task.previewTitle') }}</h2>

          <!-- 文本类型输出（CSV/JSON/SQL）的预览 -->
          <template v-if="isTextOutput">
            <div class="text-preview">
              <pre>{{ previewText || t('task.emptyPreview') }}</pre>
            </div>
            <div class="result-summary">
              <div class="summary-item">
                <span class="summary-label">{{ t('task.processedRows') }}:</span>
                <span class="summary-value">{{ Array.isArray(processedResult) ? processedResult.length : '-' }}</span>
              </div>
            </div>
          </template>

          <!-- 多Sheet类型输出的预览 -->
          <template v-else-if="isMultiSheetOutput">
            <div class="result-summary">
              <div class="summary-item">
                <span class="summary-label">{{ t('task.tasks.split.sheetCount') }}:</span>
                <span class="summary-value">{{ processedInfo.sheetCount }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">{{ t('task.processedRows') }}:</span>
                <span class="summary-value">{{ processedInfo.totalRows }}</span>
              </div>
            </div>
            <div class="sheet-list">
              <div
                v-for="(sheet, idx) in processedResult.sheets"
                :key="idx"
                class="sheet-item"
                :class="{ 'is-active': activePreviewSheet === idx }"
                @click="activePreviewSheet = idx"
              >
                <span class="sheet-name">{{ sheet.name }}</span>
                <span class="sheet-rows">{{ sheet.data.length - 1 }} {{ t('task.tasks.split.rows') }}</span>
              </div>
            </div>
            <DataPreview
              v-if="processedResult.sheets && processedResult.sheets[activePreviewSheet]"
              :data="processedResult.sheets[activePreviewSheet].data"
              :show-footer="false"
            />
          </template>

          <!-- 表格类型输出的预览 -->
          <template v-else>
            <div class="result-summary">
              <div class="summary-item">
                <span class="summary-label">{{ t('task.processedRows') }}:</span>
                <span class="summary-value">{{ processedResult.length }}</span>
              </div>
              <div class="summary-item" v-if="processedInfo.removedCount">
                <span class="summary-label">{{ t('task.removedRows') }}:</span>
                <span class="summary-value">{{ processedInfo.removedCount }}</span>
              </div>
            </div>

            <DataPreview
              v-if="Array.isArray(processedResult)"
              :data="processedResult"
              :show-footer="false"
            />
          </template>

          <div class="step-actions">
            <button class="btn-secondary" @click="prevStep">{{ t('task.returnToModify') }}</button>
            <button class="btn-primary" @click="exportResult">
              {{ t('common.export') }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useFileStore } from '@/stores/fileStore'
import FileUploader from '@/components/common/FileUploader.vue'
import DataPreview from '@/components/common/DataPreview.vue'
import { toast } from '@/services/toastService'
import { executeOperation } from '@/utils/operations/registry.js'
import { createPipelineEngine } from '@/services/pipeline/PipelineEngine.js'
import { getTaskIdByAction, matchColumnName } from '@/services/intent/intentConfig.js'

// 动态导入：仅在需要时加载大体积模块
const PipelineEditor = defineAsyncComponent(() => import('@/components/pipeline/PipelineEditor.vue'))
const MergeWizard = defineAsyncComponent(() => import('@/components/merge/MergeWizard.vue'))
const LookupWizard = defineAsyncComponent(() => import('@/components/lookup/LookupWizard.vue'))
// Lucide 图标导入
import {
  Trash2, Key, UserX, Smartphone, Mail, User,
  Scissors, Ruler, Link, RefreshCw, MailOpen, Pencil, Search,
  ArrowUp, ArrowDown, Dice1, Calendar, FileText, ClipboardList,
  Database, BarChart3, Settings, Palette, Type, Globe, Target,
  Hash, Sigma, Binary, Calculator, ListOrdered, ListChecks,
  AlignStartVertical, CaseUpper, CaseLower, StretchHorizontal,
  FileSpreadsheet, Copy, SplitSquareHorizontal, Columns2,
  Files, SearchX, Banknote
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const fileStore = useFileStore()

// Lucide 图标映射表
const iconMap = {
  'dedup-exact': Trash2,
  'dedup-key': Key,
  'mask-id': UserX,
  'mask-phone': Smartphone,
  'mask-email': Mail,
  'mask-name': User,
  'split-delimiter': Scissors,
  'split-width': Ruler,
  'split-to-sheets': SplitSquareHorizontal,
  'merge': Link,
  'transpose': RefreshCw,
  'remove-empty-rows': Trash2,
  'remove-empty-cols': MailOpen,
  'trim-whitespace': Pencil,
  'remove-all-spaces': Search,
  'remove-special-chars': Hash,
  'sort-asc': ArrowUp,
  'sort-desc': ArrowDown,
  'shuffle': Dice1,
  'normalize-dates': Calendar,
  'to-csv': FileText,
  'to-json': ClipboardList,
  'to-sql-insert': Database,
  'to-sql-inquery': Search,
  'column-to-string': ListOrdered,
  'calculate-sum': Sigma,
  'calculate-count': ListChecks,
  'calculate-avg': BarChart3,
  'calculate-max': ArrowUp,
  'calculate-min': ArrowDown,
  'batch-math': Calculator,
  'group-summary': ListOrdered,
  'pipeline': Settings,
  'replace-text': Copy,
  'letter-mapping': AlignStartVertical,
  'custom-mask': Palette,
  'to-upper': CaseUpper,
  'to-lower': CaseLower,
  'capitalize': Type,
  'convert-width': StretchHorizontal,
  'round-numbers': Target,
  // 多文件合并
  'merge-append': Files,
  'merge-horizontal': Columns2,
  // VLOOKUP 匹配
  'lookup-match': SearchX,
  // 工资条拆分
  'wage-slip-split': Banknote
}

// 状态
const currentStep = ref(0)
const selectedColumns = ref([])
const processedResult = ref([])
const processedInfo = ref({})
const actionConfig = ref({})
const currentAction = ref(null)
const activePreviewSheet = ref(0)

// 字母映射规则
const letterMappingRules = ref([{ from: '', to: '' }])

// 添加字母映射规则
function addLetterMappingRule() {
  letterMappingRules.value.push({ from: '', to: '' })
}

// 移除字母映射规则
function removeLetterMappingRule(index) {
  letterMappingRules.value.splice(index, 1)
}

// 管道相关状态
const pipelineSteps = ref([])
const pipelineEngine = ref(null)

// 步骤定义
const stepKeys = ['selectAction', 'uploadFile', 'config', 'preview']

// 计算属性
const currentTask = computed(() => {
  const taskId = route.params.taskId
  if (!taskId) return null

  const taskMap = {
    dedup: {
      title: t('task.tasks.dedup.title'),
      description: t('task.tasks.dedup.description'),
      actions: [
        { id: 'dedup-exact', title: t('task.tasks.dedup.actions.exact.title'), hint: t('task.tasks.dedup.actions.exact.hint'), configLabel: t('task.tasks.dedup.strategy') },
        { id: 'dedup-key', title: t('task.tasks.dedup.actions.key.title'), hint: t('task.tasks.dedup.actions.key.hint'), configLabel: t('task.tasks.dedup.strategy') }
      ]
    },
    mask: {
      title: t('task.tasks.mask.title'),
      description: t('task.tasks.mask.description'),
      actions: [
        { id: 'mask-id', title: t('task.tasks.mask.actions.id.title'), hint: t('task.tasks.mask.actions.id.hint'), configLabel: t('task.tasks.mask.method') },
        { id: 'mask-phone', title: t('task.tasks.mask.actions.phone.title'), hint: t('task.tasks.mask.actions.phone.hint'), configLabel: t('task.tasks.mask.method') },
        { id: 'mask-email', title: t('task.tasks.mask.actions.email.title'), hint: t('task.tasks.mask.actions.email.hint'), configLabel: t('task.tasks.mask.method') },
        { id: 'mask-name', title: t('task.tasks.mask.actions.name.title'), hint: t('task.tasks.mask.actions.name.hint'), configLabel: t('task.tasks.mask.method') }
      ]
    },
    split: {
      title: t('task.tasks.split.title'),
      description: t('task.tasks.split.description'),
      actions: [
        { id: 'split-delimiter', title: t('task.tasks.split.actions.delimiter.title'), hint: t('task.tasks.split.actions.delimiter.hint'), configLabel: t('task.tasks.split.delimiter'), configPlaceholder: '' },
        { id: 'split-width', title: t('task.tasks.split.actions.width.title'), hint: t('task.tasks.split.actions.width.hint'), configLabel: t('task.tasks.split.width') },
        { id: 'split-to-sheets', title: t('task.tasks.split.actions.toSheets.title'), hint: t('task.tasks.split.actions.toSheets.hint'), configLabel: t('task.tasks.split.selectColumn') },
        { id: 'merge', title: t('task.tasks.split.actions.merge.title'), hint: t('task.tasks.split.actions.merge.hint'), configLabel: t('task.tasks.split.joiner'), configPlaceholder: '' },
        { id: 'transpose', title: t('task.tasks.split.actions.transpose.title'), hint: t('task.tasks.split.actions.transpose.hint'), configLabel: '' }
      ]
    },
    clean: {
      title: t('task.tasks.clean.title'),
      description: t('task.tasks.clean.description'),
      actions: [
        { id: 'remove-empty-rows', title: t('task.tasks.clean.actions.emptyRows.title'), hint: t('task.tasks.clean.actions.emptyRows.hint'), configLabel: '' },
        { id: 'remove-empty-cols', title: t('task.tasks.clean.actions.emptyCols.title'), hint: t('task.tasks.clean.actions.emptyCols.hint'), configLabel: '' },
        { id: 'trim-whitespace', title: t('task.tasks.clean.actions.trim.title'), hint: t('task.tasks.clean.actions.trim.hint'), configLabel: '' },
        { id: 'remove-all-spaces', title: t('task.tasks.clean.actions.removeSpaces.title'), hint: t('task.tasks.clean.actions.removeSpaces.hint'), configLabel: '' },
        { id: 'remove-special-chars', title: t('task.tasks.clean.actions.specialChars.title'), hint: t('task.tasks.clean.actions.specialChars.hint'), configLabel: t('task.tasks.clean.actions.specialChars.label'), configPlaceholder: t('task.tasks.clean.actions.specialChars.placeholder') }
      ]
    },
    sort: {
      title: t('task.tasks.sort.title'),
      description: t('task.tasks.sort.description'),
      actions: [
        { id: 'sort-asc', title: t('task.tasks.sort.actions.asc.title'), hint: t('task.tasks.sort.actions.asc.hint'), configLabel: t('task.tasks.sort.column') },
        { id: 'sort-desc', title: t('task.tasks.sort.actions.desc.title'), hint: t('task.tasks.sort.actions.desc.hint'), configLabel: t('task.tasks.sort.column') },
        { id: 'shuffle', title: t('task.tasks.sort.actions.shuffle.title'), hint: t('task.tasks.sort.actions.shuffle.hint'), configLabel: '' }
      ]
    },
    date: {
      title: t('task.tasks.date.title'),
      description: t('task.tasks.date.description'),
      actions: [
        { id: 'normalize-dates', title: t('task.tasks.date.actions.format.title'), hint: t('task.tasks.date.actions.format.hint'), configLabel: t('task.tasks.date.targetFormat'), configPlaceholder: 'YYYY-MM-DD' }
      ]
    },
    convert: {
      title: t('task.tasks.convert.title'),
      description: t('task.tasks.convert.description'),
      actions: [
        { id: 'to-csv', title: t('task.tasks.convert.actions.csv.title'), hint: t('task.tasks.convert.actions.csv.hint'), configLabel: '' },
        { id: 'to-json', title: t('task.tasks.convert.actions.json.title'), hint: t('task.tasks.convert.actions.json.hint'), configLabel: '' },
        { id: 'to-sql-insert', title: t('task.tasks.convert.actions.sqlInsert.title'), hint: t('task.tasks.convert.actions.sqlInsert.hint'), configLabel: '' },
        { id: 'to-sql-inquery', title: t('task.tasks.convert.actions.sqlInquery.title'), hint: t('task.tasks.convert.actions.sqlInquery.hint'), configLabel: t('task.tasks.convert.actions.sqlInquery.columnLabel') }
      ]
    },
    extract: {
      title: t('task.tasks.extract.title'),
      description: t('task.tasks.extract.description'),
      actions: [
        { id: 'column-to-string', title: t('task.tasks.extract.actions.columnToString.title'), hint: t('task.tasks.extract.actions.columnToString.hint'), configLabel: t('task.tasks.extract.selectColumn') }
      ]
    },
    calc: {
      title: t('task.tasks.calc.title'),
      description: t('task.tasks.calc.description'),
      actions: [
        { id: 'calculate-sum', title: t('task.tasks.calc.actions.sum.title'), hint: t('task.tasks.calc.actions.sum.hint'), configLabel: '' },
        { id: 'calculate-count', title: t('task.tasks.calc.actions.count.title'), hint: t('task.tasks.calc.actions.count.hint'), configLabel: '' },
        { id: 'calculate-avg', title: t('task.tasks.calc.actions.avg.title'), hint: t('task.tasks.calc.actions.avg.hint'), configLabel: '' },
        { id: 'calculate-max', title: t('task.tasks.calc.actions.max.title'), hint: t('task.tasks.calc.actions.max.hint'), configLabel: '' },
        { id: 'calculate-min', title: t('task.tasks.calc.actions.min.title'), hint: t('task.tasks.calc.actions.min.hint'), configLabel: '' },
        { id: 'batch-math', title: t('task.tasks.calc.actions.batchMath.title'), hint: t('task.tasks.calc.actions.batchMath.hint'), configLabel: '' },
        { id: 'group-summary', title: t('task.tasks.calc.actions.groupSummary.title'), hint: t('task.tasks.calc.actions.groupSummary.hint'), configLabel: '' }
      ]
    },
    custom: {
      title: t('task.tasks.custom.title'),
      description: t('task.tasks.custom.description'),
      actions: [
        { id: 'pipeline', title: t('task.tasks.custom.actions.pipeline.title'), hint: t('task.tasks.custom.actions.pipeline.hint'), configLabel: '' },
        { id: 'replace-text', title: t('task.tasks.custom.actions.replace.title'), hint: t('task.tasks.custom.actions.replace.hint'), configLabel: t('task.tasks.custom.replaceConfig') },
        { id: 'letter-mapping', title: t('task.tasks.custom.actions.letterMapping.title'), hint: t('task.tasks.custom.actions.letterMapping.hint'), configLabel: t('task.tasks.custom.letterMappingConfig') },
        { id: 'custom-mask', title: t('task.tasks.custom.actions.customMask.title'), hint: t('task.tasks.custom.actions.customMask.hint'), configLabel: t('task.tasks.custom.pattern') },
        { id: 'to-upper', title: t('task.tasks.custom.actions.toUpper.title'), hint: t('task.tasks.custom.actions.toUpper.hint'), configLabel: '' },
        { id: 'to-lower', title: t('task.tasks.custom.actions.toLower.title'), hint: t('task.tasks.custom.actions.toLower.hint'), configLabel: '' },
        { id: 'capitalize', title: t('task.tasks.custom.actions.capitalize.title'), hint: t('task.tasks.custom.actions.capitalize.hint'), configLabel: '' },
        { id: 'convert-width', title: t('task.tasks.custom.actions.convertWidth.title'), hint: t('task.tasks.custom.actions.convertWidth.hint'), configLabel: '' },
        { id: 'round-numbers', title: t('task.tasks.custom.actions.roundNumbers.title'), hint: t('task.tasks.custom.actions.roundNumbers.hint'), configLabel: '' }
      ]
    },
    merge: {
      title: t('task.tasks.merge.title'),
      description: t('task.tasks.merge.description'),
      actions: [
        { id: 'merge-append', title: t('task.tasks.merge.actions.append.title'), hint: t('task.tasks.merge.actions.append.hint'), configLabel: t('task.tasks.merge.mergeMode') },
        { id: 'merge-horizontal', title: t('task.tasks.merge.actions.horizontal.title'), hint: t('task.tasks.merge.actions.horizontal.hint'), configLabel: t('task.tasks.merge.mergeMode') }
      ]
    },
    lookup: {
      title: t('task.tasks.lookup.title'),
      description: t('task.tasks.lookup.description'),
      actions: [
        { id: 'lookup-match', title: t('task.tasks.lookup.actions.match.title'), hint: t('task.tasks.lookup.actions.match.hint'), configLabel: t('task.tasks.lookup.keyColumn') }
      ]
    },
    wage: {
      title: t('task.tasks.wage.title'),
      description: t('task.tasks.wage.description'),
      actions: [
        { id: 'wage-slip-split', title: t('task.tasks.wage.actions.split.title'), hint: t('task.tasks.wage.actions.split.hint'), configLabel: t('task.tasks.wage.exportFormat') }
      ]
    }
  }

  return taskMap[taskId] || null
})

const currentSheetData = computed(() => {
  if (!fileStore.workbookData || !fileStore.activeSheet) return []
  return fileStore.activeSheet.data
})

// 可用的列索引
const availableColumns = computed(() => {
  if (!currentSheetData.value || currentSheetData.value.length === 0) return []
  const header = currentSheetData.value[0] || []
  return header.map((_, index) => index)
})

// 计算选中列的真实表头名称
const selectedColumnNames = computed(() => {
  if (!currentSheetHeaders.value || selectedColumns.value.length === 0) return []
  return selectedColumns.value.map(i => currentSheetHeaders.value[i] || t('dataPreview.column', { index: i + 1 }))
})

// 获取第3步选中列的显示名称
const step3ColumnNames = computed(() => {
  if (!currentSheetHeaders.value || selectedColumns.value.length === 0) {
    return selectedColumns.value.map(i => t('dataPreview.column', { index: i + 1 }))
  }
  return selectedColumns.value.map(i => currentSheetHeaders.value[i] || t('dataPreview.column', { index: i + 1 }))
})

// 当前工作表的表头
const currentSheetHeaders = computed(() => {
  if (!currentSheetData.value || currentSheetData.value.length === 0) return []
  return currentSheetData.value[0] || []
})

// 是否是文本输出类型的操作（输出为CSV/JSON/SQL等文本格式）
const isTextOutput = computed(() => {
  const data = processedResult.value
  // 管道模式下，如果输出是字符串或字符串数组（SQL/CSV/JSON等），按文本预览显示
  if (pipelineSteps.value.length > 0) {
    if (typeof data === 'string') return true
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
      return true
    }
  }
  const actionId = currentAction.value?.id
  return actionId === 'to-csv' || actionId === 'to-json' || actionId === 'to-sql-insert' || actionId === 'to-sql-inquery' || actionId === 'column-to-string'
})

// 是否是多Sheet输出类型的操作（按列拆分为多Sheet）
const isMultiSheetOutput = computed(() => {
  const actionId = currentAction.value?.id
  // 直接选择 split-to-sheets 操作
  if (actionId === 'split-to-sheets') return true
  // 管道模式：检查管道步骤中是否包含 split-to-sheets，且结果数据包含 sheets 属性
  if (actionId === 'pipeline' && pipelineSteps.value.some(step => step.operation === 'split-to-sheets')) {
    return processedResult.value?.sheets != null
  }
  return false
})

// 文本预览内容（限制显示前100行）
const previewText = computed(() => {
  const data = processedResult.value
  console.log('previewText data:', data, 'type:', typeof data, 'isArray:', Array.isArray(data))
  if (!data) return ''
  if (typeof data === 'string') {
    return data.split('\n').slice(0, 100).join('\n')
  }
  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'string') {
      return data.slice(0, 100).join('\n')
    }
    return JSON.stringify(data, null, 2).split('\n').slice(0, 100).join('\n')
  }
  return String(data)
})

// 方法
// 返回首页 - 清除上传文件和配置参数缓存
function goHome() {
  // 清除文件存储
  fileStore.clearFiles()
  fileStore.clearMultiFiles()
  fileStore.clearLookupTables()
  fileStore.selectedActionId = null

  // 清除配置参数
  selectedColumns.value = []
  processedResult.value = []
  processedInfo.value = {}
  actionConfig.value = {}
  currentAction.value = null

  // 清除管道相关状态
  pipelineSteps.value = []

  // 清除字母映射规则
  letterMappingRules.value = [{ from: '', to: '' }]

  // 重置步骤
  currentStep.value = 0

  router.push('/')
}

function selectAction(action) {
  currentAction.value = action
  // 重置管道步骤
  if (action.id === 'pipeline') {
    pipelineSteps.value = []
  }
  // 重置配置
  actionConfig.value = {}
  // 重置字母映射规则
  if (action.id === 'letter-mapping') {
    letterMappingRules.value = [{ from: '', to: '' }]
  }

  // 自定义脱敏默认配置
  if (action.id === 'custom-mask') {
    actionConfig.value = {
      maskType: 'quick',
      quickMode: 'keep-2-sides',
      pattern: '',
      replaceWith: '***'
    }
  }

  // 保存合并操作的 actionId
  if (action.id === 'merge-append' || action.id === 'merge-horizontal') {
    fileStore.selectedActionId = action.id
    // 清除之前的多文件数据
    fileStore.clearMultiFiles()
  }

  // VLOOKUP 匹配操作：跳到步骤3，使用独立向导
  if (action.id === 'lookup-match') {
    currentStep.value = 2
  } else {
    nextStep()
  }
}

function nextStep() {
  if (currentStep.value < stepKeys.length - 1) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

/**
 * 将管道步骤或单意图中的 suggestedColName 匹配到实际文件表头列索引
 * - 管道模式：遍历 pipelineSteps 中的每个步骤
 * - 单意图模式：从 route.query.suggestedColName 读取并匹配
 * @param {Array[]} fileData - 文件二维数组数据（首行为表头）
 */
function resolveStepColumnNames(fileData) {
  if (!fileData || fileData.length === 0) return
  const headers = fileData[0] || []
  if (headers.length === 0) return

  // ========== 管道模式：匹配每个步骤的列名提示 ==========
  if (currentAction.value?.id === 'pipeline' && pipelineSteps.value.length > 0) {
    let changed = false
    for (const step of pipelineSteps.value) {
      const suggestedName = step.params?.suggestedColName
      if (!suggestedName) continue
      // 已经匹配过则跳过
      if (step.params?.colIndex !== undefined) continue

      const colIndex = matchColumnName(suggestedName, headers)
      if (colIndex !== null) {
        step.params = { ...step.params, colIndex }
        changed = true
        console.log(`[resolveStepColumnNames] 管道步骤列名匹配: "${suggestedName}" → 列${colIndex} (${headers[colIndex]})`)
      }
    }

    if (changed) {
      // 管道模式保持全选所有列，不缩小到仅步骤涉及的列
      const totalCols = headers.length
      selectedColumns.value = Array.from({ length: totalCols }, (_, i) => i)
    }
    return
  }

  // ========== 单意图模式：从 URL 参数读取列名提示 ==========
  const suggestedColName = route.query.suggestedColName
  if (suggestedColName && selectedColumns.value.length === 0) {
    const colIndex = matchColumnName(suggestedColName, headers)
    if (colIndex !== null) {
      selectedColumns.value = [colIndex]
      // 同时更新 actionConfig 中的 colIndex
      if (currentAction.value) {
        actionConfig.value.colIndex = colIndex
      }
      console.log(`[resolveStepColumnNames] 单意图列名匹配: "${suggestedColName}" → 列${colIndex} (${headers[colIndex]})`)
    }
  }
}

async function handleFileSelected(fileOrFiles) {
  const { parseFile } = await import('@/utils/parser/xlsxParser')
  console.log('handleFileSelected 被调用', { file: fileOrFiles, actionId: currentAction.value?.id })
  try {
    fileStore.setLoading(true)
    fileStore.setError(null)

    // 统一为数组
    const files = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles]
    console.log('待处理文件数量:', files.length)

    // 多文件合并模式：支持多次添加文件
    if (currentAction.value?.id === 'merge-append' || currentAction.value?.id === 'merge-horizontal') {
      for (const file of files) {
        try {
          const result = await parseFile(file)
          console.log('parseFile result', result)
          if (result.success) {
            fileStore.addMultiFile({
              id: Date.now() + Math.random(),
              name: file.name,
              size: file.size,
              type: file.type,
              sheets: result.sheets.map(s => ({ name: s.name, data: s.data })),
              selectedSheets: [0]
            })
            console.log('fileStore.multiFileData', fileStore.multiFileData)
          } else {
            throw new Error(result.error)
          }
        } catch (error) {
          console.error('文件处理失败:', file.name, error)
          fileStore.setError(file.name + ': ' + (error.message || t('task.fileProcessFailed')))
        }
      }
    } else {
      // 单文件上传（普通操作）
      const file = files[0]  // 取第一个文件
      try {
        fileStore.clearFiles()
        fileStore.addFile(file)
        const result = await parseFile(file)
        console.log('parseFile result:', result)
        if (!result.success) {
          throw new Error(result.error || t('task.fileParseFailed'))
        }
        if (!result.sheets || result.sheets.length === 0) {
          throw new Error(t('task.noSheetData'))
        }
        const firstSheet = result.sheets[0]
        if (!firstSheet.data || firstSheet.data.length === 0) {
          throw new Error(t('task.emptySheetData'))
        }
        fileStore.setWorkbookData(result)
        console.log('workbookData 已设置, sheet数据行数:', firstSheet.data.length)

        // ========== 管道模式：默认全选所有列，方便后续环节处理 ==========
        if (currentAction.value?.id === 'pipeline') {
          const totalCols = (firstSheet.data[0] || []).length
          selectedColumns.value = Array.from({ length: totalCols }, (_, i) => i)
        }

        // ========== 自动匹配管道步骤的列名提示 ==========
        resolveStepColumnNames(firstSheet.data)

        // ========== 处理待解析的意图查询 ==========
        if (fileStore.pendingIntentQuery) {
          const queryText = fileStore.pendingIntentQuery
          const fileData = firstSheet.data
          console.log('=== handleFileSelected 待解析意图 ===')
          console.log('queryText:', queryText)
          console.log('fileData 行数:', fileData?.length)
          console.log('文件列名:', fileData?.[0])
          const { parseIntent } = await import('@/services/intent/IntentEngine.js')
          const parsed = await parseIntent(queryText, fileData)
          console.log('parsed 结果:', JSON.stringify(parsed))

          if (parsed.success) {
            fileStore.setPendingIntentResult(parsed)
            fileStore.clearIntentState() // 只清除意图状态，保留文件数据

            // 跳转到对应的配置页面
            if (parsed.isSingle) {
              const intent = parsed.intents[0]
              const actionId = intent.params.actionId
              const taskId = getTaskIdByAction(actionId)
              router.push({
                name: 'task',
                params: { taskId },
                query: {
                  actionId,
                  auto: 'true',
                  colIndex: intent.params.colIndex,
                  ...Object.fromEntries(
                    Object.entries(intent.params).filter(([key]) => key !== 'actionId' && key !== 'colIndex')
                  )
                }
              })
            } else {
              // 多意图：生成管道步骤
              const steps = parsed.intents.map((intent, idx) => ({
                id: `step_${idx}`,
                operation: intent.params.actionId,
                name: intent.intent,
                params: intent.params,
                enabled: true
              }))
              console.log('=== 准备跳转到管道页面 ===')
              console.log('steps:', JSON.stringify(steps))

              // 同时使用 fileStore 和 URL 传递 steps（双重保险）
              fileStore.setPendingPipelineSteps(steps)

              router.push({
                name: 'task',
                params: { taskId: 'custom' },
                query: {
                  actionId: 'pipeline',
                  auto: 'true',
                  steps: JSON.stringify(steps)
                }
              })
              console.log('router.push 完成')
            }
          }
        }
      } catch (error) {
        console.error('文件处理失败:', error)
        fileStore.setError(error.message || '文件处理失败')
        fileStore.clearFiles()
      }
    }
  } catch (error) {
    fileStore.setError(error.message)
    fileStore.clearFiles()
  } finally {
    fileStore.setLoading(false)
  }

  // 清理函数：页面离开时不清除文件数据
  // onUnmounted(() => {
  //   fileStore.clearFiles()
  // })
}

function handleError(error) {
  console.error('File error:', error)
  if (error.type === 'file_too_large') {
    toast.warning(t('uploader.fileTooLarge'))
  } else if (error.type === 'invalid_type') {
    // 错误提示已在 FileUploader 中通过 emit 传递，这里可以进一步处理
  }
}

function handleColumnSelection(columns) {
  selectedColumns.value = columns
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getMaskPreview(type) {
  const maskType = actionConfig.maskType
  if (type === 'chinese') {
    if (maskType === 'partial') return t('task.tasks.mask.chinesePartialExample')
    if (maskType === 'full') return t('task.tasks.mask.fullMaskExample')
    return t('task.tasks.mask.chineseInitialExample')
  } else {
    if (maskType === 'partial') return t('task.tasks.mask.englishPartialExample')
    if (maskType === 'full') return t('task.tasks.mask.fullMaskExample')
    return t('task.tasks.mask.englishInitialExample')
  }
}

function executeAndPreview() {
  if (!currentAction.value || !fileStore.workbookData) {
    console.error('executeAndPreview 失败: currentAction 或 workbookData 不存在')
    return
  }

  // 显示加载状态
  fileStore.setLoading(true)

  const data = currentSheetData.value
  console.log('=== executeAndPreview 开始 ===')
  console.log('currentSheetData 是二维数组:', Array.isArray(data) && data.every(row => Array.isArray(row)))
  console.log('currentSheetData.length:', data?.length)
  let columns = selectedColumns.value
  console.log('selectedColumns:', columns)
  const config = { ...actionConfig.value }
  console.log('config:', config)
  console.log('currentAction.id:', currentAction.value.id)

  // 特殊操作：使用配置中的列而不是选中的列
  if (currentAction.value.id === 'sort-asc' || currentAction.value.id === 'sort-desc') {
    if (config.sortColumn !== undefined && config.sortColumn !== '') {
      columns = [config.sortColumn]
    }
  } else if (currentAction.value.id === 'batch-math') {
    if (config.mathColumn !== undefined && config.mathColumn !== '') {
      columns = [config.mathColumn]
    }
  } else if (currentAction.value.id === 'group-summary') {
    if (config.groupColumn !== undefined && config.groupColumn !== '') {
      columns = [config.groupColumn]
      // 汇总列也传递给操作
      if (config.aggColumn !== undefined && config.aggColumn !== '') {
        config.aggColIndex = config.aggColumn
      }
    }
  } else if (currentAction.value.id === 'split-delimiter') {
    if (config.splitColumn !== undefined && config.splitColumn !== '') {
      columns = [config.splitColumn]
    }
  } else if (currentAction.value.id === 'split-to-sheets') {
    if (config.splitColumn !== undefined && config.splitColumn !== '') {
      columns = [config.splitColumn]
    }
  } else if (currentAction.value.id === 'split-width') {
    if (config.splitColumn !== undefined && config.splitColumn !== '') {
      columns = [config.splitColumn]
    }
    // 将宽度字符串转换为数组
    if (config.widthsStr) {
      config.widths = config.widthsStr.split(',').map(w => parseInt(w.trim(), 10)).filter(w => !isNaN(w))
    }
  } else if (currentAction.value.id === 'normalize-dates') {
    if (config.dateColumn !== undefined && config.dateColumn !== '') {
      columns = [config.dateColumn]
    }
  }

  // 字母映射规则转换
  if (currentAction.value.id === 'letter-mapping') {
    const mappingParts = letterMappingRules.value
      .filter(rule => rule.from && rule.to)
      .map(rule => `${rule.from}→${rule.to}`)
    config.letterMapping = mappingParts.join(',')
  }

  // 执行操作
  const result = executeOperation(currentAction.value.id, data, columns, config)
  console.log('executeOperation result.success:', result.success)
  console.log('result.data 是数组:', Array.isArray(result.data))
  if (Array.isArray(result.data)) {
    console.log('result.data.length:', result.data.length)
    console.log('result.data[0] 是数组:', Array.isArray(result.data[0]))
  }

  if (result.success) {
    processedResult.value = result.data
    processedInfo.value = result.info
  } else {
    console.error('操作失败:', result.info.error)
    processedResult.value = data.slice(1) // 失败时返回原数据
    processedInfo.value = { error: result.info.error }
  }
  console.log('=== executeAndPreview 结束 ===')

  // 隐藏加载状态
  fileStore.setLoading(false)

  nextStep()
}

// 执行管道
async function executePipeline() {
  if (!fileStore.workbookData || pipelineSteps.value.length === 0) return

  // 显示加载状态
  fileStore.setLoading(true)

  const data = currentSheetData.value
  const columns = selectedColumns.value

  // 创建管道引擎
  const engine = createPipelineEngine({
    onStepStart: ({ index, step }) => {
      console.log(`开始步骤 ${index + 1}: ${step.name}`)
    },
    onStepComplete: ({ index, step, duration }) => {
      console.log(`步骤 ${index + 1} 完成 (${duration}ms): ${step.name}`)
    }
  })

  // 设置步骤
  engine.setSteps(pipelineSteps.value)

  // 执行管道
  const result = await engine.execute(data, { columns })

  if (result.success) {
    processedResult.value = result.data
    // 如果管道结果是多Sheet类型，从步骤结果中提取 sheetCount 和 totalRows
    if (isMultiSheetOutput.value && result.data?.sheets) {
      const lastStepResult = result.info.stepResults?.find(r => r.operation === 'split-to-sheets')
      processedInfo.value = {
        stepCount: result.info.stepCount,
        executedCount: result.info.executedCount,
        sheetCount: lastStepResult?.info?.sheetCount ?? result.data.sheets.length,
        totalRows: lastStepResult?.info?.totalRows ?? result.data.sheets.reduce((sum, s) => sum + s.data.length - 1, 0)
      }
    } else {
      processedInfo.value = {
        stepCount: result.info.stepCount,
        executedCount: result.info.executedCount
      }
    }
  } else {
    console.error('管道执行失败:', result.info.error)
    processedResult.value = data.slice(1)
    processedInfo.value = { error: result.info.error }
  }

  // 隐藏加载状态
  fileStore.setLoading(false)

  nextStep()
}

// 处理多文件合并完成
function handleMergeComplete({ data, info }) {
  processedResult.value = data
  processedInfo.value = info
  currentStep.value = 3 // 跳到预览步骤
}

// 处理 VLOOKUP 匹配完成
function handleLookupComplete({ data, info }) {
  processedResult.value = data
  processedInfo.value = info
  currentStep.value = 3 // 跳到预览步骤
}

// 处理 VLOOKUP 匹配取消
function handleLookupCancel() {
  // 重置当前操作为空，返回步骤1
  currentAction.value = null
  currentStep.value = 0
}

async function exportResult() {
  console.log('=== exportResult 开始 ===')

  // 先设置 loading 状态
  fileStore.setLoading(true)

  // 强制让出主线程多次，确保 Vue 渲染和浏览器paint完成
  await new Promise(resolve => setTimeout(resolve, 0))
  await new Promise(resolve => setTimeout(resolve, 0))
  await new Promise(resolve => setTimeout(resolve, 50))

  console.log('isLoading 已设为 true')

  const data = processedResult.value
  const actionId = currentAction.value?.id

  console.log('processedResult 是数组:', Array.isArray(data))
  if (Array.isArray(data)) {
    console.log('processedResult.length:', data.length)
    console.log('processedResult[0] 是数组:', Array.isArray(data[0]))
  }

  // 多Sheet类型数据验证
  if (isMultiSheetOutput.value) {
    if (!data?.sheets || data.sheets.length === 0) {
      fileStore.setLoading(false)
      toast.warning(t('task.exportError'))
      return
    }
  } else if (!data || (Array.isArray(data) && data.length === 0)) {
    fileStore.setLoading(false)
    toast.warning(t('task.exportError'))
    return
  }

  try {
    // 多Sheet类型输出 - 使用 ExcelJS 创建多Sheet工作簿
    if (isMultiSheetOutput && data.sheets && data.sheets.length > 0) {
      const { exportToExcelMultiSheet } = await import('@/utils/export/excelExporter')
      const filename = `${t('app.exportFilenamePrefix')}_${new Date().toISOString().slice(0, 10)}`
      await exportToExcelMultiSheet(data.sheets, { filename })
    } else if (typeof data === 'string' || (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string' && (pipelineSteps.value.length > 0 || isTextOutput))) {
      // 文本类型输出（JSON/CSV/SQL）- 直接导出字符串
      const filename = `${t('app.exportFilenamePrefix')}_${new Date().toISOString().slice(0, 10)}`
      let ext = 'txt'
      let mimeType = 'text/plain;charset=utf-8'

      if (actionId === 'to-json') {
        mimeType = 'application/json'
        ext = 'json'
      } else if (actionId === 'to-csv') {
        mimeType = 'text/csv;charset=utf-8'
        ext = 'csv'
      } else if (actionId === 'to-sql-insert' || actionId === 'to-sql-inquery') {
        ext = 'sql'
      }

      const content = Array.isArray(data) ? data.join('\n') : data
      const blob = new Blob([content], { type: mimeType })
      downloadBlob(blob, `${filename}.${ext}`)
    } else {
      // 表格类型输出 - 使用 ExcelJS 高保真导出
      const { exportToExcelWithStyles, exportToExcelStyled } = await import('@/utils/export/excelExporter')
      if (!Array.isArray(data)) {
        throw new Error(t('task.exportError') || t('common.invalidDataFormat'))
      }

      // 验证数据是二维数组
      const isValidAOA = data.every(row => Array.isArray(row))
      console.log('数据是否为二维数组:', isValidAOA)
      if (!isValidAOA) {
        console.error('数据不是有效的二维数组:', data)
        throw new Error(t('common.invalidDataFormat'))
      }

      let filename = `${t('app.exportFilenamePrefix')}_${new Date().toISOString().slice(0, 10)}`

      // 获取源文件 buffer 用于样式克隆
      let sourceBuffer = null
      try {
        const sourceFile = fileStore.activeFile?.raw
        if (sourceFile && typeof sourceFile.arrayBuffer === 'function') {
          sourceBuffer = await sourceFile.arrayBuffer()
        }
      } catch (e) {
        console.warn('获取源文件buffer失败，将使用预设样式:', e.message)
      }

      // 根据是否有源文件选择导出方式
      if (sourceBuffer) {
        // 对于工资条场景，所有表头行（偶数索引）都使用源文件第0行（表头行）的样式
        // 检查是否直接使用工资条功能，或在管道中使用了工资条拆分步骤
        const isDirectWageSlip = currentAction.value?.id === 'wage-slip-split'
        const isPipelineWageSlip = pipelineSteps.value.length > 0 && pipelineSteps.value.some(step => step.operation === 'wage-slip-split')
        const isWageSlip = isDirectWageSlip || isPipelineWageSlip

        const headerRows = isWageSlip
          ? data.reduce((rows, _, idx) => (idx % 2 === 0 ? [...rows, idx] : rows), [])
          : []

        // 使用高保真导出（带源文件样式克隆）
        await exportToExcelWithStyles(data, {
          filename,
          sourceBuffer,
          sourceSheetIndex: fileStore.activeSheetIndex,
          headerRows
        })
      } else {
        // 无源文件时，使用预设样式导出
        await exportToExcelStyled(data, { filename })
      }

      console.log('=== exportResult 结束 ===')
    }
  } catch (error) {
    console.error('导出失败:', error)
    toast.error(t('task.exportError') + ': ' + error.message)
  } finally {
    // 隐藏加载状态
    fileStore.setLoading(false)
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  // ========== 意图预填逻辑 ==========
  console.log('=== onMounted 开始 ===')
  console.log('fileStore.pendingPipelineSteps:', fileStore.pendingPipelineSteps)

  // 优先从 fileStore 获取待处理的管道步骤（更可靠，避免 URL 参数丢失）
  const storedSteps = fileStore.consumePendingPipelineSteps()
  console.log('storedSteps after consume:', storedSteps)
  if (storedSteps) {
    console.log('=== 从 fileStore 恢复管道步骤 ===')
    console.log('storedSteps:', JSON.stringify(storedSteps))
    pipelineSteps.value = storedSteps
    currentAction.value = { id: 'pipeline' }

    // 清除待处理的意图查询（已处理）
    fileStore.clearPendingIntent()

    const hasFiles = fileStore.files && fileStore.files.length > 0
    const hasWorkbook = fileStore.workbookData && fileStore.workbookData.sheets && fileStore.workbookData.sheets.length > 0
    currentStep.value = (hasFiles && hasWorkbook) ? 2 : 1

    // 管道模式：全选所有列
    if (hasWorkbook && fileStore.workbookData.sheets[0]?.data) {
      const totalCols = (fileStore.workbookData.sheets[0].data[0] || []).length
      selectedColumns.value = Array.from({ length: totalCols }, (_, i) => i)
    }
    return
  }

  // 如果没有 storedSteps，才从 URL 解析
  const { actionId, auto, steps, intentQuery, ...prefillParams } = route.query

  console.log('=== onMounted 开始 ===')
  console.log('route.query:', JSON.stringify(route.query))
  console.log('intentQuery:', intentQuery)
  console.log('actionId:', actionId)
  console.log('steps:', steps ? 'exists' : 'undefined')
  console.log('auto:', auto)

  // 处理来自 IntentInput 的意图查询（等待文件上传后再解析）
  if (intentQuery) {
    fileStore.setPendingIntentQuery(intentQuery)
    if (!(actionId === 'pipeline' && steps)) {
      console.log('只有 intentQuery，留在上传步骤')
      currentStep.value = 1
      return
    }
  }

  // 如果是从待处理意图导航过来的（带了auto参数），保留文件数据
  if (auto === 'true') {
    // 不调用 clearFiles，保留文件数据
    selectedColumns.value = []
    processedResult.value = []
    pipelineSteps.value = []
  } else {
    // 正常清理
    fileStore.clearFiles()
    selectedColumns.value = []
    processedResult.value = []
    pipelineSteps.value = []
    currentStep.value = 0
  }

  if (auto === 'true') {
    console.log('=== 进入 auto=true 块 ===')
    console.log('actionId:', actionId, 'type:', typeof actionId)
    console.log('steps:', steps, 'type:', typeof steps)
    console.log('actionId === "pipeline":', actionId === 'pipeline')
    console.log('Boolean(steps):', Boolean(steps))
    console.log('actionId === "pipeline" && Boolean(steps):', actionId === 'pipeline' && Boolean(steps))
    if (actionId === 'pipeline' && steps) {
      // 管道模式：从意图解析结果恢复步骤
      try {
        const parsedSteps = JSON.parse(steps)
        console.log('=== 处理管道模式 ===')
        console.log('parsedSteps:', parsedSteps)
        console.log('parsedSteps.length:', parsedSteps?.length)
        pipelineSteps.value = parsedSteps
        currentAction.value = { id: 'pipeline' }

        // 如果有文件数据，直接到步骤2（配置）；否则留在步骤1（上传）
        const hasFiles = fileStore.files && fileStore.files.length > 0
        const hasWorkbook = fileStore.workbookData && fileStore.workbookData.sheets && fileStore.workbookData.sheets.length > 0
        console.log('hasFiles:', hasFiles, 'hasWorkbook:', hasWorkbook)
        currentStep.value = (hasFiles && hasWorkbook) ? 2 : 1
        console.log('currentStep:', currentStep.value)
        console.log('pipelineSteps.value.length:', pipelineSteps.value.length)

        // 管道模式：全选所有列
        if (hasWorkbook && fileStore.workbookData.sheets[0]?.data) {
          const totalCols = (fileStore.workbookData.sheets[0].data[0] || []).length
          selectedColumns.value = Array.from({ length: totalCols }, (_, i) => i)
        }

        // 清除待处理意图（步骤已恢复，不需要重复解析）
        fileStore.clearPendingIntent()
        return
      } catch (e) {
        console.error('解析管道步骤失败:', e)
      }
    } else if (actionId) {
      // 单操作模式：预填配置参数
      currentAction.value = { id: actionId }
      actionConfig.value = prefillParams

      // 自动识别列（如果有colIndex，优先）
      if (prefillParams.colIndex !== undefined) {
        selectedColumns.value = [Number(prefillParams.colIndex)]
      }
      // 如果有列名提示但没有列索引，等文件上传后自动匹配
      if (prefillParams.suggestedColName && prefillParams.colIndex === undefined) {
        console.log('[onMounted] 单意图列名提示:', prefillParams.suggestedColName, '等待文件上传后匹配')
      }
      // 清除待处理意图（配置参数已恢复，不需要重复解析）
      fileStore.clearPendingIntent()

      // 根据actionId设置taskId并跳转到对应步骤
      const actionToTaskMap = {
        'mask-id': 'mask', 'mask-phone': 'mask', 'mask-email': 'mask', 'mask-name': 'mask',
        'dedup-exact': 'dedup', 'dedup-key': 'dedup',
        'merge-append': 'merge', 'merge-horizontal': 'merge',
        'split-delimiter': 'split', 'split-width': 'split', 'split-to-sheets': 'split', 'merge': 'split',
        'sort-asc': 'sort', 'sort-desc': 'sort', 'shuffle': 'sort',
        'to-json': 'convert', 'to-csv': 'convert', 'to-sql-insert': 'convert', 'to-sql-inquery': 'convert',
        'calculate-sum': 'calc', 'calculate-avg': 'calc', 'calculate-count': 'calc',
        'calculate-max': 'calc', 'calculate-min': 'calc', 'batch-math': 'calc', 'group-summary': 'calc',
        'lookup-match': 'lookup',
        'remove-empty-rows': 'clean', 'trim-whitespace': 'clean', 'remove-all-spaces': 'clean',
        'remove-special-chars': 'clean'
      }

      const targetTaskId = actionToTaskMap[actionId]
      if (targetTaskId && route.params.taskId !== targetTaskId) {
        // 如果当前task不匹配目标task，需要导航到正确的task
        router.replace({
          name: 'task',
          params: { taskId: targetTaskId },
          query: route.query
        })
      } else {
        // 只有当文件已存在时才跳到配置步骤（步骤2），否则留在上传步骤（步骤1）
        currentStep.value = fileStore.hasFile ? 2 : 1
      }
    }
  }
})
</script>

<style scoped>
/* ========== 变量定义 - 与首页一致 ========== */
.task-page {
  --bg-primary: #0a0e14;
  --bg-secondary: #111820;
  --bg-card: #141c25;
  --bg-card-hover: #1a242f;
  --accent-primary: #00d4aa;
  --accent-secondary: #0099ff;
  --accent-warning: #ff6b35;
  --accent-danger: #ff4757;
  --text-primary: #e8eaed;
  --text-secondary: #8b949e;
  --text-muted: #5c6370;
  --border-color: #2a3441;
  --glow-color: rgba(0, 212, 170, 0.15);

  min-height: 100vh;
  background-color: var(--bg-primary);
  background-image:
    linear-gradient(rgba(0, 212, 170, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 170, 0.02) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* 头部 */
.task-header {
  display: flex;
  align-items: center;
  padding: 16px 32px;
  background: rgba(10, 14, 20, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.btn-back {
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
  border: 1px solid var(--border-color);
  background: transparent;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-back:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.08);
}

.btn-back span {
  font-size: 16px;
}

.task-title {
  flex: 1;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  font-family: 'Outfit', sans-serif;
  color: var(--text-primary);
}

.header-spacer {
  width: 100px;
}

/* 主内容 */
.task-main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 24px;
}

/* 步骤指示器 */
.step-indicator {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-bottom: 40px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
}

.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 16px;
  left: calc(50% + 20px);
  width: calc(100% + 20px);
  height: 2px;
  background: var(--border-color);
  z-index: 0;
}

.step-item.is-completed:not(:last-child)::after {
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-primary));
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  transition: all 0.4s ease;
}

.step-item.is-active .step-number {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: var(--bg-primary);
  box-shadow: 0 0 20px rgba(0, 212, 170, 0.5);
}

.step-item.is-completed .step-number {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: var(--bg-primary);
}

.step-label {
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.step-item.is-active .step-label {
  color: var(--accent-primary);
  font-weight: 600;
}

.step-item.is-completed .step-label {
  color: var(--text-secondary);
}

/* 步骤内容 */
.step-content {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 40px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-panel h2 {
  margin: 0 0 32px;
  font-size: 22px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  color: var(--text-primary);
}

.task-description {
  text-align: center;
  margin-bottom: 40px;
}

.task-description p {
  margin: 0;
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* 操作卡片 */
.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-card:hover {
  border-color: var(--accent-primary);
  background: var(--bg-card-hover);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.action-card:hover::before {
  opacity: 1;
}

.action-icon {
  font-size: 32px;
  filter: grayscale(0);
  transition: transform 0.3s ease;
}

.action-card:hover .action-icon {
  transform: scale(1.15);
}

.action-info h3 {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  color: var(--text-primary);
}

.action-info p {
  margin: 0;
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
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

.file-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-size: 14px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-primary);
}

.file-size {
  font-size: 12px;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
}

.btn-remove {
  padding: 8px 16px;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  border: 1px solid var(--accent-danger);
  border-radius: 6px;
  background: transparent;
  color: var(--accent-danger);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-remove:hover {
  background: var(--accent-danger);
  color: #fff;
}

/* 多文件列表样式 */
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

.file-item .file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
}

.file-item .file-icon {
  font-size: 20px;
}

.file-item .file-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.file-item .file-size {
  font-size: 12px;
  color: var(--text-muted);
}

/* 配置区域 */
.config-section {
  margin-bottom: 28px;
}

.config-label {
  display: block;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.config-options select,
.config-options input {
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  font-size: 14px;
  font-family: inherit;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.config-options select:focus,
.config-options input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
}

.config-options select option {
  background: var(--bg-card);
  color: var(--text-primary);
}

.selected-columns {
  padding: 12px 16px;
  background: rgba(0, 212, 170, 0.08);
  border: 1px solid rgba(0, 212, 170, 0.3);
  border-radius: 8px;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--accent-primary);
}

.no-selection {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

/* 结果摘要 */
.result-summary {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
  padding: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-label {
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-secondary);
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  color: var(--accent-primary);
}

/* 文本预览（CSV/JSON/SQL） */
.text-preview {
  max-height: 400px;
  overflow: auto;
  padding: 20px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-all;
}

.text-preview pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--accent-primary);
  line-height: 1.6;
}

/* 多Sheet预览 */
.sheet-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.sheet-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'JetBrains Mono', monospace;
}

.sheet-item:hover {
  border-color: var(--accent-primary);
  background: var(--bg-card-hover);
}

.sheet-item.is-active {
  border-color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.08);
}

.sheet-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.sheet-rows {
  font-size: 11px;
  color: var(--text-muted);
}

/* 按钮 */
.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
}

.btn-primary,
.btn-secondary {
  padding: 12px 28px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  box-shadow: 0 4px 16px rgba(0, 212, 170, 0.3);
}

.btn-primary:hover:not(:disabled) {
  background: #00f5c4;
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 212, 170, 0.4);
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
  background: rgba(0, 212, 170, 0.05);
}

/* 列选择器样式 */
.column-select-wrapper {
  margin-bottom: 20px;
}

.sub-label {
  display: block;
  margin-bottom: 10px;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-secondary);
}

.column-select,
.operator-select,
.agg-type-select,
.width-type-select {
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

.column-select:focus,
.operator-select:focus,
.agg-type-select:focus,
.width-type-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
}

/* 批量运算样式 */
.math-options {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.math-value-input {
  flex: 1;
  max-width: 200px;
  padding: 12px 16px;
  font-size: 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
}

.math-value-input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

/* 正则输入样式 */
.regex-input,
.replace-input,
.mask-pattern-input,
.decimals-input {
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  font-size: 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
}

.regex-input:focus,
.replace-input:focus,
.mask-pattern-input:focus,
.decimals-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
}

/* 数字修约配置 */
.round-config {
  display: flex;
  align-items: center;
  gap: 16px;
}

.decimals-input {
  width: 120px;
}

/* 新增输入框样式 */
.delimiter-input,
.separator-input,
.date-format-input,
.widths-input {
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  font-size: 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
  margin-top: 12px;
}

.delimiter-input:focus,
.separator-input:focus,
.date-format-input:focus,
.widths-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
}

.width-config {
  margin-bottom: 20px;
}

.width-hint {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
}

.no-extra-config {
  color: var(--text-muted);
  font-size: 14px;
  font-style: italic;
}

/* 姓名脱敏样式 */
.mask-type-info {
  margin-bottom: 16px;
}

.mask-hint {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
}

.mask-type-select {
  width: 100%;
  max-width: 400px;
  padding: 12px 16px;
  font-size: 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.mask-type-select:focus {
  outline: none;
  border-color: var(--accent-primary);
}

/* 自定义脱敏样式 */
.mask-type-selector {
  margin-bottom: 16px;
}

.mask-type-selector .sub-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
}

.quick-mask-modes {
  margin-top: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.quick-mask-modes .sub-label {
  display: block;
  margin-bottom: 12px;
  font-weight: 500;
  color: var(--text-primary);
}

.quick-mode-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.quick-mode-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
}

.quick-mode-btn:hover {
  border-color: var(--accent-primary);
  background: var(--bg-hover);
}

.quick-mode-btn input[type="radio"] {
  width: 16px;
  height: 16px;
  accent-color: var(--accent-primary);
}

.quick-mode-btn span {
  color: var(--text-primary);
}

.mask-example {
  margin-top: 14px;
  padding: 10px 12px;
  background: var(--bg-primary);
  border-radius: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', monospace;
}

.regex-mask-config {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.regex-mask-config input {
  width: 100%;
  max-width: 400px;
  padding: 10px 14px;
  font-size: 14px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.regex-mask-config input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.regex-mask-config input::placeholder {
  color: var(--text-muted);
}

.mask-preview {
  margin-top: 20px;
  padding: 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-label {
  color: var(--text-muted);
  min-width: 50px;
}

.preview-original {
  color: var(--text-secondary);
  text-decoration: line-through;
}

.preview-arrow {
  color: var(--accent-secondary);
}

.preview-result {
  color: var(--accent-primary);
  font-weight: 600;
}

/* 字母映射替换样式 */
.letter-mapping-container {
  width: 100%;
  max-width: 400px;
}

.letter-mapping-header {
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.letter-mapping-rules {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.letter-mapping-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.letter-from-input,
.letter-to-input {
  width: 60px;
  padding: 10px 12px;
  font-size: 16px;
  text-align: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  color: var(--accent-primary);
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
}

.letter-from-input:focus,
.letter-to-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.15);
}

.arrow {
  color: var(--accent-secondary);
  font-size: 18px;
  font-weight: bold;
}

.add-rule-btn,
.remove-rule-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.add-rule-btn {
  background: rgba(0, 212, 170, 0.15);
  color: var(--accent-primary);
  margin-left: 8px;
}

.add-rule-btn:hover {
  background: var(--accent-primary);
  color: var(--bg-primary);
}

.remove-rule-btn {
  background: rgba(255, 71, 87, 0.15);
  color: var(--accent-danger);
}

.remove-rule-btn:hover {
  background: var(--accent-danger);
  color: #fff;
}

/* 响应式 */
@media (max-width: 768px) {
  .task-header {
    padding: 12px 16px;
  }

  .step-indicator {
    gap: 24px;
  }

  .step-item:not(:last-child)::after {
    display: none;
  }

  .step-content {
    padding: 24px;
  }

  .step-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
