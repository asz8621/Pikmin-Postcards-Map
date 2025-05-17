<script setup>
import { storeToRefs } from 'pinia'
import { useAppMessage } from '@/composables/useAppMessage'
import { useModalStore } from '@/stores/modal'
import { useInfoStore } from '@/stores/info'
import axios from '@/plugins/axios'

const { successMsg, errorMsg } = useAppMessage()

const modalStore = useModalStore()
const { closeModal } = modalStore
const { modalStates, modalData, modalLoading } = storeToRefs(modalStore)

const infoStore = useInfoStore()
const { fetchUserData } = infoStore

const handleDeleteLocation = async () => {
  if (modalLoading.value) return

  if (!modalData.value.id) {
    errorMsg('資料異常，請重新整理後再試')
    return
  }

  try {
    const dd = { id: 99, text: 'test' }
    const res = await axios.delete(`/user/locations/${modalData.value.id}`, dd)
    await fetchUserData()
    successMsg(res?.message || '刪除成功')
    closeModal('deleteLocation')
  } catch (err) {
    errorMsg(err.response?.data?.message || '刪除失敗')
  } finally {
    modalLoading.value = false
  }
}
</script>

<template>
  <n-modal
    v-model:show="modalStates.deleteLocation"
    title="刪除點位"
    preset="card"
    :mask-closable="false"
    :closable="false"
    class="modal"
  >
    <p>
      <span>你確定要刪除此點位資料嗎？</span>
      <br />
      <n-text type="error">此操作無法復原，請謹慎操作。</n-text>
    </p>

    <template #footer>
      <n-space justify="end">
        <n-button type="error" :loading="modalLoading" @click="handleDeleteLocation">
          確定刪除
        </n-button>
        <n-button @click="closeModal('deleteLocation')" :disabled="modalLoading"> 取消 </n-button>
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
