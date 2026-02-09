import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export type SupportedLocale = 'zh-TW' | 'en' | 'ja' | 'ko'

export interface CountryOptions {
  value: SupportedLocale
  label: string
}

export const useLanguage = () => {
  const { locale, t } = useI18n()

  const changeLocale = (lang: string) => {
    if (['zh-TW', 'en', 'ja', 'ko'].includes(lang)) {
      locale.value = lang
      localStorage.setItem('lang', lang)
    }
  }

  const countryOptions: CountryOptions[] = [
    { value: 'zh-TW', label: '繁體中文' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
  ]

  const currentLocale = computed(() => locale.value as SupportedLocale)

  return {
    locale,
    currentLocale,
    t,
    changeLocale,
    countryOptions,
  }
}
