<template>
  <div class="help-page">
    <!-- 背景装饰 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 顶部导航 -->
    <header class="help-header">
      <div class="header-content">
        <router-link to="/" class="back-home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {{ t('home.help.backHome') }}
        </router-link>
        <h1 class="page-title">{{ t('home.help.pageTitle') }}</h1>
        <div class="header-spacer"></div>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="help-main">
      <!-- 快速上手 -->
      <section class="help-section">
        <div class="section-header">
          <span class="section-tag">01</span>
          <h2>{{ t('home.help.quickStart.title') }}</h2>
        </div>
        <div class="quick-steps">
          <div class="quick-step" v-for="(step, index) in quickSteps" :key="index">
            <div class="step-icon" v-html="step.icon"></div>
            <div class="step-content">
              <h3>{{ step.title }}</h3>
              <p>{{ step.desc }}</p>
            </div>
            <div class="step-number">{{ String(index + 1).padStart(2, '0') }}</div>
          </div>
        </div>
      </section>

      <!-- 功能一览 -->
      <section class="help-section">
        <div class="section-header">
          <span class="section-tag">02</span>
          <h2>{{ t('home.help.featuresOverview.title') }}</h2>
        </div>
        <div class="feature-categories">
          <div
            v-for="cat in featureCategories"
            :key="cat.id"
            class="feature-category"
          >
            <div class="category-header">
              <div class="category-icon" v-html="cat.icon"></div>
              <h3>{{ t(`home.help.featureCategories.${cat.id}.title`) }}</h3>
            </div>
            <div class="category-items">
              <div
                v-for="item in cat.items"
                :key="item.id"
                class="category-item"
              >
                <span class="item-name">{{ t(`home.help.featureCategories.${cat.id}.items.${item.id}`) }}</span>
                <span class="item-desc" v-if="item.desc">{{ t(`home.help.featureCategories.${cat.id}.items.${item.id}Desc`) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 典型使用场景 -->
      <section class="help-section">
        <div class="section-header">
          <span class="section-tag">03</span>
          <h2>{{ t('home.help.useCases.title') }}</h2>
        </div>
        <div class="use-cases">
          <div class="use-case" v-for="useCase in useCases" :key="useCase.title">
            <div class="use-case-header">
              <div class="use-case-icon" v-html="useCase.icon"></div>
              <h3>{{ useCase.title }}</h3>
            </div>
            <div class="use-case-content">
              <div class="use-case-steps">
                <div class="uc-step" v-for="(ucStep, idx) in useCase.steps" :key="idx">
                  <span class="uc-num">{{ idx + 1 }}</span>
                  <span class="uc-text">{{ ucStep }}</span>
                </div>
              </div>
              <div class="use-case-result">
                <span class="result-label">{{ t('home.help.useCases.result') }}</span>
                <span class="result-icon">→</span>
                <span class="result-text">{{ useCase.result }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 常见问题 -->
      <section class="help-section">
        <div class="section-header">
          <span class="section-tag">04</span>
          <h2>{{ t('home.help.faq.title') }}</h2>
        </div>
        <div class="faq-list">
          <div
            class="faq-item"
            v-for="(faq, index) in faqs"
            :key="index"
            :class="{ 'is-open': openFaq === index }"
            @click="toggleFaq(index)"
          >
            <div class="faq-question">
              <span class="faq-num">{{ String(index + 1).padStart(2, '0') }}</span>
              <h3>{{ faq.q }}</h3>
              <svg class="faq-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
            <Transition name="faq-expand">
              <div class="faq-answer" v-if="openFaq === index">
                <p>{{ faq.a }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </section>

      <!-- 数据安全说明 -->
      <section class="help-section security-section">
        <div class="section-header">
          <span class="section-tag">05</span>
          <h2>{{ t('home.help.security.title') }}</h2>
        </div>
        <div class="security-content">
          <div class="security-badge">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span>{{ t('home.help.security.badge') }}</span>
          </div>
          <div class="security-points">
            <div class="security-point" v-for="point in securityPoints" :key="point.title">
              <div class="point-icon" v-html="point.icon"></div>
              <div class="point-info">
                <h4>{{ point.title }}</h4>
                <p>{{ point.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 底部导航 -->
      <footer class="help-footer">
        <div class="footer-content">
          <router-link to="/" class="start-btn">
            {{ t('home.help.startUsing') }}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </router-link>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const openFaq = ref(null)

// 快速上手步骤
const quickSteps = [
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
    title: t('home.help.quickStart.step1.title'),
    desc: t('home.help.quickStart.step1.desc')
  },
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>',
    title: t('home.help.quickStart.step2.title'),
    desc: t('home.help.quickStart.step2.desc')
  },
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    title: t('home.help.quickStart.step3.title'),
    desc: t('home.help.quickStart.step3.desc')
  },
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
    title: t('home.help.quickStart.step4.title'),
    desc: t('home.help.quickStart.step4.desc')
  }
]

// 功能分类列表
const featureCategories = [
  {
    id: 'clean',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0-6v6"/></svg>',
    items: [
      { id: 'emptyRows', desc: true },
      { id: 'emptyCols', desc: true },
      { id: 'trim', desc: true },
      { id: 'allSpaces', desc: true },
      { id: 'specialChars', desc: true },
      { id: 'fullHalf', desc: true }
    ]
  },
  {
    id: 'mask',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
    items: [
      { id: 'idCard', desc: true },
      { id: 'phone', desc: true },
      { id: 'email', desc: true },
      { id: 'name', desc: true },
      { id: 'custom', desc: true },
      { id: 'quick', desc: true },
      { id: 'regex', desc: true }
    ]
  },
  {
    id: 'split',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9v14h8M7 5h6v14H7"/></svg>',
    items: [
      { id: 'delimiter', desc: true },
      { id: 'width', desc: true },
      { id: 'toSheets', desc: true },
      { id: 'merge', desc: true },
      { id: 'transpose', desc: true }
    ]
  },
  {
    id: 'dedup',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18M3 12h18M3 18h18"/><path d="M8 6v12M16 6v12"/></svg>',
    items: [
      { id: 'exact', desc: true },
      { id: 'key', desc: true },
      { id: 'keepFirst', desc: true },
      { id: 'keepLast', desc: true }
    ]
  },
  {
    id: 'sort',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18M6 12h12M9 18h6"/><path d="M19 9l2 2-2 2M5 13l-2 2 2 2"/></svg>',
    items: [
      { id: 'asc', desc: true },
      { id: 'desc', desc: true },
      { id: 'shuffle', desc: true }
    ]
  },
  {
    id: 'format',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    items: [
      { id: 'date', desc: true },
      { id: 'round', desc: true },
      { id: 'csv', desc: true },
      { id: 'json', desc: true },
      { id: 'sqlInsert', desc: true },
      { id: 'sqlIn', desc: true }
    ]
  },
  {
    id: 'text',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7V4h16v3"/><path d="M9 20h6M12 4v16"/></svg>',
    items: [
      { id: 'replace', desc: true },
      { id: 'letterMap', desc: true },
      { id: 'upper', desc: true },
      { id: 'lower', desc: true },
      { id: 'capitalize', desc: true }
    ]
  },
  {
    id: 'extract',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>',
    items: [
      { id: 'colStr', desc: true },
      { id: 'regex', desc: true }
    ]
  },
  {
    id: 'calc',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="10" y2="10"/><line x1="12" y1="10" x2="14" y2="10"/><line x1="8" y1="14" x2="10" y2="14"/><line x1="12" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="16" y2="18"/></svg>',
    items: [
      { id: 'sum', desc: true },
      { id: 'count', desc: true },
      { id: 'avg', desc: true },
      { id: 'max', desc: true },
      { id: 'min', desc: true },
      { id: 'batchMath', desc: true },
      { id: 'group', desc: true }
    ]
  },
  {
    id: 'multi',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    items: [
      { id: 'append', desc: true },
      { id: 'horizontal', desc: true },
      { id: 'lookup', desc: true }
    ]
  },
  {
    id: 'wage',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><path d="M12 15v4M8 19h8"/></svg>',
    items: [
      { id: 'split', desc: true },
      { id: 'excel', desc: true },
      { id: 'pdf', desc: true }
    ]
  },
  {
    id: 'pipeline',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>',
    items: [
      { id: 'custom', desc: true },
      { id: 'intent', desc: true }
    ]
  }
]

// 典型使用场景
const useCases = [
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    title: t('home.help.useCases.case1.title'),
    steps: [
      t('home.help.useCases.case1.step1'),
      t('home.help.useCases.case1.step2'),
      t('home.help.useCases.case1.step3'),
      t('home.help.useCases.case1.step4')
    ],
    result: t('home.help.useCases.case1.result')
  },
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>',
    title: t('home.help.useCases.case2.title'),
    steps: [
      t('home.help.useCases.case2.step1'),
      t('home.help.useCases.case2.step2'),
      t('home.help.useCases.case2.step3')
    ],
    result: t('home.help.useCases.case2.result')
  },
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
    title: t('home.help.useCases.case3.title'),
    steps: [
      t('home.help.useCases.case3.step1'),
      t('home.help.useCases.case3.step2'),
      t('home.help.useCases.case3.step3')
    ],
    result: t('home.help.useCases.case3.result')
  }
]

// FAQ
const faqs = [
  { q: t('home.help.faq.q1'), a: t('home.help.faq.a1') },
  { q: t('home.help.faq.q2'), a: t('home.help.faq.a2') },
  { q: t('home.help.faq.q3'), a: t('home.help.faq.a3') },
  { q: t('home.help.faq.q4'), a: t('home.help.faq.a4') },
  { q: t('home.help.faq.q5'), a: t('home.help.faq.a5') },
  { q: t('home.help.faq.q6'), a: t('home.help.faq.a6') }
]

// 安全说明
const securityPoints = [
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    title: t('home.help.security.point1.title'),
    desc: t('home.help.security.point1.desc')
  },
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    title: t('home.help.security.point2.title'),
    desc: t('home.help.security.point2.desc')
  },
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
    title: t('home.help.security.point3.title'),
    desc: t('home.help.security.point3.desc')
  },
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    title: t('home.help.security.point4.title'),
    desc: t('home.help.security.point4.desc')
  }
]

// 切换FAQ展开/收起
function toggleFaq(index) {
  openFaq.value = openFaq.value === index ? null : index
}
</script>

<style scoped>
/* ========== 变量定义 ========== */
.help-page {
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

  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  position: relative;
}

/* 背景装饰 */
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
  opacity: 0.12;
}

.bg-glow-2 {
  bottom: -200px;
  left: -100px;
  background: radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%);
  opacity: 0.08;
}

/* 头部 */
.help-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 16px 32px;
  background: rgba(10, 14, 20, 0.85);
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

.back-home {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-secondary);
  text-decoration: none;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.back-home:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.05);
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  color: var(--text-primary);
}

.header-spacer {
  width: 120px;
}

/* 主内容 */
.help-main {
  position: relative;
  z-index: 1;
  max-width: 1000px;
  margin: 0 auto;
  padding: 60px 32px 80px;
}

/* 帮助区块 */
.help-section {
  margin-bottom: 80px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
}

.section-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent-primary);
  padding: 4px 10px;
  background: rgba(0, 212, 170, 0.1);
  border-radius: 4px;
  letter-spacing: 1px;
}

.section-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  color: var(--text-primary);
}

/* 快速上手 */
.quick-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.quick-step {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 28px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.quick-step:hover {
  border-color: var(--accent-primary);
  transform: translateX(8px);
}

.quick-step::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--accent-primary), var(--accent-secondary));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.quick-step:hover::before {
  opacity: 1;
}

.step-icon {
  color: var(--accent-primary);
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h3 {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  color: var(--text-primary);
}

.step-content p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary);
}

.step-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 32px;
  font-weight: 700;
  color: var(--border-color);
  transition: color 0.3s ease;
}

.quick-step:hover .step-number {
  color: var(--accent-primary);
}

/* 功能一览 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.feature-card {
  padding: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  transition: all 0.3s ease;
}

.feature-card:hover {
  border-color: var(--accent-secondary);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.feature-card.is-popular {
  border-color: rgba(255, 107, 53, 0.3);
}

.feature-card.is-popular:hover {
  border-color: var(--accent-warning);
}

.feature-icon {
  color: var(--accent-primary);
  margin-bottom: 16px;
}

.feature-info h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  color: var(--text-primary);
}

.popular-tag {
  font-size: 9px;
  font-weight: 700;
  padding: 3px 6px;
  background: var(--accent-warning);
  color: var(--bg-primary);
  border-radius: 4px;
  letter-spacing: 1px;
}

.feature-info p {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
}

.feature-tips {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.tip-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  color: var(--accent-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.tip-text {
  font-size: 12px;
  color: var(--text-muted);
}

/* 典型使用场景 */
.use-cases {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.use-case {
  padding: 28px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.use-case-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.use-case-icon {
  color: var(--accent-secondary);
}

.use-case-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  color: var(--text-primary);
}

.use-case-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.use-case-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.uc-step {
  display: flex;
  align-items: center;
  gap: 14px;
}

.uc-num {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--bg-primary);
  background: var(--accent-primary);
  border-radius: 50%;
  flex-shrink: 0;
}

.uc-text {
  font-size: 14px;
  color: var(--text-secondary);
}

.use-case-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(0, 212, 170, 0.05);
  border: 1px solid rgba(0, 212, 170, 0.2);
  border-radius: 10px;
}

.result-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.result-icon {
  color: var(--accent-primary);
  font-weight: 600;
}

.result-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--accent-primary);
}

/* FAQ */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.faq-item {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.faq-item:hover {
  border-color: var(--accent-secondary);
}

.faq-item.is-open {
  border-color: var(--accent-primary);
}

.faq-question {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
}

.faq-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-primary);
  flex-shrink: 0;
}

.faq-question h3 {
  flex: 1;
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

.faq-arrow {
  color: var(--text-muted);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.faq-item.is-open .faq-arrow {
  transform: rotate(180deg);
  color: var(--accent-primary);
}

.faq-answer {
  padding: 0 24px 20px;
  border-top: 1px solid var(--border-color);
  margin-top: 0;
  padding-top: 20px;
}

.faq-answer p {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.faq-expand-enter-active,
.faq-expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.faq-expand-enter-from,
.faq-expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.faq-expand-enter-to,
.faq-expand-leave-from {
  opacity: 1;
  max-height: 200px;
}

/* 安全说明 */
.security-section {
  padding: 40px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
}

.security-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.security-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
  background: rgba(0, 212, 170, 0.05);
  border: 1px solid rgba(0, 212, 170, 0.2);
  border-radius: 14px;
  text-align: center;
}

.security-badge svg {
  color: var(--accent-primary);
}

.security-badge span {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-primary);
  font-family: 'Outfit', sans-serif;
}

.security-points {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.security-point {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.point-icon {
  color: var(--accent-secondary);
  flex-shrink: 0;
}

.point-info h4 {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.point-info p {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-secondary);
}

/* 底部导航 */
.help-footer {
  padding: 40px 0;
}

.footer-content {
  display: flex;
  justify-content: center;
}

.start-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  font-size: 15px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  color: var(--bg-primary);
  background: var(--accent-primary);
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 212, 170, 0.3);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 212, 170, 0.4);
}

/* 响应式 */
@media (max-width: 768px) {
  .help-header {
    padding: 12px 16px;
  }

  .header-content {
    flex-wrap: wrap;
    gap: 12px;
  }

  .back-home {
    order: 1;
  }

  .page-title {
    order: 2;
    flex: 1;
    text-align: center;
    font-size: 16px;
  }

  .header-spacer {
    display: none;
  }

  .help-main {
    padding: 32px 16px 60px;
  }

  .section-header h2 {
    font-size: 22px;
  }

  .quick-step {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }

  .step-number {
    font-size: 24px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .security-section {
    padding: 24px;
  }
}
</style>
