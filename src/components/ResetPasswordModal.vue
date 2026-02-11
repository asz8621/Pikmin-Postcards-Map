<script setup lang="ts">
import { ref, useTemplateRef, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useInfoStore } from '@/stores/useInfoStore'
import { useModalStore } from '@/stores/useModalStore'
import { useAuthFlow } from '@/composables/useAuthFlow'
import { useApiError } from '@/composables/useApiError'
import { useValidationRules } from '@/composables/useValidationRules'
import { useLanguage } from '@/composables/useLanguage'
import { successMsg, errorMsg } from '@/utils/appMessage'
import { userApi } from '@/services'

const { signOut } = useAuthFlow()

const { t } = useLanguage()

const { handleError } = useApiError()

const modalStore = useModalStore()
const { closeModal } = modalStore
const { modalStates, modalLoading } = storeToRefs(modalStore)

const infoStore = useInfoStore()
const { userData } = storeToRefs(infoStore)

const passwordFormRef = useTemplateRef('passwordFormRef')
const passwordForm = ref({
  passwordOld: '',
  password: '',
  confirmPassword: '',
})

const { getRules, passwordWatch, localeWatch } = useValidationRules(passwordFormRef, passwordForm)
const rules = computed(() =>
  getRules({
    passwordOld: [
      { type: 'required', message: t('validation.requiredOldPassword') },
      { type: 'passwordRegex', message: t('validation.oldPasswordLength') },
    ],
    password: [
      { type: 'required', message: t('validation.requiredNewPassword') },
      { type: 'passwordRegex', message: t('validation.newPasswordLength') },
    ],
    confirmPassword: ['passwordMatch'],
  }),
)
passwordWatch()
localeWatch()

const handleResetPassword = async () => {
  if (modalLoading.value) return

  try {
    await passwordFormRef.value?.validate()
  } catch {
    return
  }

  const id = userData.value?.id

  if (!id) {
    errorMsg(t('message.dataError'))
    return
  }

  if (Number(id) === 1) {
    errorMsg(t('message.demoAccount'))
    return
  }

  modalLoading.value = true

  try {
    const requestData = {
      passwordOld: passwordForm.value.passwordOld,
      password: passwordForm.value.password,
    }
    await userApi.resetPassword(id, requestData)
    successMsg(t('message.passwordChangeSuccess'))
    closeModal('resetPassword')
    signOut()
  } catch (err) {
    handleError(err, t('message.modifyFailed'))
  } finally {
    modalLoading.value = false
  }
}

// 關閉清除資料
watch(
  () => modalStates.value.resetPassword,
  (newVal, oldVal) => {
    if (oldVal && !newVal) {
      passwordForm.value = {
        passwordOld: '',
        password: '',
        confirmPassword: '',
      }
      passwordFormRef.value?.restoreValidation()
    }
  },
)
</script>

<template>
  <n-modal
    v-model:show="modalStates.resetPassword"
    :mask-closable="false"
    :closable="false"
    preset="card"
    :title="t('modal.changePassword')"
  >
    <n-form
      ref="passwordFormRef"
      :model="passwordForm"
      :rules="rules"
      :show-require-mark="false"
      :disabled="modalLoading"
      @keydown.enter.prevent="handleResetPassword"
    >
      <n-form-item :label="t('common.oldPassword')" path="passwordOld">
        <n-input
          v-model:value="passwordForm.passwordOld"
          type="password"
          :placeholder="t('validation.requiredOldPassword')"
          show-password-on="click"
        />
      </n-form-item>
      <n-form-item :label="t('common.newPassword')" path="password">
        <n-input
          v-model:value="passwordForm.password"
          type="password"
          :placeholder="t('validation.requiredNewPassword')"
          show-password-on="click"
        />
      </n-form-item>
      <n-form-item :label="t('common.confirmNewPassword')" path="confirmPassword">
        <n-input
          v-model:value="passwordForm.confirmPassword"
          type="password"
          :placeholder="t('validation.requiredConfirmNewPassword')"
          show-password-on="click"
        />
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button
          type="primary"
          :disabled="modalLoading"
          :loading="modalLoading"
          @click="handleResetPassword"
        >
          {{ t('common.submit') }}
        </n-button>
        <n-button
          type="tertiary"
          secondary
          :disabled="modalLoading"
          @click="closeModal('resetPassword')"
        >
          {{ t('common.close') }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style lang="scss" scoped></style>
