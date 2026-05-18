<template>
  <div class="home-page">
    <!-- 背景装饰层 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 顶部导航 -->
    <header class="home-header">
      <div class="header-content">
        <div class="logo-group">
          <div class="logo-mark">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="2" width="28" height="28" rx="4" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 12h16M8 16h12M8 20h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              <circle cx="24" cy="20" r="3" fill="currentColor"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="logo-name">privsheet</span>
            <span class="logo-tagline">LOCAL · SECURE · FAST</span>
          </div>
        </div>
        <router-link to="/help" class="btn-help">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9"/>
            <path d="M10.5 9.5a3 3 0 1 1 4.5 2.1c0 1.5-3 2.4-3 4.5"/>
            <circle cx="12" cy="16" r="0.5" fill="currentColor"/>
          </svg>
          {{ t('common.help') }}
        </router-link>
      </div>
    </header>

    <!-- 命令输入区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="intent-search-wrapper">
          <span class="prompt-symbol">&gt;</span>
          <IntentInput />
        </div>
      </div>
    </section>

    <!-- 任务卡片区域 -->
    <section class="tasks-section">
      <div class="section-header">
        <span class="section-label">{{ t('home.tasks.sectionLabel') }}</span>
      </div>

      <div class="tasks-grid">
        <button
          v-for="(task, index) in taskCards"
          :key="task.id"
          class="task-card"
          :class="[`card-${index + 1}`, { 'is-popular': task.popular }]"
          @click="navigateToTask(task.id)"
        >
          <div class="card-glow"></div>

          <div class="card-header">
            <div class="task-icon" v-html="task.icon"></div>
            <div class="card-number">{{ String(index + 1).padStart(2, '0') }}</div>
          </div>

          <div class="card-content">
            <h3 class="task-title">{{ t(`home.tasks.${task.id}.title`) }}</h3>
            <p class="task-desc">{{ t(`home.tasks.${task.id}.description`) }}</p>
          </div>

          <div class="card-footer">
            <span class="card-action">
              {{ t('home.tasks.action') }}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
          </div>

          <div class="card-border"></div>

          <span class="popular-badge" v-if="task.popular">{{ t('home.tasks.popular') }}</span>
        </button>
      </div>
    </section>

    <!-- 特色说明区域 -->
    <section class="features-section">
      <div class="section-header">
        <span class="section-label">{{ t('home.features.sectionLabel') }}</span>
      </div>

      <div class="features-grid">
        <div class="feature-item" v-for="feature in featureKeys" :key="feature">
          <div class="feature-visual">
            <div class="feature-icon" v-html="featureIcons[feature]"></div>
            <div class="feature-line"></div>
          </div>
          <div class="feature-content">
            <h4>{{ t(`home.features.${feature}.title`) }}</h4>
            <p>{{ t(`home.features.${feature}.description`) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部 -->
    <footer class="home-footer">
      <div class="footer-content">
        <div class="footer-status">
          <span class="status-indicator safe"></span>
          <span>{{ t('home.footer.status') }}</span>
        </div>
        <div class="footer-meta">
          <span>{{ t('home.footer.copyright', { year: new Date().getFullYear() }) }}</span>
          <span class="divider">|</span>
          <a
            class="footer-link"
            href="https://github.com/405002886/privsheet"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <span class="divider">|</span>
          <span>Apache-2.0 License</span>
        </div>
      </div>
    </footer>

    <!-- 帮助弹窗 -->
    <Transition name="modal">
      <div class="help-modal" v-if="showHelp" @click.self="showHelp = false">
        <div class="modal-content">
          <div class="modal-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              {{ t('home.helpModal.title') }}
            </h3>
            <button class="btn-close" @click="showHelp = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="help-item">
              <h4>
                <span class="help-num">01</span>
                {{ t('home.helpModal.q1.title') }}
              </h4>
              <p>{{ t('home.helpModal.q1.content') }}</p>
            </div>
            <div class="help-item">
              <h4>
                <span class="help-num">02</span>
                {{ t('home.helpModal.q2.title') }}
              </h4>
              <p>{{ t('home.helpModal.q2.content') }}</p>
            </div>
            <div class="help-item">
              <h4>
                <span class="help-num">03</span>
                {{ t('home.helpModal.q3.title') }}
              </h4>
              <p>{{ t('home.helpModal.q3.content') }}</p>
            </div>
            <div class="help-item">
              <h4>
                <span class="help-num">04</span>
                {{ t('home.helpModal.q4.title') }}
              </h4>
              <p>{{ t('home.helpModal.q4.content') }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import IntentInput from '@/components/intent/IntentInput.vue'

const router = useRouter()
const { t } = useI18n()
const showHelp = ref(false)

// 任务卡片配置
const taskCards = [
  {
    id: 'custom',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>',
    popular: true
  },
  {
    id: 'dedup',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18M3 12h18M3 18h18"/><path d="M8 6v12M16 6v12"/></svg>',
    popular: true
  },
  {
    id: 'mask',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    popular: false
  },
  {
    id: 'split',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9v14h8M7 5h6v14H7"/></svg>',
    popular: true
  },
  {
    id: 'clean',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0-6v6"/></svg>',
    popular: false
  },
  {
    id: 'sort',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18M6 12h12M9 18h6"/><path d="M19 9l2 2-2 2M5 13l-2 2 2 2"/></svg>',
    popular: false
  },
  {
    id: 'date',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>',
    popular: false
  },
  {
    id: 'convert',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14l4 4m-4-4v10l6-6"/></svg>',
    popular: true
  },
  {
    id: 'extract',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    popular: false
  },
  {
    id: 'calc',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="12" y1="10" x2="14" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="12" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg>',
    popular: false
  },
  {
    id: 'merge',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    popular: true
  },
  {
    id: 'lookup',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>',
    popular: false
  },
  {
    id: 'wage',
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><path d="M12 15v4M8 19h8"/></svg>',
    popular: false
  }
]

// 特色功能
const featureKeys = ['local', 'fast', 'preview', 'mobile']
const featureIcons = {
  local: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  fast: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  preview: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  mobile: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>'
}

function navigateToTask(taskId) {
  router.push({
    name: 'task',
    params: { taskId }
  })
}
</script>

<style scoped>
/* ========== 变量定义 ========== */
.home-page {
  --bg-primary: #0a0e14;
  --bg-secondary: #111820;
  --bg-card: #141c25;
  --bg-card-hover: #1a242f;
  --accent-primary: #00d4aa;
  --accent-secondary: #0099ff;
  --accent-warning: #ff6b35;
  --text-primary: #e8eaed;
  --text-secondary: #8b949e;
  --text-muted: #5c6370;
  --border-color: #2a3441;
  --glow-color: rgba(0, 212, 170, 0.15);
}

/* ========== 背景装饰 ========== */
.bg-grid {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(0, 212, 170, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 170, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
}

.bg-glow {
  position: fixed;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  filter: blur(120px);
  opacity: 0.4;
}

.bg-glow-1 {
  top: -200px;
  right: -100px;
  background: radial-gradient(circle, var(--accent-primary) 0%, transparent 70%);
  opacity: 0.15;
}

.bg-glow-2 {
  bottom: -200px;
  left: -100px;
  background: radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%);
  opacity: 0.1;
}

/* ========== 页面容器 ========== */
.home-page {
  position: relative;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow-x: hidden;
}

/* ========== 头部导航 ========== */
.home-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 16px 32px;
  background: rgba(10, 14, 20, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-mark {
  color: var(--accent-primary);
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { filter: drop-shadow(0 0 4px var(--accent-primary)); }
  50% { filter: drop-shadow(0 0 12px var(--accent-primary)); }
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-name {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--text-primary);
}

.logo-tagline {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 9px;
  letter-spacing: 2px;
  color: var(--accent-primary);
  opacity: 0.8;
}

.btn-help {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-help:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.05);
}

/* ========== Hero 区域 — 命令行风格 ========== */
.hero-section {
  position: relative;
  padding: 48px 32px 32px;
  z-index: 1;
}

.hero-content {
  max-width: 700px;
  margin: 0 auto;
}

.intent-search-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slide-up 0.5s ease-out both;
}

/* 让 IntentInput 撑满父容器，避免两层 max-width 重叠 */
.intent-search-wrapper .intent-input-wrapper {
  max-width: none;
  margin: 0;
  width: 100%;
}

.prompt-symbol {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 24px;
  font-weight: 700;
  color: var(--accent-primary);
  opacity: 0.6;
  animation: blink-cursor 1.2s ease-in-out infinite;
}

@keyframes blink-cursor {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.2; }
}

/* ========== 任务卡片区域 ========== */
.tasks-section {
  position: relative;
  padding: 40px 32px 80px;
  z-index: 1;
}

.section-header {
  max-width: 1200px;
  margin: 0 auto 32px;
}

.section-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--accent-primary);
  opacity: 0.7;
}

.tasks-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.task-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  text-align: left;
  color: inherit;
  font-family: inherit;
  animation: card-appear 0.6s ease-out both;
}

.task-card:nth-child(1) { animation-delay: 0.1s; }
.task-card:nth-child(2) { animation-delay: 0.15s; }
.task-card:nth-child(3) { animation-delay: 0.2s; }
.task-card:nth-child(4) { animation-delay: 0.25s; }
.task-card:nth-child(5) { animation-delay: 0.3s; }
.task-card:nth-child(6) { animation-delay: 0.35s; }
.task-card:nth-child(7) { animation-delay: 0.4s; }
.task-card:nth-child(8) { animation-delay: 0.45s; }

@keyframes card-appear {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.task-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-primary);
  background: var(--bg-card-hover);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px var(--accent-primary),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, var(--glow-color) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.task-card:hover .card-glow {
  opacity: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.task-icon {
  color: var(--accent-primary);
  transition: transform 0.3s ease;
}

.task-card:hover .task-icon {
  transform: scale(1.1);
}

.card-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-muted);
}

.card-content {
  flex: 1;
  margin-bottom: 20px;
}

.task-title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.task-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
}

.card-footer {
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.card-action {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--accent-primary);
  transition: gap 0.3s ease;
}

.task-card:hover .card-action {
  gap: 12px;
}

.card-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--accent-primary), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.task-card:hover .card-border {
  opacity: 1;
}

.popular-badge {
  position: absolute;
  top: 20px;
  right: 42px;
  padding: 4px 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 700;
  color: var(--bg-primary);
  background: var(--accent-warning);
  border-radius: 4px;
  letter-spacing: 1px;
}

/* ========== 特色功能区域 ========== */
.features-section {
  position: relative;
  padding: 60px 32px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  z-index: 1;
}

.features-grid {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 32px;
}

.feature-item {
  display: flex;
  gap: 20px;
  padding: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  border-color: var(--accent-secondary);
  transform: translateY(-2px);
}

.feature-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.feature-icon {
  color: var(--accent-secondary);
}

.feature-line {
  width: 2px;
  height: 24px;
  background: linear-gradient(to bottom, var(--accent-secondary), transparent);
}

.feature-content h4 {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.feature-content p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
}

/* ========== 底部 ========== */
.home-footer {
  position: relative;
  padding: 32px 32px 80px;
  z-index: 1;
}

.footer-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.footer-status {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--accent-primary);
}

.footer-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--text-muted);
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--accent-primary);
}

.divider {
  color: var(--border-color);
}

/* ========== 帮助弹窗 ========== */
.help-modal {
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

.modal-content {
  width: 100%;
  max-width: 540px;
  max-height: 80vh;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-header svg {
  color: var(--accent-primary);
}

.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  color: var(--accent-warning);
  border-color: var(--accent-warning);
  background: rgba(255, 107, 53, 0.1);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.help-item {
  margin-bottom: 28px;
  padding-bottom: 28px;
  border-bottom: 1px solid var(--border-color);
}

.help-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.help-item h4 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.help-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--accent-primary);
  padding: 2px 6px;
  background: rgba(0, 212, 170, 0.1);
  border-radius: 4px;
}

.help-item p {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* ========== 动画过渡 ========== */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95) translateY(20px);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .hero-section {
    padding: 32px 16px 24px;
  }

  .prompt-symbol {
    font-size: 20px;
  }

  .tasks-grid {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
