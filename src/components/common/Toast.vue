<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-container">
      <div
        v-for="toast in toastState.toasts"
        :key="toast.id"
        class="toast"
        :class="[`toast--${toast.type}`, { 'toast--closable': toast.closable }]"
      >
        <div class="toast-icon">
          <!-- 成功图标 -->
          <svg v-if="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M8 12l3 3 5-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <!-- 错误图标 -->
          <svg v-else-if="toast.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <!-- 警告图标 -->
          <svg v-else-if="toast.type === 'warning'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 22h20L12 2z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
            <path d="M12 10v4M12 18v.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <!-- 信息图标 -->
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 16v-4M12 8v.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>

        <div class="toast-content">
          <p class="toast-message">{{ toast.message }}</p>
        </div>

        <button
          v-if="toast.closable !== false"
          class="toast-close"
          @click="toast.remove(toast.id)"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- 进度条 -->
        <div
          v-if="toast.duration && toast.duration > 0"
          class="toast-progress"
          :style="{ animationDuration: toast.duration + 'ms' }"
        />
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { toastState } from '@/services/toastService'
</script>

<style scoped>
/* ========== Toast 容器 ========== */
.toast-container {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

/* ========== Toast 基础样式 ========== */
.toast {
  --accent: #00d4aa;
  --bg-card: #141c25;
  --bg-secondary: #111820;
  --border-color: #2a3441;
  --text-primary: #e8eaed;
  --text-secondary: #8b949e;

  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 320px;
  max-width: 420px;
  padding: 16px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  pointer-events: auto;
  overflow: hidden;
}

/* 左侧彩色边条 */
.toast::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--accent);
}

/* 类型变体 */
.toast--success {
  --accent: #00d4aa;
}
.toast--success .toast-icon {
  color: #00d4aa;
}

.toast--error {
  --accent: #ff4757;
}
.toast--error .toast-icon {
  color: #ff4757;
}

.toast--warning {
  --accent: #ffa502;
}
.toast--warning .toast-icon {
  color: #ffa502;
}

.toast--info {
  --accent: #0099ff;
}
.toast--info .toast-icon {
  color: #0099ff;
}

/* ========== 图标 ========== */
.toast-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

/* ========== 内容 ========== */
.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-message {
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.5;
  word-break: break-word;
}

/* ========== 关闭按钮 ========== */
.toast-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin: -4px -4px -4px 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

/* ========== 进度条 ========== */
.toast-progress {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  background: var(--accent);
  opacity: 0.6;
  animation: toast-progress linear forwards;
}

@keyframes toast-progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* ========== 动画 ========== */
.toast-enter-active {
  animation: toast-in 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-leave-active {
  animation: toast-out 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.8);
  }
}
</style>