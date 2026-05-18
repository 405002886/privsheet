import zhCN from './zh-CN.json'
import en from './en.json'

// =============================================
// 语言配置
// 默认语言可通过环境变量 VITE_DEFAULT_LOCALE 配置
// 可选值: 'zh-CN', 'en'
// =============================================
const localeConfig = {
  // 环境变量优先，否则使用默认值 'en'
  defaultLocale: import.meta.env.VITE_DEFAULT_LOCALE || 'en',
  supportedLocales: ['zh-CN', 'en']  // 支持的语言列表
}

// 验证默认语言是否在支持列表中
if (!localeConfig.supportedLocales.includes(localeConfig.defaultLocale)) {
  console.warn(`[i18n] 不支持的语言 '${localeConfig.defaultLocale}'，将使用 'en' 作为默认语言`)
  localeConfig.defaultLocale = 'en'
}

export const messages = {
  'zh-CN': zhCN,
  en: en
}

export const languages = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
]

export const defaultLocale = localeConfig.defaultLocale

export function getDefaultLocale() {
  return defaultLocale
}