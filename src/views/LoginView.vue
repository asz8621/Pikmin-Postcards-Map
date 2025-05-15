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

const formRef = ref(null)
const rules = {
  account: [{ required: true, message: '請輸入帳號', trigger: 'blur' }],
  password: [{ required: true, message: '請輸入密碼', trigger: 'blur' }],
}

const login = async () => {
  await formRef.value?.validate()
  loading.value = true
  try {
    const res = await axios.post('/user/login', {
      account: loginData.value.account,
      password: loginData.value.password,
    })
    const token = res.data.data.token
    if (token) {
      Cookies.set('token', token, { expires: 7 })
      successMsg(res.data.message)
      router.push('/map')
    } else {
      errorMsg('登入失敗：無法驗證用戶')
    }
  } catch (err) {
    errorMsg(err.response?.data?.message || '登入錯誤')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    style="
      max-width: 400px;
      margin: 100px auto;
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 8px;
    "
  >
    <h1>登入頁面</h1>

    <n-form
      ref="formRef"
      :model="loginData"
      :rules="rules"
      :disabled="loading"
      :show-require-mark="false"
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
      <n-button type="primary" block :loading="loading" @click="login"> 登入 </n-button>
    </n-form>
  </div>
</template>
