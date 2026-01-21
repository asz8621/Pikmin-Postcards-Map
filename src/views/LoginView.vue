<script setup>
import { onMounted, ref, useTemplateRef } from 'vue'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import { authApi } from '@/services'
import AuthLayout from '@/components/AuthLayout.vue'
import FormInput from '@/components/FormInput.vue'
import SocialLogin from '@/components/SocialLogin.vue'
import { useApiError } from '@/composables/useApiError'
import { useSocketEvents } from '@/composables/useSocketEvents'
import { successMsg, errorMsg } from '@/utils/appMessage'

const router = useRouter()

const { handleError } = useApiError()

const { joinRoom } = useSocketEvents()

const loginData = ref({
  account: '',
  password: '',
})

const loading = ref(false)
const formLoading = ref(false)

const loginFormRef = useTemplateRef('loginFormRef')
const rules = {
  account: [{ required: true, message: '請輸入帳號', trigger: 'blur' }],
  password: [{ required: true, message: '請輸入密碼', trigger: 'blur' }],
}

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
      successMsg(res.data.message)
      router.push('/map')
    } else {
      errorMsg('登入失敗：無法驗證用戶')
    }
  } catch (err) {
    handleError(err, '登入錯誤，請聯絡管理員')
  } finally {
    loading.value = false
    formLoading.value = false
  }
}

const generateRandomState = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

const initiateOAuth = (provider) => {
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
    errorMsg(`${provider === 'google' ? 'Google' : 'Facebook'} 登入錯誤: ${error}`)
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
      <FormInput v-model="loginData.account" path="account" placeholder="請輸入帳號" icon="user" />

      <FormInput
        v-model="loginData.password"
        path="password"
        type="password"
        placeholder="請輸入密碼"
        icon="key"
        show-password-on="click"
      />

      <n-button type="primary" block :loading="formLoading" :disabled="loading" @click="login">
        登入
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
        忘記密碼？
      </n-button>
      <n-button type="text" size="small" :disabled="loading" @click="router.push('/register')">
        註冊帳號
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
