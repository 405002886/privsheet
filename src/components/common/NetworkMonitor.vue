<template>
  <Teleport to="body">
    <div class="network-monitor" :class="{ 'is-expanded': isExpanded }">
      <!-- 状态栏 -->
      <div class="monitor-bar" @click="toggleExpand">
        <div class="status-indicator">
          <span class="status-dot" :class="statusClass"></span>
          <span class="status-text">{{ statusText }}</span>
        </div>

        <div class="monitor-actions">
          <span class="request-count" v-if="safeRequestCount > 0">
            {{ safeRequestCount }} {{ t('networkMonitor.blocked') }}
          </span>
          <span class="expand-icon" :class="{ rotated: isExpanded }">▲</span>
        </div>
      </div>

      <!-- 展开面板 -->
      <Transition name="slide">
        <div class="monitor-panel" v-if="isExpanded">
          <div class="panel-header">
            <h4>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              {{ t('networkMonitor.panelTitle') }}
            </h4>
            <button class="btn-clear" @click.stop="clearLogs" v-if="logs.length > 0">
              {{ t('common.clear') }}
            </button>
          </div>

          <div class="panel-content">
            <div v-if="logs.length === 0" class="empty-state">
              <div class="empty-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <p>{{ t('networkMonitor.empty.title') }}</p>
              <p class="empty-hint">{{ t('networkMonitor.empty.hint') }}</p>
            </div>

            <div v-else class="log-list">
              <div
                v-for="(log, index) in logs"
                :key="index"
                class="log-item"
                :class="log.type"
              >
                <div class="log-header">
                  <span class="log-type-badge">{{ log.type === 'external' ? t('networkMonitor.blocked') : t('networkMonitor.error') }}</span>
                  <span class="log-time">{{ formatTime(log.timestamp) }}</span>
                </div>
                <div class="log-url">{{ log.url }}</div>
                <div class="log-message" v-if="log.message">{{ log.message }}</div>
              </div>
            </div>
          </div>

          <div class="panel-footer">
            <div class="security-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>{{ t('networkMonitor.securityNote') }}</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const isExpanded = ref(false)
const logs = ref([])

// 计算属性
const safeRequestCount = computed(() => {
  // 过滤掉自身静态资源的请求
  return logs.value.filter(log => !isSelfResource(log.url)).length
})

const statusClass = computed(() => {
  if (safeRequestCount.value > 0) return 'warning'
  return 'safe'
})

const statusText = computed(() => {
  if (safeRequestCount.value > 0) {
    return t('networkMonitor.warning', { count: safeRequestCount.value })
  }
  return t('networkMonitor.safe')
})

// 方法
function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function clearLogs() {
  logs.value = []
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function isSelfResource(url) {
  try {
    const currentOrigin = window.location.origin
    const reqOrigin = new URL(url, currentOrigin).origin
    return reqOrigin === currentOrigin
  } catch {
    return false
  }
}

function isExternalUrl(url) {
  if (!url) return false
  try {
    const currentOrigin = window.location.origin
    const reqOrigin = new URL(url, currentOrigin).origin
    return reqOrigin !== currentOrigin
  } catch {
    return true
  }
}

function addLog(type, url, message) {
  logs.value.unshift({
    type,
    url,
    message,
    timestamp: Date.now()
  })
}

// 初始化网络拦截
onMounted(() => {
  // 拦截 fetch
  const originalFetch = window.fetch
  window.fetch = async function(...args) {
    const url = args[0] instanceof Request ? args[0].url : args[0]

    if (isExternalUrl(url)) {
      addLog('external', url, t('networkMonitor.externalBlocked'))
    }

    try {
      const response = await originalFetch.apply(this, args)
      return response
    } catch (error) {
      if (isExternalUrl(url)) {
        addLog('error', url, t('networkMonitor.requestFailed', { msg: error.message }))
      }
      throw error
    }
  }

  // 拦截 XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open
  const originalXHRSend = XMLHttpRequest.prototype.send

  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this._xhrUrl = url
    return originalXHROpen.apply(this, [method, url, ...rest])
  }

  XMLHttpRequest.prototype.send = function(...args) {
    if (isExternalUrl(this._xhrUrl)) {
      addLog('external', this._xhrUrl, t('networkMonitor.xhrBlocked', { method: this._method || 'GET' }))
    }

    this.addEventListener('load', () => {
      if (isExternalUrl(this._xhrUrl)) {
        addLog('external', this._xhrUrl, t('networkMonitor.xhrComplete'))
      }
    })

    this.addEventListener('error', () => {
      if (isExternalUrl(this._xhrUrl)) {
        addLog('error', this._xhrUrl, t('networkMonitor.xhrFailed'))
      }
    })

    return originalXHRSend.apply(this, args)
  }
})
</script>

<script>
import { onMounted } from 'vue'
</script>

<style scoped>
.network-monitor {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

.monitor-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: rgba(20, 28, 37, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid #2a3441;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.monitor-bar:hover {
  background: rgba(20, 28, 37, 1);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-dot.safe {
  background: #00d4aa;
  box-shadow: 0 0 8px #00d4aa;
}

.status-dot.warning {
  background: #ff6b35;
  box-shadow: 0 0 8px #ff6b35;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  color: #8b949e;
}

.monitor-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.request-count {
  color: #ff6b35;
}

.expand-icon {
  font-size: 10px;
  color: #5c6370;
  transition: transform 0.3s ease;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.monitor-panel {
  border-top: 1px solid #2a3441;
  max-height: 320px;
  display: flex;
  flex-direction: column;
  background: #141c25;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #2a3441;
  background: #111820;
}

.panel-header h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #e8eaed;
}

.panel-header h4 svg {
  color: #00d4aa;
}

.btn-clear {
  padding: 4px 10px;
  font-size: 11px;
  font-family: inherit;
  color: #8b949e;
  background: transparent;
  border: 1px solid #2a3441;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  color: #ff6b35;
  border-color: #ff6b35;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  text-align: center;
}

.empty-icon {
  color: #00d4aa;
  margin-bottom: 12px;
  opacity: 0.6;
}

.empty-state p {
  margin: 4px 0;
  color: #8b949e;
}

.empty-hint {
  font-size: 11px;
  color: #5c6370 !important;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-item {
  padding: 10px 12px;
  border-radius: 6px;
  background: #111820;
  border-left: 3px solid #00d4aa;
}

.log-item.external {
  border-left-color: #ff6b35;
}

.log-item.error {
  border-left-color: #ff4757;
  background: rgba(255, 71, 87, 0.1);
}

.log-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.log-type-badge {
  padding: 2px 6px;
  font-size: 10px;
  border-radius: 3px;
  background: rgba(0, 212, 170, 0.15);
  color: #00d4aa;
}

.log-item.external .log-type-badge {
  background: rgba(255, 107, 53, 0.15);
  color: #ff6b35;
}

.log-item.error .log-type-badge {
  background: rgba(255, 71, 87, 0.15);
  color: #ff4757;
}

.log-time {
  font-size: 10px;
  color: #5c6370;
}

.log-url {
  font-size: 11px;
  color: #e8eaed;
  word-break: break-all;
  line-height: 1.4;
}

.log-message {
  margin-top: 6px;
  font-size: 10px;
  color: #5c6370;
}

.panel-footer {
  padding: 10px 16px;
  border-top: 1px solid #2a3441;
  background: #111820;
}

.security-note {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #00d4aa;
}

.security-note svg {
  flex-shrink: 0;
}

/* 动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
