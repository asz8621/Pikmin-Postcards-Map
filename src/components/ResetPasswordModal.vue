<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useInfoStore } from '@/stores/useInfoStore'
import { useModalStore } from '@/stores/useModalStore'
import { useAppMessage } from '@/composables/useAppMessage'
import { useAuthFlow } from '@/composables/useAuthFlow'
import axios from '@/plugins/axios'

const { successMsg, errorMsg } = useAppMessage()
const { signOut } = useAuthFlow()

const modalStore = useModalStore()
const { closeModal } = modalStore
const { modalStates, modalLoading, validateErrorMsg } = storeToRefs(modalStore)

const infoStore = useInfoStore()
const { userData } = storeToRefs(infoStore)

const passwordFormRef = ref(null)
const passwordForm = ref({
  passwordOld: null,
  password: null,
})

const passwordRules = {
  passwordOld: [{ required: true, message: '請輸入舊密碼', trigger: 'blur' }],
  password: [{ required: true, message: '請輸入新密碼', trigger: 'blur' }],
}

const handleResetPassword = async () => {
  if (modalLoading.value) return

  try {
    await passwordFormRef.value?.validate()
  } catch {
    errorMsg(validateErrorMsg.value)
    return
  }

  modalLoading.value = true
  const id = userData.value.id

  try {
    const res = await axios.put(`/user/reset-password/${id}`, passwordForm.value)
    successMsg(res.data.message || '修改成功')
    closeModal('resetPassword')
    signOut()
  } catch (err) {
    const errorMessage = err.response?.data?.message
    if (Array.isArray(errorMessage)) {
      errorMessage.forEach((msg) => errorMsg(msg))
    } else {
      errorMsg(errorMessage || '操作失敗')
    }
  } finally {
    modalLoading.value = false
  }
}

// 關閉清除資料
watch(
  () => modalStates.value.resetPassword,
  (newVal, oldVal) => {
    if (oldVal && !newVal) {
      passwordForm.value.passwordOld = null
      passwordForm.value.password = null
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
          placeholder="請輸入新密碼"
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
