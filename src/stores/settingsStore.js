import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const theme = ref('light')
  const language = ref('zh-CN')
  const engine = ref('auto') // 'auto' | 'js' | 'wasm'
  const maxFileSize = ref(100 * 1024 * 1024) // 100MB
  const mobileMaxFileSize = ref(50 * 1024 * 1024) // 50MB

  // 计算属性
  const isDarkMode = computed(() => theme.value === 'dark')

  const effectiveMaxFileSize = computed(() => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    return isMobile ? mobileMaxFileSize.value : maxFileSize.value
  })

  // 方法
  function setTheme(newTheme) {
    theme.value = newTheme
  }

  function setLanguage(lang) {
    language.value = lang
  }

  function setEngine(engineType) {
    engine.value = engineType
  }

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return {
    theme,
    language,
    engine,
    maxFileSize,
    mobileMaxFileSize,
    isDarkMode,
    effectiveMaxFileSize,
    setTheme,
    setLanguage,
    setEngine,
    toggleTheme
  }
})
