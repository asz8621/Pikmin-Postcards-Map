import { watch, nextTick, type Ref } from 'vue'
import type { FormInst, FormItemRule } from 'naive-ui'

interface FormData {
  password: string
  passwordOld?: string
  confirmPassword?: string
}

export function usePasswordValidation(formRef: Ref<FormInst | null>) {
  // 通用密碼驗證器
  const createBasePasswordValidator = (label: string): FormItemRule[] => [
    { required: true, message: `請輸入${label}`, trigger: 'blur' },
    { min: 8, message: `${label}長度至少 8 個字符`, trigger: ['input', 'blur'] },
    {
      validator: (_rule: FormItemRule, value: string) => {
        if (!value) return true
        const hasLetter = /[a-zA-Z]/.test(value)
        const hasNumber = /\d/.test(value)
        return hasLetter && hasNumber
      },
      message: `${label}必須至少包含字母與數字`,
      trigger: ['input', 'blur'],
    },
  ]

  // 舊密碼驗證規則
  const oldPasswordRules = () => ({
    passwordOld: createBasePasswordValidator('舊密碼'),
  })

  // 新密碼驗證規則
  const passwordRules = () => ({
    password: createBasePasswordValidator('新密碼'),
  })

  // 確認密碼驗證規則
  const confirmPasswordRules = (formData: FormData) => ({
    confirmPassword: [
      {
        required: true,
        message: '請輸入確認新密碼',
        trigger: ['input', 'blur'],
      },
      {
        key: 'confirmPassword',
        validator: (_rule: FormItemRule, value: string) => {
          if (!value) return true
          return value === formData.password
        },
        message: '兩次輸入的密碼不一致',
        trigger: ['input', 'blur'],
      },
    ],
  })

  // 密碼變更監聽器
  const passwordWatch = (formData: FormData) => {
    const validateConfirmPassword = async () => {
      if (!formData.confirmPassword) return

      await nextTick()
      formRef.value
        ?.validate(undefined, (rule: FormItemRule) => rule?.key === 'confirmPassword')
        .catch(() => {})
    }

    watch(() => formData.password, validateConfirmPassword)
  }

  return {
    oldPasswordRules,
    passwordRules,
    confirmPasswordRules,
    passwordWatch,
  }
}
