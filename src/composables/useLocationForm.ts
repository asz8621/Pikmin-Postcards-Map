import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

export const useLocationForm = () => {
  const { t } = useLanguage()

  type FormData = { explore: boolean; [key: string]: unknown }
  type LocationType = 'flower' | 'mushroom'

  // 類型選項
  const typeOptions = computed(() => [
    { label: t('common.flower'), value: 'flower' },
    { label: t('common.mushroom'), value: 'mushroom' },
  ])

  // 蘑菇禁止修改隱藏版
  const typeChange = (formData: FormData, type: LocationType) => {
    if (type === 'mushroom') {
      formData.explore = false
    }
  }

  return {
    typeOptions,
    typeChange,
  }
}
