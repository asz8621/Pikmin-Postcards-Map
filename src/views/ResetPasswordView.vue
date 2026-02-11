<script setup lang="ts">
import { ref, useTemplateRef, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authApi } from '@/services'
import AuthLayout from '@/components/AuthLayout.vue'
import FormInput from '@/components/FormInput.vue'
import { useApiError } from '@/composables/useApiError'
import { useValidationRules } from '@/composables/useValidationRules'
import { useLanguage } from '@/composables/useLanguage'
import { successMsg, errorMsg } from '@/utils/appMessage'

const router = useRouter()
const route = useRoute()

const { t, locale } = useLanguage()

const { handleError } = useApiError()

const resetData = ref({
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const resetFormRef = useTemplateRef('resetFormRef')

// 從 URL 參數獲取 token, email, account
const token = ref<string>('')
const email = ref<string>('')
const account = ref<string>('')

const { getRules, passwordWatch, localeWatch } = useValidationRules(resetFormRef, resetData)

const rules = computed(() =>
  getRules({
    password: [
      { type: 'required', message: t('validation.requiredNewPassword') },
      { type: 'passwordRegex', message: t('validation.newPasswordLength') },
    ],
    confirmPassword: ['passwordMatch'],
  }),
)
passwordWatch()
localeWatch()

const resetPassword = async () => {
  try {
    await resetFormRef.value?.validate()

    loading.value = true

    await authApi.resetForgotPassword({
      token: token.value,
      email: email.value,
      account: account.value,
      password: resetData.value.password,
    })

    successMsg(t('message.passwordResetSuccess'))

    router.push('/login')
  } catch (err) {
    handleError(err, t('message.passwordResetError'))
  } finally {
    loading.value = false
  }
}

// 驗證 URL 參數
const validateUrlParams = () => {
  const urlToken = route.query.token
  const urlEmail = route.query.email
  const urlAccount = route.query.account

  // 檢查 URL 參數是否存在，並進行賦值
  if (
    typeof urlToken === 'string' &&
    typeof urlEmail === 'string' &&
    typeof urlAccount === 'string'
  ) {
    token.value = urlToken
    email.value = urlEmail
    account.value = urlAccount
    return true
  } else {
    errorMsg(t('message.passwordResetInvalidLink'))
    router.push('/forgot-password')
    return false
  }
}

onMounted(() => {
  validateUrlParams()
})
</script>

<template>
  <AuthLayout>
    <div class="text-center mb-6">
      <h2 class="text-xl font-semibold text-gray-700 mb-2">{{ t('auth.resetPassword') }}</h2>
      <p class="text-sm text-gray-500">
        {{ t('auth.account') }}：<span class="font-medium text-gray-700">{{ account }}</span>
      </p>
      <p class="text-sm text-gray-500">
        {{ t('auth.email') }}：<span class="font-medium text-gray-700">{{ email }}</span>
      </p>
    </div>

    <n-form
      ref="resetFormRef"
      class="mb-4"
      :model="resetData"
      :rules="rules"
      :disabled="loading"
      :show-require-mark="false"
      @keydown.enter.prevent="resetPassword"
    >
      <FormInput
        v-model="resetData.password"
        path="password"
        type="password"
        :placeholder="t('validation.requiredNewPassword')"
        icon="key"
        show-password-on="click"
      />

      <FormInput
        v-model="resetData.confirmPassword"
        path="confirmPassword"
        type="password"
        :placeholder="t('validation.requiredConfirmNewPasswordAgain')"
        icon="key"
        show-password-on="click"
      />

      <n-button
        type="primary"
        block
        :loading="loading"
        :disabled="loading"
        @click="resetPassword"
        class="mb-4"
      >
        {{ t('auth.resetPassword') }}
      </n-button>
    </n-form>

    <div class="text-center">
      <n-button type="text" size="small" :disabled="loading" @click="router.push('/login')">
        {{ t('auth.backToLogin') }}
      </n-button>
    </div>
  </AuthLayout>
</template>

<style lang="scss" scoped></style>
