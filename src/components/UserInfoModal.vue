<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useInfoStore } from '@/stores/useInfoStore'
import { useModalStore } from '@/stores/useModalStore'
import { useAppMessage } from '@/composables/useAppMessage'
import axios from '@/plugins/axios'

const { successMsg, errorMsg } = useAppMessage()

const modalStore = useModalStore()
const { closeModal } = modalStore
const { modalStates, modalLoading, validateErrorMsg } = storeToRefs(modalStore)

const infoStore = useInfoStore()
const { setUserData } = infoStore
const { userData } = storeToRefs(infoStore)

const userInfoFormRef = ref(null)
const userInfoForm = ref({
  username: null,
})

const userInfoRules = {
  username: [{ required: true, message: '請輸入暱稱', trigger: 'blur' }],
}

const handleUpdateUserInfo = async () => {
  if (modalLoading.value) return

  const id = userInfoForm.value.id

  if (!id) {
    errorMsg('資料異常，請重新整理後再試')
    return
  }

  try {
    await userInfoFormRef.value?.validate()
  } catch {
    errorMsg(validateErrorMsg.value)
    return
  }

  modalLoading.value = true

  try {
    const res = await axios.put(`/user/update/${id}`, userInfoForm.value)
    const { data } = res.data
    setUserData(data)
    successMsg(res?.message || '修改成功')
    closeModal('userInfo')
  } catch (err) {
    errorMsg(err.response?.data?.message || '修改失敗')
  } finally {
    modalLoading.value = false
  }
}

// 關閉清除資料
watch(
  () => modalStates.value.userInfo,
  (newVal, oldVal) => {
    if (newVal) userInfoForm.value = { ...userData.value }
    if (oldVal) userInfoForm.value.username = null
  },
)
</script>

<template>
  <n-modal
    v-model:show="modalStates.userInfo"
    :mask-closable="false"
    :closable="false"
    preset="card"
    title="修改個人資料"
  >
    <n-form
      ref="userInfoFormRef"
      :model="userInfoForm"
      :rules="userInfoRules"
      show-require-mark
      :disabled="modalLoading"
      @keydown.enter.prevent="handleUpdateUserInfo"
    >
      <n-form-item label="暱稱" path="username">
        <n-input v-model:value="userInfoForm.username" placeholder="請輸入暱稱" />
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button
          type="primary"
          :disabled="modalLoading"
          :loading="modalLoading"
          @click="handleUpdateUserInfo"
        >
          送出
        </n-button>
        <n-button
          type="tertiary"
          secondary
          :disabled="modalLoading"
          @click="closeModal('userInfo')"
        >
          關閉
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style lang="scss"></style>
