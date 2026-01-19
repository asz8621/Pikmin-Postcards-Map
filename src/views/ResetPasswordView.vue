<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from '@/plugins/axios'
import AuthLayout from '@/components/AuthLayout.vue'
import FormInput from '@/components/FormInput.vue'
import { useApiError } from '@/composables/useApiError'
import { successMsg, errorMsg } from '@/utils/appMessage'

const router = useRouter()
const route = useRoute()

const { handleError } = useApiError()

const resetData = ref({
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const resetFormRef = ref(null)

// 從 URL 參數獲取 token, email, account
const token = ref('')
const email = ref('')
const account = ref('')

const validatePasswordStartWith = (rule, value) => {
  return (
    !!resetData.value.password &&
    resetData.value.password.startsWith(value) &&
    resetData.value.password.length >= value.length
  )
}

const validatePasswordSame = (rule, value) => {
  return value === resetData.value.password
}

const rules = {
  password: [
    { required: true, message: '請輸入新密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度至少為 6 個字元', trigger: 'blur' },
  ],
  confirmPassword: [
    {
      required: true,
      message: '請再次輸入密碼',
      trigger: ['input', 'blur'],
    },
    {
      validator: validatePasswordStartWith,
      message: '兩次密碼輸入不一致',
      trigger: 'input',
    },
    {
      validator: validatePasswordSame,
      message: '兩次密碼輸入不一致',
      trigger: ['blur', 'password-input'],
    },
  ],
}

const resetPassword = async () => {
  try {
    await resetFormRef.value?.validate()

    loading.value = true

    const res = await axios.post('/user/reset-forgot-password', {
      token: token.value,
      email: email.value,
      account: account.value,
      password: resetData.value.password,
    })

    successMsg(res.data.message || '密碼重設成功！請使用新密碼登入')

    router.push('/login')
  } catch (err) {
    handleError(err, '重設密碼失敗，請聯絡管理員')
  } finally {
    loading.value = false
  }
}

const handlePasswordInput = () => {
  if (resetData.value.confirmPassword) {
    resetFormRef.value?.validate('confirmPassword')
  }
}

// 驗證 URL 參數
const validateUrlParams = () => {
  const urlToken = route.query.token
  const urlEmail = route.query.email
  const urlAccount = route.query.account

  if (!urlToken || !urlEmail || !urlAccount) {
    errorMsg('無效的重設連結，請重新申請忘記密碼')
    router.push('/forgot-password')
    return false
  }

  token.value = urlToken
  email.value = urlEmail
  account.value = urlAccount
  return true
}

onMounted(() => {
  validateUrlParams()
})
</script>

<template>
  <AuthLayout>
    <div class="text-center mb-6">
      <h2 class="text-xl font-semibold text-gray-700 mb-2">重設密碼</h2>
      <p class="text-sm text-gray-500">
        帳號：<span class="font-medium text-gray-700">{{ account }}</span>
      </p>
      <p class="text-sm text-gray-500">
        信箱：<span class="font-medium text-gray-700">{{ email }}</span>
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
        placeholder="請輸入新密碼"
        icon="key"
        show-password-on="click"
        @input="handlePasswordInput"
      />

      <FormInput
        v-model="resetData.confirmPassword"
        path="confirmPassword"
        type="password"
        placeholder="請再次輸入新密碼"
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
        重設密碼
      </n-button>
    </n-form>

    <div class="text-center">
      <n-button type="text" size="small" :disabled="loading" @click="router.push('/login')">
        返回登入頁面
      </n-button>
    </div>
  </AuthLayout>
</template>

<style lang="scss" scoped></style>
