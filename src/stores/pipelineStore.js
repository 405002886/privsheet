import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePipelineStore = defineStore('pipeline', () => {
  // 状态 - 管道步骤列表
  const steps = ref([])

  // 计算属性
  const stepCount = computed(() => steps.value.length)

  const isEmpty = computed(() => steps.value.length === 0)

  // 方法
  function addStep(operation, params = {}) {
    steps.value.push({
      id: Date.now() + Math.random(),
      operation,
      params,
      enabled: true
    })
  }

  function removeStep(index) {
    if (index >= 0 && index < steps.value.length) {
      steps.value.splice(index, 1)
    }
  }

  function updateStep(index, params) {
    if (index >= 0 && index < steps.value.length) {
      steps.value[index].params = { ...steps.value[index].params, ...params }
    }
  }

  function toggleStep(index) {
    if (index >= 0 && index < steps.value.length) {
      steps.value[index].enabled = !steps.value[index].enabled
    }
  }

  function reorderSteps(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= steps.value.length) return
    if (toIndex < 0 || toIndex >= steps.value.length) return
    const item = steps.value.splice(fromIndex, 1)[0]
    steps.value.splice(toIndex, 0, item)
  }

  function clearSteps() {
    steps.value = []
  }

  function getStepsConfig() {
    return steps.value.map(step => ({
      operation: step.operation,
      params: step.params,
      enabled: step.enabled
    }))
  }

  return {
    steps,
    stepCount,
    isEmpty,
    addStep,
    removeStep,
    updateStep,
    toggleStep,
    reorderSteps,
    clearSteps,
    getStepsConfig
  }
})
