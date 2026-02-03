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

const uploadLocationFormRef = useTemplateRef('uploadLocationFormRef')
const locationFormData = ref<UploadFormData>({
  image: null,
  imageFile: null,
  type: null,
  coords: null,
  explore: false,
})

const rules = {
  ...imageFileRules(),
  ...typeRules(),
  ...coordsRules(),
}

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
    const res = await locationApi.createLocation(formData as FormData, 30000)
    successMsg(res.data.message || '上傳成功')
    closeModal('uploadLocation')
    await fetchUserData()
  } catch (err) {
    handleError(err, '上傳失敗，請稍後再試')
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
    title="上傳點位"
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
          <span>上傳圖片</span>
          <n-popover placement="bottom" trigger="click">
            <template #trigger>
              <span class="text-xs cursor-pointer text-indigo-500 ml-1"> 範例 </span>
            </template>
            <div>
              <p class="mb-2">直接手機截圖即可，如下圖：</p>
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
          <n-button>上傳圖片</n-button>
        </n-upload>
      </n-form-item>

      <n-form-item label="類型" path="type">
        <n-select
          v-model:value="locationFormData.type"
          :options="typeOptions"
          placeholder="請選擇類型"
          @update:value="updateType"
        />
      </n-form-item>

      <n-form-item label="座標" path="coords">
        <n-input v-model:value="locationFormData.coords" placeholder="輸入座標" />
      </n-form-item>

      <n-form-item label="隱藏版" path="explore">
        <n-switch
          v-model:value="locationFormData.explore"
          :disabled="locationFormData.type === 'mushroom'"
        >
          <template #checked> 是 </template>
          <template #unchecked> 否 </template>
        </n-switch>
      </n-form-item>

      <n-space justify="end">
        <n-button
          type="primary"
          :disabled="modalLoading"
          :loading="modalLoading"
          @click="handleUploadLocation"
        >
          送出
        </n-button>
        <n-button
          type="tertiary"
          secondary
          :disabled="modalLoading"
          @click="closeModal('uploadLocation')"
        >
          關閉
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
