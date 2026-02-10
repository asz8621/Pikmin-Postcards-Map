<script setup lang="ts">
import { ref, useTemplateRef, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/services'
import AuthFooterTip from '@/components/AuthFooterTip.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import FormInput from '@/components/FormInput.vue'
import { useApiError } from '@/composables/useApiError'
import { useSocketEvents } from '@/composables/useSocketEvents'
import { useLanguage } from '@/composables/useLanguage'
import { successMsg } from '@/utils/appMessage'

const router = useRouter()

const { handleError } = useApiError()

const { joinRoom } = useSocketEvents()

const { t } = useLanguage()

const registerData = ref({
  username: '',
  account: '',
  password: '',
  email: '',
  confirmPassword: '',
})

const loading = ref(false)

const registerFormRef = useTemplateRef('registerFormRef')

const validatePasswordSame = (_rule: unknown, value: string) => {
  return value === registerData.value.password
}

const rules = computed(() => ({
  username: [{ required: true, message: t('validation.requiredName'), trigger: 'blur' }],
  account: [
    { required: true, message: t('validation.requiredAccount'), trigger: 'blur' },
    { min: 6, max: 20, message: t('validation.accountLength'), trigger: 'blur' },
  ],
  email: [
    { required: true, message: t('validation.requiredEmail'), trigger: 'blur' },
    { type: 'email', message: t('validation.invalidEmail'), trigger: ['blur', 'input'] },
  ],
  password: [
    { required: true, message: t('validation.requiredPassword'), trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
      message: t('validation.passwordLength'),
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    {
      required: true,
      message: t('validation.requiredConfirmPassword'),
      trigger: ['input', 'blur'],
    },
    {
      key: 'confirmPassword',
      validator: validatePasswordSame,
      message: t('validation.passwordMismatch'),
      trigger: ['input', 'blur'],
    },
  ],
}))

const register = async () => {
  try {
    await registerFormRef.value?.validate()

    loading.value = true

    await authApi.userRegister({
      username: registerData.value.username,
      account: registerData.value.account,
      password: registerData.value.password,
      email: registerData.value.email,
    })

    successMsg(t('message.register'))
    router.push('/login')
  } catch (err) {
    handleError(err, t('message.registerFailed'))
  } finally {
    loading.value = false
  }
}

const handlePasswordInput = async () => {
  if (registerData.value.confirmPassword) {
    try {
      await registerFormRef.value?.validate(
        () => {},
        (rules: { key?: string }) => {
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
      <FormInput
        v-model="registerData.username"
        path="username"
        :placeholder="t('validation.requiredName')"
        icon="id-card"
      />

      <FormInput
        v-model="registerData.email"
        path="email"
        :placeholder="t('validation.requiredEmail')"
        icon="email"
      />

      <FormInput
        v-model="registerData.account"
        path="account"
        :placeholder="t('validation.requiredAccount')"
        icon="user"
      />

      <FormInput
        v-model="registerData.password"
        path="password"
        type="password"
        :placeholder="t('validation.requiredPassword')"
        icon="key"
        show-password-on="click"
        @input="handlePasswordInput"
      />

      <FormInput
        v-model="registerData.confirmPassword"
        path="confirmPassword"
        type="password"
        :placeholder="t('validation.requiredConfirmPassword')"
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
        {{ t('auth.register') }}
      </n-button>
    </n-form>

    <AuthFooterTip
      :tip-text="t('auth.alreadyHaveAccount')"
      :button-text="t('auth.loginNow')"
      route-to="/login"
      :disabled="loading"
    />
  </AuthLayout>
</template>

<style lang="scss" scoped></style>
