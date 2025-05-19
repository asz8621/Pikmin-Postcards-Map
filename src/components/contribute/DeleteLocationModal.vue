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

  modalLoading.value = true

  try {
    const res = await axios.delete(`/user/locations/${modalData.value.id}`)
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
    :mask-closable="false"
    :closable="false"
    preset="card"
    title="刪除點位"
  >
    <p>
      <span>你確定要刪除此點位資料嗎？</span>
      <br />
      <n-text type="error">此操作無法復原，請謹慎操作。</n-text>
    </p>

    <template #footer>
      <n-space justify="end">
        <n-button
          type="error"
          :disabled="modalLoading"
          :loading="modalLoading"
          @click="handleDeleteLocation"
        >
          確定刪除
        </n-button>
        <n-button @click="closeModal('deleteLocation')" :disabled="modalLoading"> 取消 </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style lang="scss"></style>
