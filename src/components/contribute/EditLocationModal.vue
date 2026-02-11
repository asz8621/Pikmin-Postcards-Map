<script setup lang="ts">
import { ref, useTemplateRef, computed, watch } from 'vue'
import type { UploadCustomRequestOptions } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useInfoStore } from '@/stores/useInfoStore'
import { useModalStore } from '@/stores/useModalStore'
import { useApiError } from '@/composables/useApiError'
import { successMsg, errorMsg } from '@/utils/appMessage'
import { useValidationRules } from '@/composables/useValidationRules'
import { useFileUpload } from '@/composables/useFileUpload'
import { useLocationForm } from '@/composables/useLocationForm'
import { useLanguage } from '@/composables/useLanguage'
import { locationApi } from '@/services'
import { getCoordinates } from '@/utils/map'

interface LocationFormData {
  id?: number
  explore: boolean
  image?: string
  imageFile?: File | null
  type: string
  lat?: number
  long?: number
  coords: string
  image_status?: string
}

const modalStore = useModalStore()
const { closeModal } = modalStore
const { modalStates, modalData, modalLoading } = storeToRefs(modalStore)

const infoStore = useInfoStore()
const { fetchUserData } = infoStore

const { handleError } = useApiError()

const { beforeUpload, buildFormData } = useFileUpload()
const { typeOptions, typeChange } = useLocationForm()
const { t } = useLanguage()

const editLocationRef = useTemplateRef('editLocationRef')
const locationFormData = ref<LocationFormData>({
  explore: false,
  type: '',
  coords: '',
  imageFile: null,
})

const { getRules } = useValidationRules(editLocationRef, locationFormData)
const rules = computed(() =>
  getRules({
    type: [{ type: 'required', message: t('validation.requiredType') }],
    coords: ['coords'],
    imageFile: ['imgUpload'],
  }),
)

const submitText = computed(() => {
  return locationFormData.value.image_status === 'rejected'
    ? t('common.resubmit')
    : t('common.submit')
})

// 暫存圖片到表單資料
const customUpload = ({ file, onFinish }: UploadCustomRequestOptions) => {
  locationFormData.value.imageFile = file.file as File
  onFinish()
}

// 移除上傳檔案
const handleRemove = () => {
  locationFormData.value.imageFile = null
}

// 蘑菇禁止修改隱藏版
const updateType = (type: 'flower' | 'mushroom') => {
  typeChange(locationFormData.value, type)
}

const handleEditLocation = async () => {
  if (modalLoading.value) return

  try {
    await editLocationRef.value?.validate()
  } catch {
    return
  }

  const { lat, long } = getCoordinates(locationFormData.value.coords)
  locationFormData.value.lat = lat
  locationFormData.value.long = long

  const apiData: Record<string, unknown> = { ...locationFormData.value }
  delete apiData.coords

  if (!apiData.imageFile) delete apiData.imageFile

  const formData = await buildFormData(apiData)

  if (apiData.id === 1) {
    errorMsg(t('message.demoDataUpdateFailed'))
    return
  }

  modalLoading.value = true

  try {
    await locationApi.updateLocation(locationFormData.value.id as number, formData)
    await fetchUserData()
    successMsg(t('message.update'))
    closeModal('editLocation')
  } catch (err) {
    handleError(err, t('message.updateFailed'))
  } finally {
    modalLoading.value = false
  }
}

// 關閉清除資料
watch(
  () => modalStates.value.editLocation,
  (newVal, oldVal) => {
    if (newVal) {
      const { id, explore, image, lat, long, type, image_status } = modalData.value
      locationFormData.value = {
        id,
        explore,
        image,
        imageFile: null,
        type,
        lat,
        long,
        coords: `${lat}, ${long}`,
        image_status,
      }
    }
    if (oldVal && !newVal) {
      locationFormData.value = {
        explore: false,
        type: '',
        coords: '',
        imageFile: null,
      }
    }
  },
)
</script>

<template>
  <n-modal
    v-model:show="modalStates.editLocation"
    :mask-closable="false"
    :closable="false"
    :show-icon="false"
    preset="dialog"
    :title="t('modal.editLocation')"
  >
    <n-form
      ref="editLocationRef"
      :model="locationFormData"
      :rules="rules"
      :disabled="modalLoading"
      show-require-mark
      @keydown.enter.prevent="handleEditLocation"
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
          <img :src="locationFormData.image" alt="" class="max-h-[300px] mt-2" />
        </template>
        <n-upload
          accept=".png,.jpg"
          list-type="image"
          :max="1"
          :custom-request="customUpload"
          :on-before-upload="beforeUpload"
          :on-remove="handleRemove"
        >
          <n-button>{{ t('common.reuploadImage') }}</n-button>
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
          @click="handleEditLocation"
        >
          {{ submitText }}
        </n-button>
        <n-button
          type="tertiary"
          secondary
          :disabled="modalLoading"
          @click="closeModal('editLocation')"
        >
          {{ t('common.cancel') }}
        </n-button>
      </n-space>
    </n-form>
  </n-modal>
</template>

<style lang="scss"></style>
