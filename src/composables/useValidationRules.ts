import { watch, nextTick, unref, type Ref } from 'vue'
import type { FormInst, FormItemRule, UploadFileInfo } from 'naive-ui'
import { useLanguage } from '@/composables/useLanguage'
import { useFileUpload } from '@/composables/useFileUpload'

export function useValidationRules(formRef?: Ref<FormInst | null>, formData?: any) {
  type ValidationRule = {
    required?: boolean
    message: string
    trigger: string | string[]
    pattern?: RegExp
    type?: string
    validator?: (_: any, value: any) => boolean | Error | void
    min?: number
    max?: number
    key?: string
  }

  const { t } = useLanguage()
  const { validateImageFile } = useFileUpload()

  // 規則配置類型：可以是字串或帶自訂訊息的物件
  type RuleConfig = string | { type: string; message: string }

  interface UploadFile extends UploadFileInfo {
    size: number
  }

  // 定義各種驗證規則
  const createRule = (ruleType: string, customMessage?: string): ValidationRule | null => {
    switch (ruleType) {
      // 密碼強度驗證
      case 'passwordRegex':
        return {
          pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
          message: customMessage || '',
          trigger: ['blur', 'input'],
        }

      // 確認密碼比對（固定訊息）
      case 'passwordMatch':
        return {
          key: 'confirmPassword',
          validator: (_: any, value: string) => {
            const data = unref(formData)
            if (!data) return true
            return value === data.password
          },
          message: t('validation.passwordMismatch'),
          trigger: ['blur', 'input'],
        }

      // Email 格式驗證（固定訊息）
      case 'isEmail':
        return {
          type: 'email',
          message: t('validation.invalidEmail'),
          trigger: ['blur', 'input'],
        }

      // 帳號長度驗證（固定訊息）
      case 'accountLength':
        return {
          min: 6,
          max: 20,
          message: t('validation.accountLength', { min: 6, max: 20 }),
          trigger: ['blur', 'input'],
        }

      // 錯誤回報類型驗證（固定訊息）
      case 'reportType':
        return {
          required: true,
          type: 'number',
          message: t('validation.requiredErrorType'),
          trigger: 'change',
        }

      // 圖片上傳驗證
      case 'imgUpload':
        return {
          key: 'imageFile',
          required: true,
          message: t('message.uploadImage'),
          validator: (_: unknown, value: UploadFile) => {
            const data = unref(formData)
            const result = validateImageFile(value, data?.image)
            return result
          },
          trigger: ['change', 'blur'],
        }

      // 座標驗證
      case 'coords':
        return {
          message: t('validation.invalidCoords'),
          validator: (_: any, value: string) => {
            if (!value || value.trim() === '') {
              return new Error(t('validation.requiredCoords'))
            }

            const coordRegex = /^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/
            const match = value?.match(coordRegex)

            if (!match || !match[1] || !match[3]) {
              return new Error(t('validation.invalidCoords'))
            }

            const lat = parseFloat(match[1])
            const long = parseFloat(match[3])

            if (lat < -90 || lat > 90 || long < -180 || long > 180) {
              return new Error(t('validation.outOfRangeCoords'))
            }

            return true
          },
          trigger: ['blur', 'input'],
        }

      // required 規則由外部傳入訊息
      case 'required':
        return {
          required: true,
          message: customMessage || '',
          trigger: 'blur',
        }

      default:
        return null
    }
  }

  // 取得指定欄位的 rules
  const getRules = (config: Record<string, Array<RuleConfig>>) => {
    const rules: Record<string, ValidationRule[]> = {}

    Object.entries(config).forEach(([field, ruleConfigs]) => {
      rules[field] = ruleConfigs
        .map((ruleConfig) => {
          // 支援字串或物件形式
          if (typeof ruleConfig === 'string') {
            return createRule(ruleConfig)
          } else {
            return createRule(ruleConfig.type, ruleConfig.message)
          }
        })
        .filter((rule): rule is ValidationRule => rule !== null)
    })

    return rules
  }

  // 密碼變更監聽器
  const passwordWatch = () => {
    const validateConfirmPassword = async () => {
      const data = unref(formData)
      if (!data?.confirmPassword || !formRef) return
      await nextTick()
      formRef.value
        ?.validate(undefined, (rule: FormItemRule) => rule?.key === 'confirmPassword')
        .catch(() => {})
    }

    const data = unref(formData)
    if (data) {
      watch(() => data.password, validateConfirmPassword)
    }
  }

  // 監聽語系變化，清除所有驗證錯誤訊息
  const localeWatch = () => {
    if (!formRef) return

    const { locale } = useLanguage()

    watch(locale, () => {
      formRef.value?.restoreValidation()
    })
  }

  return {
    getRules,
    passwordWatch,
    localeWatch,
  }
}
