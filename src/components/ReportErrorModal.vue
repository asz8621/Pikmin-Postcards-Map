<script setup lang="ts">
import { ref, useTemplateRef, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useModalStore } from '@/stores/useModalStore'
import { useInfoStore } from '@/stores/useInfoStore'
import { locationApi } from '@/services'
import { successMsg } from '@/utils/appMessage'
import { useLanguage } from '@/composables/useLanguage'
import { useValidationRules } from '@/composables/useValidationRules'
import { useApiError } from '@/composables/useApiError'

const modalStore = useModalStore()
const { closeModal } = modalStore
const { modalData, modalStates, modalLoading } = storeToRefs(modalStore)

const infoStore = useInfoStore()
const { userData, reportTypes } = storeToRefs(infoStore)

const { t } = useLanguage()

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

const { getRules } = useValidationRules()
const rules = computed(() =>
  getRules({
    reportType: ['reportType'],
    description: [{ type: 'required', message: t('validation.requiredDescription') }],
  }),
)

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
    successMsg(t('message.reportErrorSuccess'))
    closeModal('reportError')
  } catch (err) {
    handleError(err, t('message.reportErrorFailed'))
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
    :title="t('modal.reportError')"
    style="max-width: 500px"
  >
    <n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
      <n-form-item :label="t('common.errorType')" path="reportType">
        <n-select
          v-model:value="formData.reportType"
          :options="typeOptions"
          :placeholder="t('validation.requiredErrorType')"
        />
      </n-form-item>

      <n-form-item :label="t('common.description')" path="description">
        <n-input
          v-model:value="formData.description"
          type="textarea"
          :placeholder="t('validation.detailedDescription')"
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
          {{ t('common.submit') }}
        </n-button>
        <n-button
          secondary
          class="flex-1"
          :disabled="modalLoading"
          @click="closeModal('reportError')"
        >
          {{ t('common.close') }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<style lang="scss"></style>
