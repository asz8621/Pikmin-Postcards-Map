<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/services'
import AuthLayout from '@/components/AuthLayout.vue'
import FormInput from '@/components/FormInput.vue'
import AuthFooterTip from '@/components/AuthFooterTip.vue'
import { useApiError } from '@/composables/useApiError'
import { successMsg } from '@/utils/appMessage'

const router = useRouter()

const { handleError } = useApiError()

const forgotData = ref({
  account: '',
  email: '',
})

const loading = ref(false)
const forgotFormRef = ref(null)

const rules = {
  account: [
    { required: true, message: '請輸入帳號', trigger: 'blur' },
    { min: 3, max: 20, message: '帳號長度須在 3 到 20 個字元之間', trigger: ['blur', 'input'] },
  ],
  email: [
    { required: true, message: '請輸入信箱', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的信箱格式', trigger: ['blur', 'input'] },
  ],
}

const sendResetEmail = async () => {
  try {
    await forgotFormRef.value?.validate()

    loading.value = true

    const res = await authApi.forgotPassword({
      account: forgotData.value.account,
      email: forgotData.value.email,
    })

    successMsg(res.data.message || '密碼重設郵件已發送，請檢查您的信箱')

    router.push('/login')
  } catch (err) {
    handleError(err, '發送失敗，請聯絡管理員')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="text-center mb-6">
      <h2 class="text-xl font-semibold text-gray-700 mb-2">忘記密碼</h2>
      <p class="text-sm text-gray-500">請輸入您的帳號與信箱，我們將發送重設密碼的連結給您</p>
    </div>

    <n-form
      ref="forgotFormRef"
      class="mb-4"
      :model="forgotData"
      :rules="rules"
      :disabled="loading"
      :show-require-mark="false"
      @keydown.enter.prevent="sendResetEmail"
    >
      <FormInput v-model="forgotData.account" path="account" placeholder="請輸入帳號" icon="user" />

      <FormInput v-model="forgotData.email" path="email" placeholder="請輸入信箱" icon="email" />

      <n-button
        type="primary"
        block
        :loading="loading"
        :disabled="loading"
        @click="sendResetEmail"
        class="mb-4"
      >
        發送重設連結
      </n-button>
    </n-form>

    <AuthFooterTip
      tip-text="想起密碼了？"
      button-text="返回登入"
      route-to="/login"
      :disabled="loading"
    />
  </AuthLayout>
</template>

<style lang="scss" scoped></style>
