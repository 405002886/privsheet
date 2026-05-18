import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useFileStore = defineStore('file', () => {
  // 状态
  const files = ref([])
  const activeFileIndex = ref(0)
  const activeSheetIndex = ref(0)
  const workbookData = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // ========== 多文件合并状态 ==========
  const multiFileData = ref([])  // 多文件完整数据 [{ id, name, size, type, sheets: [{ name, data }] }]
  const selectedFileIndices = ref([])  // 多文件选中索引
  const selectedActionId = ref(null)  // 当前合并操作的 actionId

  // ========== VLOOKUP 双表状态 ==========
  const lookupTables = ref({
    main: { file: null, workbookData: null, selectedSheet: 0 },
    lookup: { file: null, workbookData: null, selectedSheet: 0 }
  })

  // ========== 意图解析状态 ==========
  const pendingIntentQuery = ref('')  // 待解析的意图查询文字
  const pendingIntentResult = ref(null)  // 已解析的意图结果（包含列信息）
  const pendingPipelineSteps = ref(null)  // 待处理的管道步骤（从意图解析结果生成）

  // 计算属性
  const activeFile = computed(() => files.value[activeFileIndex.value] || null)

  const activeSheet = computed(() => {
    if (!workbookData.value || !workbookData.value.sheets) return null
    return workbookData.value.sheets[activeSheetIndex.value] || null
  })

  const hasFile = computed(() => files.value.length > 0)

  const sheetNames = computed(() => {
    if (!workbookData.value || !workbookData.value.sheets) return []
    return workbookData.value.sheets.map(s => s.name)
  })

  // ========== 多文件计算属性 ==========
  const hasMultipleFiles = computed(() => multiFileData.value.length > 1)

  const allSheets = computed(() => {
    return multiFileData.value.flatMap(f =>
      f.sheets.map(s => ({
        fileId: f.id,
        fileName: f.name,
        sheetName: s.name,
        sheetIndex: f.sheets.indexOf(s)
      }))
    )
  })

  // ========== VLOOKUP 双表计算属性 ==========
  const hasMainTable = computed(() => lookupTables.value.main.workbookData !== null)
  const hasLookupTable = computed(() => lookupTables.value.lookup.workbookData !== null)

  // 方法
  function addFile(file) {
    files.value.push({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      raw: file
    })
    activeFileIndex.value = files.value.length - 1
  }

  function removeFile(index) {
    files.value.splice(index, 1)
    if (activeFileIndex.value >= files.value.length) {
      activeFileIndex.value = Math.max(0, files.value.length - 1)
    }
  }

  function setActiveFile(index) {
    if (index >= 0 && index < files.value.length) {
      activeFileIndex.value = index
      activeSheetIndex.value = 0
    }
  }

  function setActiveSheet(index) {
    if (index >= 0 && workbookData.value && index < workbookData.value.sheets.length) {
      activeSheetIndex.value = index
    }
  }

  function setWorkbookData(data) {
    workbookData.value = data
    activeSheetIndex.value = 0
  }

  function setLoading(loading) {
    isLoading.value = loading
  }

  function setError(err) {
    error.value = err
  }

  function clearFiles() {
    files.value = []
    activeFileIndex.value = 0
    activeSheetIndex.value = 0
    workbookData.value = null
    error.value = null
  }

  /**
   * 清除意图相关的待处理状态（保留文件数据）
   */
  function clearIntentState() {
    pendingIntentQuery.value = ''
    pendingIntentResult.value = null
    pendingPipelineSteps.value = null
  }

  // ========== 多文件管理方法 ==========

  /**
   * 添加多文件数据（用于合并操作）
   * @param {Object} fileData - { id, name, size, type, sheets: [{ name, data }] }
   */
  function addMultiFile(fileData) {
    multiFileData.value.push(fileData)
  }

  /**
   * 移除多文件
   * @param {number} index - 文件索引
   */
  function removeMultiFile(index) {
    multiFileData.value.splice(index, 1)
    // 同步更新选中索引
    selectedFileIndices.value = selectedFileIndices.value.filter(i => i !== index)
    selectedFileIndices.value = selectedFileIndices.value.map(i => i > index ? i - 1 : i)
  }

  /**
   * 清空多文件数据
   */
  function clearMultiFiles() {
    multiFileData.value = []
    selectedFileIndices.value = []
  }

  /**
   * 获取所有多文件数据
   */
  function getMultiFileData() {
    return multiFileData.value
  }

  /**
   * 设置多文件选中状态
   * @param {number[]} indices - 选中的文件索引数组
   */
  function setSelectedFileIndices(indices) {
    selectedFileIndices.value = indices
  }

  /**
   * 根据文件ID获取文件数据
   * @param {string} fileId - 文件ID
   */
  function getFileDataById(fileId) {
    return multiFileData.value.find(f => f.id === fileId)
  }

  // ========== VLOOKUP 双表管理方法 ==========

  /**
   * 设置主表
   * @param {File} file - 文件对象
   * @param {Object} workbookData - 工作簿数据
   */
  function setMainTable(file, workbookData) {
    lookupTables.value.main = {
      file,
      workbookData,
      selectedSheet: 0
    }
  }

  /**
   * 设置查找表
   * @param {File} file - 文件对象
   * @param {Object} workbookData - 工作簿数据
   */
  function setLookupTable(file, workbookData) {
    lookupTables.value.lookup = {
      file,
      workbookData,
      selectedSheet: 0
    }
  }

  /**
   * 设置主表的工作表索引
   * @param {number} sheetIndex - 工作表索引
   */
  function setMainTableSheet(sheetIndex) {
    lookupTables.value.main.selectedSheet = sheetIndex
  }

  /**
   * 设置查找表的工作表索引
   * @param {number} sheetIndex - 工作表索引
   */
  function setLookupTableSheet(sheetIndex) {
    lookupTables.value.lookup.selectedSheet = sheetIndex
  }

  /**
   * 清空 VLOOKUP 双表
   */
  function clearLookupTables() {
    lookupTables.value = {
      main: { file: null, workbookData: null, selectedSheet: 0 },
      lookup: { file: null, workbookData: null, selectedSheet: 0 }
    }
  }

  /**
   * 交换主表和查找表
   */
  function swapLookupTables() {
    const temp = { ...lookupTables.value.main }
    lookupTables.value.main = { ...lookupTables.value.lookup }
    lookupTables.value.lookup = temp
  }

  /**
   * 获取主表数据
   */
  function getMainTableData() {
    const main = lookupTables.value.main
    if (!main.workbookData || !main.workbookData.sheets) return null
    return main.workbookData.sheets[main.selectedSheet]?.data || null
  }

  /**
   * 获取查找表数据
   */
  function getLookupTableData() {
    const lookup = lookupTables.value.lookup
    if (!lookup.workbookData || !lookup.workbookData.sheets) return null
    return lookup.workbookData.sheets[lookup.selectedSheet]?.data || null
  }

  // ========== 意图管理方法 ==========
  /**
   * 设置待解析的意图查询文字
   * @param {string} query - 用户输入的意图查询文字
   */
  function setPendingIntentQuery(query) {
    pendingIntentQuery.value = query
  }

  /**
   * 设置待处理的意图解析结果
   * @param {Object} result - parseIntent 返回的结果
   */
  function setPendingIntentResult(result) {
    pendingIntentResult.value = result
  }

  /**
   * 获取并清除待处理的意图结果
   * @returns {Object|null}
   */
  function consumePendingIntent() {
    const result = pendingIntentResult.value
    pendingIntentQuery.value = ''
    pendingIntentResult.value = null
    return result
  }

  /**
   * 清除待处理的意图状态
   */
  function clearPendingIntent() {
    pendingIntentQuery.value = ''
    pendingIntentResult.value = null
    pendingPipelineSteps.value = null
  }

  /**
   * 设置待处理的管道步骤（用于意图模式）
   * @param {Array} steps - 管道步骤数组
   */
  function setPendingPipelineSteps(steps) {
    pendingPipelineSteps.value = steps
  }

  /**
   * 获取并清除待处理的管道步骤
   * @returns {Array|null}
   */
  function consumePendingPipelineSteps() {
    const steps = pendingPipelineSteps.value
    pendingPipelineSteps.value = null
    return steps
  }

  return {
    // 状态
    files,
    activeFileIndex,
    activeSheetIndex,
    workbookData,
    isLoading,
    error,
    // 多文件状态
    multiFileData,
    selectedFileIndices,
    selectedActionId,
    // VLOOKUP 双表状态
    lookupTables,
    // 计算属性
    activeFile,
    activeSheet,
    hasFile,
    sheetNames,
    hasMultipleFiles,
    allSheets,
    hasMainTable,
    hasLookupTable,
    // 方法
    addFile,
    removeFile,
    setActiveFile,
    setActiveSheet,
    setWorkbookData,
    setLoading,
    setError,
    clearFiles,
    // 多文件管理
    addMultiFile,
    removeMultiFile,
    clearMultiFiles,
    getMultiFileData,
    setSelectedFileIndices,
    getFileDataById,
    // VLOOKUP 双表管理
    setMainTable,
    setLookupTable,
    setMainTableSheet,
    setLookupTableSheet,
    clearLookupTables,
    swapLookupTables,
    getMainTableData,
    getLookupTableData,
    // 意图管理
    pendingIntentQuery,
    pendingIntentResult,
    pendingPipelineSteps,
    setPendingIntentQuery,
    setPendingIntentResult,
    setPendingPipelineSteps,
    consumePendingIntent,
    consumePendingPipelineSteps,
    clearPendingIntent,
    clearIntentState
  }
})
