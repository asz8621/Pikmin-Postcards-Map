<script setup lang="ts">
import { ref, watch, useTemplateRef, computed } from 'vue'
import type { UploadCustomRequestOptions } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useInfoStore } from '@/stores/useInfoStore'
import { useModalStore } from '@/stores/useModalStore'
import { useApiError } from '@/composables/useApiError'
import { useFileUpload } from '@/composables/useFileUpload'
import { useCoordinates } from '@/composables/useCoordinates'
import { useLocationForm } from '@/composables/useLocationForm'
import { useLanguage } from '@/composables/useLanguage'
import { successMsg } from '@/utils/appMessage'
import { locationApi } from '@/services'

interface UploadFormData {
  image?: string | null
  imageFile?: File | null
  type: string | null
  coords: string | null
  explore: boolean
  lat?: number
  long?: number
}

const infoStore = useInfoStore()
const { fetchUserData } = infoStore

const modalStore = useModalStore()
const { closeModal } = modalStore
const { modalStates, modalLoading } = storeToRefs(modalStore)

const { handleError } = useApiError()

const { imageFileRules, beforeUpload, buildFormData } = useFileUpload()
const { coordsRules, getCoordinates } = useCoordinates()
const { typeOptions, typeChange, typeRules } = useLocationForm()

const { t } = useLanguage()

const uploadLocationFormRef = useTemplateRef('uploadLocationFormRef')
const locationFormData = ref<UploadFormData>({
  image: null,
  imageFile: null,
  type: null,
  coords: null,
  explore: false,
})

const rules = computed(() => ({
  ...imageFileRules(),
  ...typeRules(t('validation.requiredType')),
  ...coordsRules(),
}))

const fileListClass = computed(() => {
  return locationFormData.value.imageFile ? 'uploaded-image-list has-file' : 'uploaded-image-list'
})

// 清除表單資料
const resetLocationFormData = () => {
  locationFormData.value = {
    image: null,
    imageFile: null,
    type: null,
    coords: null,
    explore: false,
  }
}

// 蘑菇禁止修改隱藏版
const updateType = (type: 'flower' | 'mushroom') => {
  typeChange(locationFormData.value, type)
}

// 暫存圖片到表單資料
const customUpload = ({ file, onFinish }: UploadCustomRequestOptions) => {
  locationFormData.value.imageFile = file.file as File
  uploadLocationFormRef.value
    ?.validate(null, (rule: { key?: string }) => rule?.key === 'imageFile')
    .catch(() => {})
  onFinish()
}

// 移除上傳檔案
const handleRemove = () => {
  locationFormData.value.imageFile = null
  uploadLocationFormRef.value
    ?.validate(null, (rule: { key?: string }) => rule?.key === 'imageFile')
    .catch(() => {})
}

const handleUploadLocation = async () => {
  if (modalLoading.value) return

  try {
    await uploadLocationFormRef.value?.validate()
  } catch {
    return
  }

  const { lat, long } = getCoordinates(locationFormData.value.coords || '')
  locationFormData.value.lat = lat
  locationFormData.value.long = long

  const apiData: Record<string, unknown> = { ...locationFormData.value }
  delete apiData.coords

  const formData = await buildFormData(apiData)

  modalLoading.value = true

  try {
    await locationApi.createLocation(formData as FormData, 30000)
    successMsg(t('message.upload'))
    closeModal('uploadLocation')
    await fetchUserData()
  } catch (err) {
    handleError(err, t('message.uploadFailed'))
  } finally {
    modalLoading.value = false
  }
}

// 關閉清除資料
watch(
  () => modalStates.value.uploadLocation,
  (newVal, oldVal) => {
    if (oldVal && !newVal) {
      resetLocationFormData()
    }
  },
)
</script>

<template>
  <n-modal
    v-model:show="modalStates.uploadLocation"
    :mask-closable="false"
    :closable="false"
    :show-icon="false"
    preset="dialog"
    :title="t('modal.uploadLocation')"
  >
    <n-form
      ref="uploadLocationFormRef"
      :model="locationFormData"
      :rules="rules"
      :disabled="modalLoading"
      show-require-mark
      @keydown.enter.prevent="handleUploadLocation"
    >
      <n-form-item path="imageFile">
        <template #label>
          <span>{{ t('common.uploadImage') }}</span>
          <n-popover placement="bottom" trigger="click">
            <template #trigger>
              <span class="text-xs cursor-pointer text-indigo-500 ml-1">
                {{ t('common.example') }}
              </span>
            </template>
            <div>
              <p class="mb-2">{{ t('modal.uploadLocationExample') }}</p>
              <img
                src="@/assets/images/upload_example.png"
                alt="upload example"
                class="max-h-[200px] sm:max-h-[400px]"
              />
            </div>
          </n-popover>
        </template>
        <n-upload
          accept=".png,.jpg"
          list-type="image"
          :max="1"
          :file-list-class="fileListClass"
          :custom-request="customUpload"
          :on-before-upload="beforeUpload"
          :on-remove="handleRemove"
        >
          <n-button>{{ t('common.uploadImage') }}</n-button>
        </n-upload>
      </n-form-item>

      <n-form-item :label="t('common.type')" path="type">
        <n-select
          v-model:value="locationFormData.type"
          :options="typeOptions"
          :placeholder="t('validation.requiredType')"
          @update:value="updateType"
        />
      </n-form-item>

      <n-form-item :label="t('common.coords')" path="coords">
        <n-input
          v-model:value="locationFormData.coords"
          :placeholder="t('validation.requiredCoords')"
        />
      </n-form-item>

      <n-form-item :label="t('common.explore')" path="explore">
        <n-switch
          v-model:value="locationFormData.explore"
          :disabled="locationFormData.type === 'mushroom'"
        >
          <template #checked> {{ t('common.yes') }} </template>
          <template #unchecked> {{ t('common.no') }} </template>
        </n-switch>
      </n-form-item>

      <n-space justify="end">
        <n-button
          type="primary"
          :disabled="modalLoading"
          :loading="modalLoading"
          @click="handleUploadLocation"
        >
          {{ t('common.submit') }}
        </n-button>
        <n-button
          type="tertiary"
          secondary
          :disabled="modalLoading"
          @click="closeModal('uploadLocation')"
        >
          {{ t('common.close') }}
        </n-button>
      </n-space>
    </n-form>
  </n-modal>
</template>

<style lang="scss">
.uploaded-image-list {
  display: flex;
  height: 0px;
  &.has-file {
    height: 80px;
  }
  .n-upload-file {
    width: 100%;
  }
}
</style>
