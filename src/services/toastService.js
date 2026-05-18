// 消息服务 - 提供全局 Toast 功能
// 使用方法: import { toast } from '@/services/toastService'
// toast.success('操作成功')

import { reactive } from 'vue'

// 单例的 toasts 状态
const state = reactive({
  toasts: [],
  idCounter: 0
})

// 添加 toast
function addToast({ message, type = 'info', duration = 4000, closable = true }) {
  const id = ++state.idCounter
  state.toasts.push({ id, message, type, duration, closable })

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }

  return id
}

// 移除 toast
function removeToast(id) {
  const index = state.toasts.findIndex(t => t.id === id)
  if (index > -1) {
    state.toasts.splice(index, 1)
  }
}

// 导出 toast API
export const toast = {
  success: (msg, options = {}) => addToast({ message: msg, type: 'success', ...options }),
  error: (msg, options = {}) => addToast({ message: msg, type: 'error', ...options }),
  warning: (msg, options = {}) => addToast({ message: msg, type: 'warning', ...options }),
  info: (msg, options = {}) => addToast({ message: msg, type: 'info', ...options }),
  add: addToast,
  remove: removeToast
}

// 导出状态以供 Toast 组件使用
export { state as toastState }

export default toast