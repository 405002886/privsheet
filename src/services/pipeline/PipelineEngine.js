/**
 * 管道引擎 - 链式执行多个数据处理操作
 * 负责管理管道步骤的执行顺序、依赖关系和错误处理
 */
import { operationRegistry } from '@/utils/operations/registry.js'

/**
 * 创建管道引擎实例
 * @param {Object} options - 配置选项
 */
export function createPipelineEngine(options = {}) {
  const { onStepStart, onStepComplete, onStepError, onComplete } = options

  // 管道状态
  let steps = []
  let isRunning = false
  let abortController = null

  /**
   * 设置管道步骤
   * @param {Array} stepList - 步骤列表
   */
  function setSteps(stepList) {
    steps = stepList.map((step, index) => ({
      id: step.id || `step_${index}`,
      operation: step.operation,
      params: step.params || {},
      enabled: step.enabled !== false,
      name: step.name || step.operation
    }))
  }

  /**
   * 添加步骤
   * @param {Object} step - 步骤配置
   */
  function addStep(step) {
    steps.push({
      id: step.id || `step_${Date.now()}`,
      operation: step.operation,
      params: step.params || {},
      enabled: step.enabled !== false,
      name: step.name || step.operation
    })
  }

  /**
   * 执行管道
   * @param {Array[]} initialData - 初始二维数组数据
   * @param {Object} context - 上下文信息（如选中的列等）
   * @returns {Promise<{ success: boolean, data: Array[], info: Object }>}
   */
  async function execute(initialData, context = {}) {
    if (isRunning) {
      return { success: false, data: initialData, info: { error: '管道正在运行中' } }
    }

    isRunning = true
    abortController = new AbortController()

    let currentData = initialData
    const stepResults = []
    const errors = []

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]

        // 跳过禁用的步骤
        if (!step.enabled) {
          stepResults.push({
            stepId: step.id,
            stepName: step.name,
            skipped: true,
            data: currentData
          })
          continue
        }

        // 检查是否已中止
        if (abortController.signal.aborted) {
          throw new Error('管道执行已中止')
        }

        // 触发步骤开始回调
        if (onStepStart) {
          onStepStart({
            index: i,
            step: step,
            totalSteps: steps.length
          })
        }

        try {
          // 获取操作函数
          const operation = operationRegistry[step.operation]

          if (!operation) {
            throw new Error(`未知操作: ${step.operation}`)
          }

          if (!operation.fn) {
            throw new Error(`操作未实现: ${step.operation}`)
          }

          // 构建参数（合并上下文）
          // 注意：如果步骤中已有 colIndex，优先使用步骤中的值
          const params = {
            columns: context.columns || [],
            ...(context.config || {}),
            ...step.params  // 步骤中的参数最后合并，优先级最高
          }

          console.log('管道执行:', step.operation, '参数:', params)

          // 执行操作（使用 paramBuilder 转换参数）
          const startTime = performance.now()
          const buildParams = operation.paramBuilder
            ? operation.paramBuilder(context.columns || [], params, null)
            : params
          const result = operation.fn(currentData, buildParams)
          const endTime = performance.now()

          if (!result.success) {
            throw new Error(result.info?.error || '操作执行失败')
          }

          // 更新当前数据
          currentData = result.data

          // 记录步骤结果
          stepResults.push({
            stepId: step.id,
            stepName: step.name,
            operation: step.operation,
            success: true,
            duration: Math.round(endTime - startTime),
            data: currentData,
            info: result.info
          })

          // 触发步骤完成回调
          if (onStepComplete) {
            onStepComplete({
              index: i,
              step: step,
              result: result,
              duration: stepResults[stepResults.length - 1].duration
            })
          }

          // 如果步骤输出类型是 multiSheet，直接作为管道最终输出，不再传递给后续步骤
          if (operation.outputType === 'multiSheet') {
            return {
              success: true,
              data: currentData,
              info: {
                stepCount: steps.length,
                executedCount: stepResults.filter(r => !r.skipped).length,
                errors: errors.length,
                stepResults: stepResults
              }
            }
          }

        } catch (error) {
          errors.push({
            index: i,
            step: step,
            error: error.message
          })

          // 触发步骤错误回调
          if (onStepError) {
            onStepError({
              index: i,
              step: step,
              error: error.message
            })
          }

          // 如果不是强制继续，则中断管道
          if (!context.continueOnError) {
            throw error
          }
        }
      }

      // 触发完成回调
      if (onComplete) {
        onComplete({
          success: true,
          data: currentData,
          stepResults: stepResults,
          errors: errors
        })
      }

      return {
        success: true,
        data: currentData,
        info: {
          stepCount: steps.length,
          executedCount: stepResults.filter(r => !r.skipped).length,
          errors: errors.length,
          stepResults: stepResults
        }
      }

    } catch (error) {
      return {
        success: false,
        data: initialData,
        info: {
          error: error.message,
          stepResults: stepResults,
          errors: errors
        }
      }
    } finally {
      isRunning = false
      abortController = null
    }
  }

  /**
   * 中止管道执行
   */
  function abort() {
    if (abortController) {
      abortController.abort()
    }
  }

  /**
   * 获取当前状态
   */
  function getStatus() {
    return {
      isRunning,
      stepCount: steps.length,
      enabledCount: steps.filter(s => s.enabled).length
    }
  }

  /**
   * 验证管道配置
   */
  function validate() {
    const errors = []

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const operation = operationRegistry[step.operation]

      if (!operation) {
        errors.push(`步骤 ${i + 1}: 未知操作 "${step.operation}"`)
        continue
      }

      if (!operation.fn) {
        errors.push(`步骤 ${i + 1}: 操作 "${step.operation}" 未实现`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  return {
    setSteps,
    addStep,
    execute,
    abort,
    getStatus,
    validate,
    // 暴露步骤列表（只读）
    get steps() {
      return [...steps]
    }
  }
}

/**
 * 管道引擎单例（用于简单场景）
 */
export const pipelineEngine = createPipelineEngine()

export default pipelineEngine
