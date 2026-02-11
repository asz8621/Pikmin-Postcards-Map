<script setup lang="ts">
import { ref, useTemplateRef, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import { authApi } from '@/services'
import AuthLayout from '@/components/AuthLayout.vue'
import FormInput from '@/components/FormInput.vue'
import SocialLogin from '@/components/SocialLogin.vue'
import { useApiError } from '@/composables/useApiError'
import { useSocketEvents } from '@/composables/useSocketEvents'
import { useLanguage } from '@/composables/useLanguage'
import { useValidationRules } from '@/composables/useValidationRules'
import { successMsg, errorMsg } from '@/utils/appMessage'

const router = useRouter()

const { handleError } = useApiError()

const { joinRoom } = useSocketEvents()

const { t, locale } = useLanguage()

const loginData = ref({
  account: '',
  password: '',
})
const loading = ref(false)
const formLoading = ref(false)
const loginFormRef = useTemplateRef('loginFormRef')

const { getRules, localeWatch } = useValidationRules()
const rules = computed(() =>
  getRules({
    account: [{ type: 'required', message: t('validation.requiredAccount') }],
    password: [{ type: 'required', message: t('validation.requiredPassword') }],
  }),
)
localeWatch()

const login = async () => {
  try {
    await loginFormRef.value?.validate()

    loading.value = true
    formLoading.value = true

    const res = await authApi.userLogin({
      account: loginData.value.account,
      password: loginData.value.password,
    })

    const token = res.data.data.token
    if (token) {
      Cookies.set('token', token, { expires: 1 })
      successMsg(t('message.login'))
      router.push('/map')
    } else {
      errorMsg(t('message.loginFailedInvalidUser'))
    }
  } catch (err) {
    handleError(err, t('message.loginError'))
  } finally {
    loading.value = false
    formLoading.value = false
  }
}

const generateRandomState = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const initiateOAuth = (provider: 'google' | 'facebook') => {
  if (loading.value) return

  loading.value = true

  try {
    // 產生隨機 state 防 CSRF
    const state = generateRandomState()
    localStorage.setItem('oauth_state', state)

    // 跳轉到後端的 OAuth 端點 (注意使用完整的後端 URL)
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3006/api/v1'
    window.location.href = `${backendUrl}/auth/${provider}?state=${state}`
  } catch (error) {
    errorMsg(`${capitalizeFirstLetter(provider)} ${t('message.loginError')} [${error}]`)
    loading.value = false
  }
}

onMounted(() => {
  joinRoom('login', null)
})
</script>

<template>
  <AuthLayout>
    <n-form
      ref="loginFormRef"
      class="mb-2"
      :model="loginData"
      :rules="rules"
      :disabled="loading"
      :show-require-mark="false"
      @keydown.enter.prevent="login"
    >
      <FormInput
        v-model="loginData.account"
        path="account"
        :placeholder="t('validation.requiredAccount')"
        icon="user"
      />

      <FormInput
        v-model="loginData.password"
        path="password"
        type="password"
        :placeholder="t('validation.requiredPassword')"
        icon="key"
        show-password-on="click"
      />

      <n-button type="primary" block :loading="formLoading" :disabled="loading" @click="login">
        {{ t('auth.login') }}
      </n-button>
    </n-form>

    <div class="flex justify-between items-center mb-2">
      <n-button
        type="primary"
        size="small"
        text
        :disabled="loading"
        @click="router.push('/forgot-password')"
      >
        {{ t('auth.forgotPassword') }}
      </n-button>
      <n-button type="text" size="small" :disabled="loading" @click="router.push('/register')">
        {{ t('auth.registerNow') }}
      </n-button>
    </div>

    <SocialLogin
      :loading="loading"
      @facebook-login="initiateOAuth('facebook')"
      @google-login="initiateOAuth('google')"
    />
  </AuthLayout>
</template>

<style lang="scss" scoped></style>
