<script setup lang="ts">
import { ref, useTemplateRef, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useModalStore } from '@/stores/useModalStore'
import { useInfoStore } from '@/stores/useInfoStore'
import { locationApi } from '@/services'
import { successMsg } from '@/utils/appMessage'
import { useApiError } from '@/composables/useApiError'

const modalStore = useModalStore()
const { closeModal } = modalStore
const { modalData, modalStates, modalLoading } = storeToRefs(modalStore)

const infoStore = useInfoStore()
const { userData, reportTypes } = storeToRefs(infoStore)

const { handleError } = useApiError()

const typeOptions = computed(() => {
  return reportTypes.value
    .filter((item) => item.type === 'postcard')
    .map((item) => ({
      label: item.name,
      value: item.id,
    }))
})
interface FormData {
  reportType: number | null
  description: string
}

const formData = ref<FormData>({
  reportType: null,
  description: '',
})

const formRef = useTemplateRef('formRef')

const rules = {
  reportType: {
    required: true,
    type: 'number',
    message: '請選擇錯誤類型',
    trigger: 'change',
  },
  description: {
    required: true,
    message: '請輸入問題描述',
    trigger: 'blur',
  },
}

// 重置表單
const resetForm = () => {
  formData.value = {
    reportType: null,
    description: '',
  }
}

// 監聽 modal 關閉，重置表單
watch(
  () => modalStates.value.reportError,
  (isOpen) => {
    if (!isOpen) {
      resetForm()
    }
  },
)

// 送出回報
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    modalLoading.value = true

    const payload = {
      description: formData.value.description,
      user_id: userData.value?.id as number,
      location_id: modalData.value?.id as number,
      report_types_id: formData.value.reportType as number,
    }

    await locationApi.reportError(payload)
    successMsg('感謝您的回報，我們會盡快處理！')
    closeModal('reportError')
  } catch (err) {
    handleError(err, '回報失敗，請稍後再試')
  } finally {
    modalLoading.value = false
  }
}
</script>

<template>
  <n-modal
    v-model:show="modalStates.reportError"
    :mask-closable="false"
    :autoFocus="false"
    :close-on-esc="false"
    preset="card"
    title="回報錯誤"
    style="max-width: 500px"
  >
    <n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
      <n-form-item label="錯誤類型" path="reportType">
        <n-select
          v-model:value="formData.reportType"
          :options="typeOptions"
          placeholder="請選擇錯誤類型"
        />
      </n-form-item>

      <n-form-item label="問題描述" path="description">
        <n-input
          v-model:value="formData.description"
          type="textarea"
          placeholder="請詳細描述您發現的問題..."
          :rows="5"
          :maxlength="500"
          show-count
        />
      </n-form-item>
    </n-form>

    <template #footer>
      <div class="flex gap-2">
        <n-button
          type="primary"
          class="flex-1"
          :loading="modalLoading"
          :disabled="modalLoading"
          @click="handleSubmit"
        >
          送出
        </n-button>
        <n-button
          secondary
          class="flex-1"
          :disabled="modalLoading"
          @click="closeModal('reportError')"
        >
          關閉
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<style lang="scss"></style>
