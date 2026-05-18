<template>
  <div
    class="file-uploader"
    :class="{ 'is-dragover': isDragover, 'is-disabled': disabled }"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
    @click="triggerInput"
  >
    <input
      ref="fileInput"
      type="file"
      :accept="acceptTypes"
      :multiple="multiple"
      :disabled="disabled"
      @change="handleFileChange"
    />

    <div class="upload-content">
      <div class="upload-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>

      <div class="upload-text">
        <p class="primary-text">{{ dragText }}</p>
        <p class="secondary-text">{{ hintText }}</p>
      </div>

      <div class="upload-types" v-if="showTypes">
        <span v-for="type in acceptedTypes" :key="type" class="type-badge">
          {{ type.toUpperCase() }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否支持多文件
  multiple: {
    type: Boolean,
    default: false
  },
  // 接受的文件类型
  accept: {
    type: String,
    default: '.xlsx,.xls,.csv,.ods'
  },
  // 拖拽提示文字
  dragText: {
    type: String,
    default: 'Drag files here, or click to upload'
  },
  // 辅助提示文字
  hintText: {
    type: String,
    default: 'Supports xlsx, xls, csv, ods formats'
  },
  // 文件大小限制（默认10MB）
  maxSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 10MB
  },
  // 是否显示文件类型标签
  showTypes: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['file-selected', 'error'])

const fileInput = ref(null)
const isDragover = ref(false)

// 解析接受的文件类型
const acceptedTypes = computed(() => {
  return props.accept.split(',').map(t => t.replace('.', '').trim())
})

const acceptTypes = computed(() => props.accept)

// 处理拖拽悬停
function handleDragOver(e) {
  if (props.disabled) return
  isDragover.value = true
}

// 处理拖拽离开
function handleDragLeave(e) {
  isDragover.value = false
}

// 处理文件放下
function handleDrop(e) {
  if (props.disabled) return
  isDragover.value = false

  const files = Array.from(e.dataTransfer.files)
  if (files.length === 0) return

  validateAndEmit(files)
}

// 触发文件选择
function triggerInput() {
  if (props.disabled) return
  fileInput.value?.click()
}

// 处理文件选择
function handleFileChange(e) {
  const files = Array.from(e.target.files)
  if (files.length === 0) return

  validateAndEmit(files)

  // 重置input以便重复选择相同文件
  e.target.value = ''
}

// 验证并发送文件
function validateAndEmit(files) {
  const validFiles = files.filter(file => {
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!props.accept.split(',').map(t => t.trim()).includes(ext)) {
      emit('error', {
        type: 'invalid_type',
        filename: file.name,
        file
      })
      return false
    }
    if (file.size > props.maxSize) {
      emit('error', {
        type: 'file_too_large',
        filename: file.name,
        file
      })
      return false
    }
    return true
  })

  if (validFiles.length > 0) {
    emit('file-selected', props.multiple ? validFiles : validFiles[0])
  }
}
</script>

<style scoped>
/* ========== 深色赛博朋克风格变量 ========== */
.file-uploader {
  --bg-primary: #0a0e14;
  --bg-secondary: #111820;
  --bg-card: #141c25;
  --accent-primary: #00d4aa;
  --accent-secondary: #0099ff;
  --text-primary: #e8eaed;
  --text-secondary: #8b949e;
  --text-muted: #5c6370;
  --border-color: #2a3441;

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 32px;
  border: 2px dashed var(--border-color);
  border-radius: 16px;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.file-uploader::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(0, 212, 170, 0.08) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.file-uploader:hover {
  border-color: var(--accent-primary);
  background: var(--bg-card);
}

.file-uploader:hover::before {
  opacity: 1;
}

.file-uploader.is-dragover {
  border-color: var(--accent-primary);
  border-style: solid;
  background: var(--bg-card);
  box-shadow:
    0 0 40px rgba(0, 212, 170, 0.2),
    inset 0 0 60px rgba(0, 212, 170, 0.05);
}

.file-uploader.is-dragover::before {
  opacity: 1;
  background: radial-gradient(circle at center, rgba(0, 212, 170, 0.15) 0%, transparent 70%);
}

.file-uploader.is-disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.file-uploader input[type="file"] {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.upload-icon {
  color: var(--text-muted);
  transition: all 0.4s ease;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.file-uploader:hover .upload-icon,
.file-uploader.is-dragover .upload-icon {
  color: var(--accent-primary);
  transform: scale(1.1);
  animation: none;
}

.upload-text .primary-text {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  font-family: 'Outfit', sans-serif;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.file-uploader:hover .primary-text {
  color: var(--accent-primary);
}

.upload-text .secondary-text {
  margin: 8px 0 0;
  font-size: 14px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-muted);
}

.upload-types {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.type-badge {
  padding: 4px 12px;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.1);
  border: 1px solid rgba(0, 212, 170, 0.3);
  border-radius: 6px;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.file-uploader:hover .type-badge {
  background: rgba(0, 212, 170, 0.15);
  border-color: var(--accent-primary);
}
</style>
