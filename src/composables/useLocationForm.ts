export const useLocationForm = () => {
  type FormData = { explore: boolean; [key: string]: unknown }
  type LocationType = 'flower' | 'mushroom'

  // 類型選項
  const typeOptions = [
    { label: '花', value: 'flower' },
    { label: '蘑菇', value: 'mushroom' },
  ]

  // 蘑菇禁止修改隱藏版
  const typeChange = (formData: FormData, type: LocationType) => {
    if (type === 'mushroom') {
      formData.explore = false
    }
  }

  // 類型驗證規則
  const typeRules = () => ({
    type: [{ required: true, message: '請選擇類型', trigger: 'blur' }],
  })

  return {
    typeOptions,
    typeChange,
    typeRules,
  }
}
