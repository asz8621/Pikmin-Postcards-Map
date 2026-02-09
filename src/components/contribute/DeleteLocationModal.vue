<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useModalStore } from '@/stores/useModalStore'
import { useInfoStore } from '@/stores/useInfoStore'
import { useLanguage } from '@/composables/useLanguage'
import { useApiError } from '@/composables/useApiError'
import { successMsg, errorMsg } from '@/utils/appMessage'
import { locationApi } from '@/services'

const modalStore = useModalStore()
const { closeModal } = modalStore
const { modalStates, modalData, modalLoading } = storeToRefs(modalStore)

const infoStore = useInfoStore()
const { fetchUserData } = infoStore

const { t } = useLanguage()

const { handleError } = useApiError()

const handleDeleteLocation = async () => {
  if (modalLoading.value) return

  if (!modalData.value.id) {
    errorMsg(t('message.dataError'))
    return
  }

  if (modalData.value.id === 1) {
    errorMsg(t('message.demoDataDeleteFailed'))
    return
  }

  modalLoading.value = true

  try {
    const res = await locationApi.deleteLocation(modalData.value.id)
    await fetchUserData()
    successMsg(t('message.delete'))
    closeModal('deleteLocation')
  } catch (err) {
    handleError(err, t('message.deleteFailed'))
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
    :title="t('modal.deleteLocation')"
  >
    <p>
      <span>{{ t('message.confirmDeleteLocationTip') }}</span>
      <br />
      <n-text type="error">{{ t('message.irreversibleOperationTip') }}</n-text>
    </p>

    <template #footer>
      <n-space justify="end">
        <n-button
          type="error"
          :disabled="modalLoading"
          :loading="modalLoading"
          @click="handleDeleteLocation"
        >
          {{ t('common.confirmDelete') }}
        </n-button>
        <n-button @click="closeModal('deleteLocation')" :disabled="modalLoading">
          {{ t('common.cancel') }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style lang="scss"></style>
