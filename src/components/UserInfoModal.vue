<script setup lang="ts">
import { ref, watch, useTemplateRef, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useInfoStore } from '@/stores/useInfoStore'
import { useModalStore } from '@/stores/useModalStore'
import { useLanguage } from '@/composables/useLanguage'
import { useApiError } from '@/composables/useApiError'
import { successMsg, errorMsg } from '@/utils/appMessage'
import { userApi } from '@/services'

const modalStore = useModalStore()
const { closeModal } = modalStore
const { modalStates, modalLoading } = storeToRefs(modalStore)

const infoStore = useInfoStore()
const { setUserData } = infoStore
const { userData } = storeToRefs(infoStore)

const { t } = useLanguage()

const { handleError } = useApiError()

interface UserInfoForm {
  id?: number
  username?: string
  email?: string
}

const userInfoFormRef = useTemplateRef('userInfoFormRef')
const userInfoForm = ref<UserInfoForm>({
  id: undefined,
  username: undefined,
  email: undefined,
})

const clearFormData = () => {
  Object.keys(userInfoForm.value).forEach((key) => {
    userInfoForm.value[key as keyof UserInfoForm] = undefined
  })
}

const userInfoRules = computed(() => ({
  username: [{ required: true, message: t('validation.requiredName'), trigger: 'blur' }],
  email: [
    { required: true, message: t('validation.requiredEmail'), trigger: 'blur' },
    { type: 'email', message: t('validation.invalidEmail'), trigger: ['blur', 'input'] },
  ],
}))

const handleUpdateUserInfo = async () => {
  if (modalLoading.value) return

  try {
    await userInfoFormRef.value?.validate()
  } catch {
    return
  }

  const id = userInfoForm.value.id

  if (!id) {
    errorMsg(t('message.dataError'))
    return
  }

  if (id === 1) {
    errorMsg(t('message.demoAccount'))
    return
  }

  modalLoading.value = true

  try {
    const res = await userApi.updateUserInfo(id, userInfoForm.value)
    const { data } = res.data
    setUserData(data)

    successMsg(t('message.modify'))
    closeModal('userInfo')
  } catch (err) {
    handleError(err, t('message.modifyFailed'))
  } finally {
    modalLoading.value = false
  }
}

// 關閉清除資料
watch(
  () => modalStates.value.userInfo,
  (newVal, oldVal) => {
    if (newVal && userData.value) {
      userInfoForm.value = {
        id: userData.value.id,
        username: userData.value.username,
        email: userData.value.email,
      }
    }
    if (oldVal) clearFormData()
  },
)
</script>

<template>
  <n-modal
    v-model:show="modalStates.userInfo"
    :mask-closable="false"
    :closable="false"
    preset="card"
    :title="t('modal.updateUserInfo')"
  >
    <n-form
      ref="userInfoFormRef"
      :model="userInfoForm"
      :rules="userInfoRules"
      show-require-mark
      :disabled="modalLoading"
      @keydown.enter.prevent="handleUpdateUserInfo"
    >
      <n-form-item :label="t('common.nickname')" path="username">
        <n-input
          v-model:value="userInfoForm.username"
          :placeholder="t('validation.requiredName')"
        />
      </n-form-item>
      <n-form-item :label="t('common.email')" path="email">
        <n-input v-model:value="userInfoForm.email" :placeholder="t('validation.requiredEmail')" />
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
          {{ t('common.submit') }}
        </n-button>
        <n-button
          type="tertiary"
          secondary
          :disabled="modalLoading"
          @click="closeModal('userInfo')"
        >
          {{ t('common.close') }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style lang="scss"></style>
