import { watch, nextTick, computed, type Ref } from 'vue'
import type { FormInst, FormItemRule } from 'naive-ui'
interface FormData {
  password: string
  passwordOld?: string
  confirmPassword?: string
}

export function usePasswordValidation(formRef: Ref<FormInst | null>) {
  // 通用密碼驗證器
  const createBasePasswordValidator = (
    requiredText: string,
    minText: string,
    validatorText: string,
  ): FormItemRule[] => [
    { required: true, message: requiredText, trigger: 'blur' },
    { min: 8, message: minText, trigger: ['input', 'blur'] },
    {
      validator: (_rule: FormItemRule, value: string) => {
        if (!value) return true
        const hasLetter = /[a-zA-Z]/.test(value)
        const hasNumber = /\d/.test(value)
        return hasLetter && hasNumber
      },
      message: validatorText,
      trigger: ['input', 'blur'],
    },
  ]

  // 確認密碼驗證規則
  const confirmPasswordRules = (
    formData: FormData,
    requiredText: string,
    mismatchText: string,
  ): FormItemRule[] => [
    {
      required: true,
      message: requiredText,
      trigger: ['input', 'blur'],
    },
    {
      key: 'confirmPassword',
      validator: (_rule: FormItemRule, value: string) => {
        if (!value) return true
        return value === formData.password
      },
      message: mismatchText,
      trigger: ['input', 'blur'],
    },
  ]

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
    confirmPasswordRules,
    passwordWatch,
    createBasePasswordValidator,
  }
}
