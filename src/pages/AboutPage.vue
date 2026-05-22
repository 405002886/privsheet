<template>
  <div class="info-page">
    <!-- 背景装饰 -->
    <div class="bg-grid"></div>
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 顶部导航 -->
    <header class="info-header">
      <div class="header-content">
        <router-link to="/" class="back-home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {{ t('common.backHome') }}
        </router-link>
        <h1 class="page-title">{{ t('about.title') }}</h1>
        <div class="header-spacer"></div>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="info-main">
      <section class="info-section">
        <div class="section-header">
          <span class="section-tag">01</span>
          <h2>{{ t('about.s1.title') }}</h2>
        </div>
        <div class="section-card">
          <p>{{ t('about.s1.desc') }}</p>
        </div>
      </section>

      <section class="info-section">
        <div class="section-header">
          <span class="section-tag">02</span>
          <h2>{{ t('about.s2.title') }}</h2>
        </div>
        <div class="section-card">
          <p>{{ t('about.s2.desc') }}</p>
          <ul>
            <li v-for="item in 5" :key="item">
              <span class="list-marker">{{ item }}</span>
              {{ t(`about.s2.item${item}`) }}
            </li>
          </ul>
        </div>
      </section>

      <section class="info-section">
        <div class="section-header">
          <span class="section-tag">03</span>
          <h2>{{ t('about.s3.title') }}</h2>
        </div>
        <div class="section-card">
          <p>{{ t('about.s3.desc') }}</p>
        </div>
      </section>

      <section class="info-section">
        <div class="section-header">
          <span class="section-tag">04</span>
          <h2>{{ t('about.s4.title') }}</h2>
        </div>
        <div class="section-card">
          <p>{{ t('about.s4.desc') }}</p>
        </div>
      </section>

      <footer class="info-footer">
        <div class="footer-content">
          <router-link to="/" class="start-btn">
            {{ t('common.backHome') }}
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
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.info-page {
  --bg-primary: #0a0e14;
  --bg-secondary: #111820;
  --bg-card: #141c25;
  --bg-card-hover: #1a242f;
  --accent-primary: #00d4aa;
  --accent-secondary: #0099ff;
  --text-primary: #e8eaed;
  --text-secondary: #8b949e;
  --text-muted: #5c6370;
  --border-color: #2a3441;

  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  position: relative;
}

.bg-grid {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image:
    linear-gradient(rgba(0, 212, 170, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 170, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
}

.bg-glow {
  position: fixed;
  width: 600px; height: 600px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  filter: blur(120px);
  opacity: 0.4;
}

.bg-glow-1 {
  top: -200px; right: -100px;
  background: radial-gradient(circle, var(--accent-primary) 0%, transparent 70%);
  opacity: 0.12;
}

.bg-glow-2 {
  bottom: -200px; left: -100px;
  background: radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%);
  opacity: 0.08;
}

.info-header {
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

.header-spacer { width: 120px; }

.info-main {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  padding: 60px 32px 80px;
}

.info-section { margin-bottom: 48px; }

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
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
  font-size: 24px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  color: var(--text-primary);
}

.section-card {
  padding: 28px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.section-card:hover {
  border-color: var(--accent-primary);
}

.section-card p {
  margin: 0 0 12px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.section-card p:last-child { margin-bottom: 0; }

.section-card ul {
  list-style: none;
  padding: 0;
  margin: 16px 0 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-card li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.list-marker {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.info-footer {
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

@media (max-width: 768px) {
  .info-header { padding: 12px 16px; }
  .header-content { flex-wrap: wrap; gap: 12px; }
  .back-home { order: 1; }
  .page-title { order: 2; flex: 1; text-align: center; font-size: 16px; }
  .header-spacer { display: none; }
  .info-main { padding: 32px 16px 60px; }
  .section-header h2 { font-size: 20px; }
  .section-card { padding: 20px; }
}
</style>