<script setup>
import { ref, useTemplateRef, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useInfoStore } from '@/stores/useInfoStore'
import { useModalStore } from '@/stores/useModalStore'
import { useApiError } from '@/composables/useApiError'
import { successMsg, errorMsg } from '@/utils/appMessage'
import { useFileUpload } from '@/composables/useFileUpload'
import { useCoordinates } from '@/composables/useCoordinates'
import { useLocationForm } from '@/composables/useLocationForm'
import { locationApi } from '@/services'

const modalStore = useModalStore()
const { closeModal } = modalStore
const { modalStates, modalData, modalLoading } = storeToRefs(modalStore)

const infoStore = useInfoStore()
const { fetchUserData } = infoStore

const { handleError } = useApiError()

const { imageFileRules, beforeUpload, buildFormData } = useFileUpload()
const { coordsRules, getCoordinates } = useCoordinates()
const { typeOptions, typeChange, typeRules } = useLocationForm()

const editLocationRef = useTemplateRef('editLocationRef')
const locationFormData = ref({})

const rules = {
  ...imageFileRules(),
  ...typeRules(),
  ...coordsRules(),
}

const submitText = computed(() => {
  return locationFormData.value.image_status === 'rejected' ? '重新送審' : '送出'
})

// 暫存圖片到表單資料
const customUpload = ({ file, onFinish }) => {
  locationFormData.value.imageFile = file.file
  onFinish()
}

// 移除上傳檔案
const handleRemove = () => {
  locationFormData.value.imageFile = null
}

// 蘑菇禁止修改隱藏版
const updateType = (type) => {
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

  const apiData = { ...locationFormData.value }
  delete apiData.coords

  if (!apiData.imageFile) delete apiData.imageFile

  const formData = await buildFormData(apiData)

  if (apiData.id === 1) {
    errorMsg('Demo 資料無法更新，請自行新增資料後再操作')
    return
  }

  modalLoading.value = true

  try {
    const res = await locationApi.updateLocation(apiData.id, formData)
    await fetchUserData()
    successMsg(res?.data?.message || '更新成功')
    closeModal('editLocation')
  } catch (err) {
    handleError(err, '更新失敗，請稍後再試')
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
      locationFormData.value = {}
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
    title="修改點位"
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
          <n-button>重新上傳圖片</n-button>
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
          關閉
        </n-button>
      </n-space>
    </n-form>
  </n-modal>
</template>

<style lang="scss"></style>
