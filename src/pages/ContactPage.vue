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
        <h1 class="page-title">{{ t('contact.title') }}</h1>
        <div class="header-spacer"></div>
      </div>
    </header>

    <!-- 主内容 -->
    <main class="info-main">
      <section class="info-section">
        <div class="section-header">
          <span class="section-tag">01</span>
          <h2>{{ t('contact.s1.title') }}</h2>
        </div>
        <div class="section-card">
          <p>{{ t('contact.s1.desc') }}</p>
        </div>
      </section>

      <section class="info-section">
        <div class="section-header">
          <span class="section-tag">02</span>
          <h2>{{ t('contact.s2.github') }}</h2>
        </div>
        <div class="channel-grid">
          <div class="channel-card">
            <div class="channel-icon github-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </div>
            <div class="channel-info">
              <h3>GitHub</h3>
              <a href="https://github.com/405002886/privsheet" target="_blank" rel="noopener noreferrer" class="channel-link">
                github.com/405002886/privsheet
              </a>
              <p>{{ t('contact.s2.github') }}</p>
            </div>
          </div>

          <div class="channel-card">
            <div class="channel-icon issue-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div class="channel-info">
              <h3>{{ t('contact.s2.issue') }}</h3>
              <a href="https://github.com/405002886/privsheet/issues" target="_blank" rel="noopener noreferrer" class="channel-link">
                GitHub Issues
              </a>
              <p>{{ t('contact.s2.issueDesc') }}</p>
            </div>
          </div>

          <div class="channel-card">
            <div class="channel-icon email-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div class="channel-info">
              <h3>Email</h3>
              <a href="mailto:mky405002886@gmail.com" class="channel-link">mky405002886@gmail.com</a>
              <p>{{ t('contact.s2.emailDesc') }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="info-section">
        <div class="section-header">
          <span class="section-tag">03</span>
          <h2>{{ t('contact.s3.title') }}</h2>
        </div>
        <div class="section-card">
          <p>{{ t('contact.s3.desc') }}</p>
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
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-secondary);
}

/* 联系渠道卡片 */
.channel-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.channel-card {
  display: flex;
  gap: 20px;
  padding: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  transition: all 0.3s ease;
}

.channel-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.channel-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.github-icon {
  color: var(--text-primary);
  background: rgba(0, 212, 170, 0.1);
}

.issue-icon {
  color: var(--accent-secondary);
  background: rgba(0, 153, 255, 0.1);
}

.email-icon {
  color: var(--accent-primary);
  background: rgba(0, 212, 170, 0.1);
}

.channel-info h3 {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.channel-link {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  color: var(--accent-primary);
  text-decoration: none;
  transition: opacity 0.3s ease;
}

.channel-link:hover { opacity: 0.8; }

.channel-info p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-muted);
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
  .channel-card { flex-direction: column; gap: 16px; }
}
</style>