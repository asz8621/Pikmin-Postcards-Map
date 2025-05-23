<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppMessage } from '@/composables/useAppMessage'
import { useInfoStore } from '@/stores/useInfoStore'
import { useModalStore } from '@/stores/useModalStore'
import axios from '@/plugins/axios'

const { successMsg, errorMsg } = useAppMessage()

const modalStore = useModalStore()
const { closeModal } = modalStore
const { modalStates, modalData, modalLoading, validateErrorMsg } = storeToRefs(modalStore)

const infoStore = useInfoStore()
const { fetchUserData } = infoStore

const editLocationRef = ref(null)
const locationFormData = ref({})
const maxSizeMB = 5
const maxSizeBytes = maxSizeMB * 1024 * 1024
const allowedTypes = ['image/png', 'image/jpeg']
const imageUrl = ref('')
const typeOptions = [
  { label: '花', value: 'flower' },
  { label: '蘑菇', value: 'mushroom' },
]

const rules = {
  image: [
    {
      key: 'image',
      required: true,
      validator: (_, value) => {
        if (typeof value === 'string') return true

        const result = validateImageFile(value)
        return result
      },
      trigger: ['change', 'blur'],
    },
  ],
  type: [{ required: true, message: '請選擇類型', trigger: 'blur' }],
  coords: [
    {
      validator: (_, value) => {
        if (!value || value.trim() === '') {
          return new Error('請輸入座標')
        }

        const coordRegex = /^\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*$/
        const match = value?.match(coordRegex)

        if (!match) {
          return new Error('座標格式錯誤，請輸入例如：2.3425245, 34.23523552')
        }

        const lat = parseFloat(match[1])
        const long = parseFloat(match[3])

        if (lat < -90 || lat > 90 || long < -180 || long > 180) {
          return new Error('經緯度超出合理範圍 (緯度 -90~90, 經度 -180~180)')
        }

        return true
      },
      trigger: 'blur',
    },
  ],
}

const submitText = computed(() => {
  return locationFormData.value.image_status === 'rejected' ? '重新送審' : '送出'
})

// 蘑菇禁止修改隱藏版
const changeType = (type) => {
  if (type === 'mushroom') locationFormData.value.explore = false
}

// 檢查檔案格式
function validateImageFile(file) {
  if (!file) {
    locationFormData.value.image = imageUrl.value
    return true
  }
  const fileSize = file.file.size
  const fileType = file.type
  const fileName = file.name
  if (!file || !fileName || !fileSize || !fileType) {
    return new Error('檔案資訊錯誤')
  }

  if (!allowedTypes.includes(fileType)) {
    return new Error('只能上傳 PNG 或 JPG 圖片')
  }

  if (fileSize > maxSizeBytes) {
    return new Error(`圖片大小不可超過 ${maxSizeMB}MB`)
  }

  return true
}

// 檢查上傳檔案
const beforeUpload = (fileData) => {
  const file = fileData.file
  const result = validateImageFile(file)

  if (result instanceof Error) {
    errorMsg(result.message)
    return false
  }

  return true
}

// 暫存圖片到表單資料
const customUpload = ({ file, onFinish }) => {
  locationFormData.value.image = file
  editLocationRef.value?.validate(null, (rule) => rule?.key === 'image').catch(() => {})
  onFinish()
}

// 移除上傳檔案
const handleRemove = () => {
  locationFormData.value.image = null
  editLocationRef.value?.validate(null, (rule) => rule?.key === 'image').catch(() => {})
}

// 取得經緯度
const getCoordinates = (input) => {
  const [latStr, longStr] = input.split(',')
  const lat = parseFloat(latStr.trim())
  const long = parseFloat(longStr.trim())

  return { lat, long }
}

const handleEditLocation = async () => {
  if (modalLoading.value) return

  try {
    await editLocationRef.value?.validate()
  } catch {
    errorMsg(validateErrorMsg.value)
    return
  }

  const { lat, long } = getCoordinates(locationFormData.value.coords)
  locationFormData.value.lat = lat
  locationFormData.value.long = long

  const apiData = { ...locationFormData.value }
  if (typeof apiData.image !== 'string') apiData.image = locationFormData.value.image.file
  delete apiData.coords

  const formData = new FormData()
  for (const [key, value] of Object.entries(apiData)) {
    formData.append(key, value)
  }

  modalLoading.value = true

  try {
    const res = await axios.put(`/user/locations/${apiData.id}`, formData)
    await fetchUserData()
    successMsg(res?.data?.message || '更新成功')
    closeModal('editLocation')
  } catch (err) {
    errorMsg(err.response?.data?.message || '更新失敗')
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
        type,
        lat,
        long,
        coords: `${lat}, ${long}`,
        image_status,
      }
      imageUrl.value = image
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
      <n-form-item path="image">
        <template #label>
          <span>上傳圖片</span>
          <n-popover placement="bottom" trigger="click">
            <template #trigger>
              <span class="text-xs cursor-pointer text-indigo-500 ml-1"> 範例 </span>
            </template>
            <div>
              <img src="@/assets/images/upload_example.png" alt="" height="200" />
            </div>
          </n-popover>
          <img :src="imageUrl" alt="" class="max-h-[300px] mt-2" />
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
          @change="changeType"
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
