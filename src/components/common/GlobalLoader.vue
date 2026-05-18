<template>
  <Teleport to="body">
    <Transition name="loader-fade">
      <div v-if="isLoading" class="global-loader">
        <!-- 背景模糊 -->
        <div class="loader-backdrop"></div>

        <!-- 加载动画容器 -->
        <div class="loader-container">
          <!-- 核心环形动画 -->
          <div class="loader-orbit">
            <div class="orbit-ring orbit-ring--outer"></div>
            <div class="orbit-ring orbit-ring--inner"></div>
            <div class="orbit-core">
              <svg viewBox="0 0 24 24" fill="none" class="core-icon">
                <path d="M12 2L12 6M12 18L12 22M2 12L6 12M18 12L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.6"/>
              </svg>
            </div>
          </div>

          <!-- 状态文字 -->
          <div class="loader-status">
            <span class="status-text">{{ displayText }}</span>
            <span class="status-dots">
              <span class="dot" style="--delay: 0ms">.</span>
              <span class="dot" style="--delay: 200ms">.</span>
              <span class="dot" style="--delay: 400ms">.</span>
            </span>
          </div>

          <!-- 进度条（可选） -->
          <div v-if="progress > 0" class="loader-progress">
            <div class="progress-bar" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0  // 0-100
  },
  status: {
    type: String,
    default: ''
  }
})

// 动态显示文字
const displayText = ref(props.status || t('globalLoader.statusDefault'))
const texts = computed(() => [
  t('globalLoader.loading'),
  t('globalLoader.parsing'),
  t('globalLoader.processing'),
  t('globalLoader.exporting'),
  t('globalLoader.almostDone')
])
let textIndex = 0
let textInterval = null

watch(() => props.isLoading, (newVal) => {
  if (newVal) {
    // 开始文字轮播
    textIndex = 0
    displayText.value = props.status || texts.value[0]
    textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % texts.value.length
      displayText.value = texts.value[textIndex]
    }, 1200)
  } else {
    // 停止
    if (textInterval) {
      clearInterval(textInterval)
      textInterval = null
    }
  }
}, { immediate: true })

watch(() => props.status, (newVal) => {
  if (newVal) {
    displayText.value = newVal
  } else {
    displayText.value = t('globalLoader.statusDefault')
  }
})
</script>

<style scoped>
/* ========== 全局加载器 ========== */
.global-loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
}

.loader-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(10, 14, 20, 0.75);
  backdrop-filter: blur(8px);
}

/* ========== 加载容器 ========== */
.loader-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 48px 64px;
  background: linear-gradient(145deg, #141c25 0%, #0a0e14 100%);
  border: 1px solid rgba(0, 212, 170, 0.2);
  border-radius: 24px;
  box-shadow:
    0 0 60px rgba(0, 212, 170, 0.15),
    0 25px 50px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* ========== 轨道环形动画 ========== */
.loader-orbit {
  position: relative;
  width: 120px;
  height: 120px;
}

.orbit-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;
}

.orbit-ring--outer {
  inset: 0;
  border-top-color: #00d4aa;
  border-right-color: rgba(0, 212, 170, 0.3);
  animation: orbit-spin 1.8s linear infinite;
}

.orbit-ring--inner {
  inset: 16px;
  border-bottom-color: #0099ff;
  border-left-color: rgba(0, 153, 255, 0.3);
  animation: orbit-spin 1.2s linear infinite reverse;
}

@keyframes orbit-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.orbit-core {
  position: absolute;
  inset: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, rgba(0, 212, 170, 0.15) 0%, transparent 70%);
  border-radius: 50%;
}

.core-icon {
  width: 32px;
  height: 32px;
  color: #00d4aa;
  animation: core-pulse 2s ease-in-out infinite;
}

@keyframes core-pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
    filter: drop-shadow(0 0 8px rgba(0, 212, 170, 0.5));
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
    filter: drop-shadow(0 0 16px rgba(0, 212, 170, 0.8));
  }
}

/* ========== 状态文字 ========== */
.loader-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: #8b949e;
}

.status-text {
  min-width: 80px;
  text-align: right;
}

.status-dots {
  display: flex;
  min-width: 36px;
}

.dot {
  animation: dot-blink 1.2s ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes dot-blink {
  0%, 50%, 100% { opacity: 0.2; }
  25%, 75% { opacity: 1; }
}

/* ========== 进度条 ========== */
.loader-progress {
  width: 200px;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00d4aa, #0099ff);
  border-radius: 2px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 212, 170, 0.5);
}

/* ========== 过渡动画 ========== */
.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.4s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}

.loader-fade-enter-active .loader-container,
.loader-fade-leave-active .loader-container {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
}

.loader-fade-enter-from .loader-container,
.loader-fade-leave-to .loader-container {
  transform: scale(0.9) translateY(20px);
  opacity: 0;
}
</style>