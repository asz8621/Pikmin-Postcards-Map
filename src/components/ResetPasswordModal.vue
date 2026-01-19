<script setup>
import { ref, useTemplateRef, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useInfoStore } from '@/stores/useInfoStore'
import { useModalStore } from '@/stores/useModalStore'
import { useAuthFlow } from '@/composables/useAuthFlow'
import { useApiError } from '@/composables/useApiError'
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
  passwordOld: null,
  password: null,
  passwordConfirm: null,
})

const passwordRules = {
  passwordOld: [{ required: true, message: '請輸入舊密碼', trigger: 'blur' }],
  password: [
    { required: true, message: '請輸入新密碼', trigger: 'blur' },
    { min: 8, message: '密碼長度至少 8 個字符', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (!value) return true
        const hasLetter = /[a-zA-Z]/.test(value)
        const hasNumber = /\d/.test(value)
        return hasLetter && hasNumber
      },
      message: '密碼必須至少包含字母與數字',
      trigger: 'blur',
    },
  ],
  passwordConfirm: [
    {
      required: true,
      message: '請輸入確認新密碼',
      trigger: ['input', 'blur'],
    },
    {
      key: 'passwordConfirm',
      validator: (rule, value) => {
        if (!value) return true
        return value === passwordForm.value.password
      },
      message: '兩次輸入的密碼不一致',
      trigger: ['input', 'blur'],
    },
  ],
}

const handleResetPassword = async () => {
  if (modalLoading.value) return

  try {
    await passwordFormRef.value?.validate()
  } catch {
    return
  }

  const id = userData.value.id

  if (id === 1) {
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

// 驗證確認密碼欄位
const validateConfirmPassword = async () => {
  if (!passwordForm.value.passwordConfirm) return

  await nextTick()
  passwordFormRef.value?.validate(null, (rule) => rule?.key === 'passwordConfirm').catch(() => {})
}

// 監聽新密碼變化，自動驗證確認密碼
watch(() => passwordForm.value.password, validateConfirmPassword)

// 關閉清除資料
watch(
  () => modalStates.value.resetPassword,
  (newVal, oldVal) => {
    if (oldVal && !newVal) {
      Object.assign(passwordForm.value, {
        passwordOld: null,
        password: null,
        passwordConfirm: null,
      })
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
      :rules="passwordRules"
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
      <n-form-item label="確認新密碼" path="passwordConfirm">
        <n-input
          v-model:value="passwordForm.passwordConfirm"
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

<style lang="scss"></style>
