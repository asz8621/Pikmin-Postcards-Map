<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import axios from '@/plugins/axios'
import { useAppMessage } from '@/composables/useAppMessage'

const router = useRouter()

const { successMsg, errorMsg } = useAppMessage()

const loginData = ref({
  account: '',
  password: '',
})

const loading = ref(false)

const loginFormRef = ref(null)
const rules = {
  account: [{ required: true, message: '請輸入帳號', trigger: 'blur' }],
  password: [{ required: true, message: '請輸入密碼', trigger: 'blur' }],
}

const login = async () => {
  await loginFormRef.value?.validate()
  loading.value = true
  try {
    const res = await axios.post('/user/login', {
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
    errorMsg(err.response?.data?.message || '登入錯誤，請聯絡管理員')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="flex justify-center items-start min-h-screen bg-login bg-center bg-center p-4 sm:p-0 sm:items-center"
  >
    <div
      class="w-full sm:w-[400px] p-6 bg-green-50/90 rounded-lg shadow-lg mt-[100px] sm:mt-0 transition-width duration-500 ease-in-out"
    >
      <h1 class="text-3xl font-semibold text-center text-green-600 mb-6">
        <img src="@/assets/images/logo.png" alt="logo" class="mx-auto" />
      </h1>

      <n-form
        ref="loginFormRef"
        :model="loginData"
        :rules="rules"
        :disabled="loading"
        :show-require-mark="false"
        @keydown.enter.prevent="login"
      >
        <n-form-item label="帳號" path="account">
          <n-input v-model:value="loginData.account" placeholder="請輸入帳號" />
        </n-form-item>
        <n-form-item label="密碼" path="password">
          <n-input
            v-model:value="loginData.password"
            type="password"
            placeholder="請輸入密碼"
            show-password-on="click"
          />
        </n-form-item>
        <n-button type="primary" block :loading="loading" :disabled="loading" @click="login">
          登入
        </n-button>
      </n-form>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
