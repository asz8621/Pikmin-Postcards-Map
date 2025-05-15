<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useInfoStore } from '@/stores/info'
import { useModalStore } from '@/stores/modal'
import { useAppMessage } from '@/composables/useAppMessage'

const emit = defineEmits(['handleResetPassword'])

const { errorMsg } = useAppMessage()

const modalStore = useModalStore()
const { closeModal } = modalStore
const { modalStates, modalLoading } = storeToRefs(modalStore)

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
  try {
    if (modalLoading.value) return
    await passwordFormRef.value?.validate()
    modalLoading.value = true
    const id = userData.value.id
    emit('handleResetPassword', id, passwordForm.value)
  } catch {
    errorMsg('驗證失敗')
  }
}

// 關閉清除資料
watch(
  () => modalStates.value.resetPassword,
  (newVal, oldVal) => {
    if (oldVal === true && newVal === false) {
      passwordForm.value.passwordOld = null
      passwordForm.value.password = null
    }
  },
)
</script>

<template>
  <n-modal
    v-model:show="modalStates.resetPassword"
    preset="card"
    :mask-closable="false"
    :closable="false"
    class="modal"
    title="修改密碼"
  >
    <n-form
      ref="passwordFormRef"
      :model="passwordForm"
      :rules="passwordRules"
      :show-require-mark="false"
      :disabled="modalLoading"
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
        <n-button type="primary" @click="handleResetPassword" :disabled="modalLoading">
          送出
        </n-button>
        <n-button
          type="tertiary"
          secondary
          @click="closeModal('resetPassword')"
          :disabled="modalLoading"
        >
          關閉
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style lang="scss">
.modal {
  width: 500px;
  @media screen and (max-width: 576px) {
    width: 100%;
    margin: 1rem;
  }
}
</style>
