import { createI18n } from 'vue-i18n'
import type { I18nOptions } from 'vue-i18n'
import messages from '@/locales'

// 支援的語言列表
const languageList = ['zh-TW', 'en', 'ja', 'ko']
const defaultLanguage = 'zh-TW'

// 從 localStorage 取得語言
const getStoredLocale = (): string => {
  const stored = localStorage.getItem('lang')
  if (stored && languageList.includes(stored)) {
    return stored
  }
  // 如果有無效值，設置為預設語言
  if (stored) {
    localStorage.setItem('lang', defaultLanguage)
    return defaultLanguage
  }
  return ''
}

// 從瀏覽器語言偵測
const getBrowserLocale = (): string => {
  const browserLang = navigator.language
  const langPrefix = browserLang.split('-')[0] ?? ''
  const languageMap: Record<string, string> = {
    zh: 'zh-TW',
    ja: 'ja',
    ko: 'ko',
    en: 'en',
  }
  const detected = languageMap[langPrefix] || defaultLanguage
  // 儲存偵測到的語言到 localStorage
  localStorage.setItem('lang', detected)
  return detected
}

// 決定初始語言
const getInitialLocale = (): string => {
  return getStoredLocale() || getBrowserLocale()
}

const i18nOptions: I18nOptions = {
  legacy: false, // 使用 Composition API 模式
  locale: getInitialLocale(),
  fallbackLocale: defaultLanguage,
  messages,
  globalInjection: true, // 全域注入 $t
}

export const i18n = createI18n(i18nOptions)

export default i18n
