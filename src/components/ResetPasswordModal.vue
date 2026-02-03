<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useInfoStore } from '@/stores/useInfoStore'
import { useModalStore } from '@/stores/useModalStore'
import { useAuthFlow } from '@/composables/useAuthFlow'
import { useApiError } from '@/composables/useApiError'
import { usePasswordValidation } from '@/composables/usePasswordValidation'
import { successMsg, errorMsg } from '@/utils/appMessage'
import { userApi } from '@/services'

const { signOut } = useAuthFlow()
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

const { oldPasswordRules, passwordRules, confirmPasswordRules, passwordWatch } =
  usePasswordValidation(passwordFormRef)

const formRules = {
  ...oldPasswordRules(),
  ...passwordRules(),
  ...confirmPasswordRules(passwordForm.value),
}

const handleResetPassword = async () => {
  if (modalLoading.value) return

  try {
    await passwordFormRef.value?.validate()
  } catch {
    return
  }

  const id = userData.value?.id

  if (!id) {
    errorMsg('資料異常，請重新整理後再試')
    return
  }

  if (Number(id) === 1) {
    errorMsg('Demo 帳號不能修改密碼')
    return
  }

  modalLoading.value = true

  try {
    const requestData = {
      passwordOld: passwordForm.value.passwordOld,
      password: passwordForm.value.password,
    }
    const res = await userApi.resetPassword(id, requestData)
    successMsg(res.data.message || '密碼修改成功，請重新登入')
    closeModal('resetPassword')
    signOut()
  } catch (err) {
    handleError(err, '修改失敗，請稍後再試')
  } finally {
    modalLoading.value = false
  }
}

passwordWatch(passwordForm.value)

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
    title="修改密碼"
  >
    <n-form
      ref="passwordFormRef"
      :model="passwordForm"
      :rules="formRules"
      :show-require-mark="false"
      :disabled="modalLoading"
      @keydown.enter.prevent="handleResetPassword"
    >
      <n-form-item label="舊密碼" path="passwordOld">
        <n-input
          v-model:value="passwordForm.passwordOld"
          type="password"
          placeholder="請輸入舊密碼"
          show-password-on="click"
        />
      </n-form-item>
      <n-form-item label="新密碼" path="password">
        <n-input
          v-model:value="passwordForm.password"
          type="password"
          placeholder="請輸入新密碼 (至少8位，包含字母和數字)"
          show-password-on="click"
        />
      </n-form-item>
      <n-form-item label="確認新密碼" path="confirmPassword">
        <n-input
          v-model:value="passwordForm.confirmPassword"
          type="password"
          placeholder="請再次輸入新密碼"
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
          送出
        </n-button>
        <n-button
          type="tertiary"
          secondary
          :disabled="modalLoading"
          @click="closeModal('resetPassword')"
        >
          關閉
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style lang="scss" scoped></style>
