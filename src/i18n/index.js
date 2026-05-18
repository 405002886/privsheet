import { createI18n } from 'vue-i18n'
import { messages, defaultLocale, getDefaultLocale } from '../locales'

const i18n = createI18n({
  legacy: false, // 使用组合式 API
  locale: getDefaultLocale(),
  fallbackLocale: defaultLocale,
  messages,
  missingWarn: false,
  fallbackWarn: false
})

export default i18n