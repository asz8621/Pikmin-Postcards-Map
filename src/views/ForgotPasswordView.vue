<script setup lang="ts">
import { ref, useTemplateRef, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/services'
import AuthLayout from '@/components/AuthLayout.vue'
import FormInput from '@/components/FormInput.vue'
import AuthFooterTip from '@/components/AuthFooterTip.vue'
import { useApiError } from '@/composables/useApiError'
import { useLanguage } from '@/composables/useLanguage'
import { successMsg } from '@/utils/appMessage'

const router = useRouter()

const { handleError } = useApiError()

const { t } = useLanguage()

const forgotData = ref({
  account: '',
  email: '',
})

const loading = ref(false)
const forgotFormRef = useTemplateRef('forgotFormRef')

const rules = computed(() => ({
  account: [
    { required: true, message: t('validation.requiredAccount'), trigger: 'blur' },
    { min: 6, max: 20, message: t('validation.accountLength'), trigger: ['blur', 'input'] },
  ],
  email: [
    { required: true, message: t('validation.requiredEmail'), trigger: 'blur' },
    { type: 'email', message: t('validation.invalidEmail'), trigger: ['blur', 'input'] },
  ],
}))

const sendResetEmail = async () => {
  try {
    await forgotFormRef.value?.validate()

    loading.value = true

    const res = await authApi.forgotPassword({
      account: forgotData.value.account,
      email: forgotData.value.email,
    })

    successMsg(t('message.passwordResetEmailSent'))

    router.push('/login')
  } catch (err) {
    handleError(err, t('message.passwordResetEmailFailed'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <div class="text-center mb-6">
      <h2 class="text-xl font-semibold text-gray-700 mb-2">{{ t('auth.forgotPassword') }}</h2>
      <p class="text-sm text-gray-500">{{ t('auth.forgotPasswordDescription') }}</p>
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
      <FormInput
        v-model="forgotData.account"
        path="account"
        :placeholder="t('validation.requiredAccount')"
        icon="user"
      />

      <FormInput
        v-model="forgotData.email"
        path="email"
        :placeholder="t('validation.requiredEmail')"
        icon="email"
      />

      <n-button
        type="primary"
        block
        :loading="loading"
        :disabled="loading"
        @click="sendResetEmail"
        class="mb-4"
      >
        {{ t('auth.sendResetLink') }}
      </n-button>
    </n-form>

    <AuthFooterTip
      :tip-text="t('auth.rememberPassword')"
      :button-text="t('auth.backToLogin')"
      route-to="/login"
      :disabled="loading"
    />
  </AuthLayout>
</template>

<style lang="scss" scoped></style>
