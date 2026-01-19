<script setup>
import { ref, useTemplateRef, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/services'
import AuthFooterTip from '@/components/AuthFooterTip.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import FormInput from '@/components/FormInput.vue'
import { useApiError } from '@/composables/useApiError'
import { useSocketStore } from '@/stores/useSocketStore'
import { successMsg } from '@/utils/appMessage'

const router = useRouter()

const socketStore = useSocketStore()
const { joinRoom } = socketStore

const { handleError } = useApiError()

const registerData = ref({
  name: '',
  account: '',
  password: '',
  email: '',
  confirmPassword: '',
})

const loading = ref(false)

const registerFormRef = useTemplateRef('registerFormRef')

const validatePasswordSame = (rule, value) => {
  return value === registerData.value.password
}

const rules = {
  name: [{ required: true, message: '請輸入姓名', trigger: 'blur' }],
  account: [
    { required: true, message: '請輸入帳號', trigger: 'blur' },
    { min: 6, max: 20, message: '帳號長度應為 6-20 個字元', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '請輸入信箱', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的信箱格式', trigger: ['blur', 'input'] },
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
      message: '密碼長度 8 字元以上，且需包含字母與數字',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    {
      required: true,
      message: '請再次輸入密碼',
      trigger: ['input', 'blur'],
    },
    {
      key: 'confirmPassword',
      validator: validatePasswordSame,
      message: '兩次密碼輸入不一致',
      trigger: ['input', 'blur'],
    },
  ],
}

const register = async () => {
  try {
    await registerFormRef.value?.validate()

    loading.value = true

    const res = await authApi.userRegister({
      name: registerData.value.name,
      account: registerData.value.account,
      password: registerData.value.password,
      email: registerData.value.email,
    })

    successMsg(res.data.message || '註冊成功！請登入')
    router.push('/login')
  } catch (err) {
    handleError(err, '註冊失敗，請聯絡管理員')
  } finally {
    loading.value = false
  }
}

const handlePasswordInput = async () => {
  if (registerData.value.confirmPassword) {
    try {
      await registerFormRef.value?.validate(
        () => {},
        (rules) => {
          return rules?.key === 'confirmPassword'
        },
      )
    } catch (err) {
      if (err) return
    }
  }
}

onMounted(() => {
  joinRoom('register', null)
})
</script>

<template>
  <AuthLayout>
    <n-form
      ref="registerFormRef"
      class="mb-4"
      :model="registerData"
      :rules="rules"
      :disabled="loading"
      :show-require-mark="false"
      @keydown.enter.prevent="register"
    >
      <FormInput v-model="registerData.name" path="name" placeholder="請輸入姓名" icon="id-card" />

      <FormInput v-model="registerData.email" path="email" placeholder="請輸入信箱" icon="email" />

      <FormInput
        v-model="registerData.account"
        path="account"
        placeholder="請輸入帳號"
        icon="user"
      />

      <FormInput
        v-model="registerData.password"
        path="password"
        type="password"
        placeholder="請輸入密碼"
        icon="key"
        show-password-on="click"
        @input="handlePasswordInput"
      />

      <FormInput
        v-model="registerData.confirmPassword"
        path="confirmPassword"
        type="password"
        placeholder="請再次輸入密碼"
        icon="key"
        show-password-on="click"
      />

      <n-button
        type="primary"
        block
        :loading="loading"
        :disabled="loading"
        @click="register"
        class="mb-4"
      >
        註冊
      </n-button>
    </n-form>

    <AuthFooterTip
      tip-text="已有帳號？"
      button-text="立即登入"
      route-to="/login"
      :disabled="loading"
    />
  </AuthLayout>
</template>

<style lang="scss" scoped></style>
