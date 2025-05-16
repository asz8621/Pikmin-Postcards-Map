<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAppMessage } from '@/composables/useAppMessage'
import { useModalStore } from '@/stores/modal'

const emit = defineEmits(['handleUploadLocation'])

const { errorMsg } = useAppMessage()

const modalStore = useModalStore()
const { closeModal } = modalStore
const { modalStates, modalLoading } = storeToRefs(modalStore)

const uploadLocationRef = ref(null)
const locationFormData = ref({
  image: null,
  type: null,
  coords: null,
  explore: false,
})
const maxSizeMB = 5
const maxSizeBytes = maxSizeMB * 1024 * 1024
const allowedTypes = ['image/png', 'image/jpeg']

const rules = {
  image: [
    {
      key: 'image',
      required: true,
      validator: (_, value) => {
        const result = validateImageFile(value)
        return result
      },
      trigger: ['change', 'blur'],
    },
  ],
  type: [{ required: true, message: '請選擇類型', trigger: 'blur' }],
  coords: [
    {
      required: true,
      message: '請輸入座標',
      trigger: 'blur',
    },
    {
      validator: (_, value) => {
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

// 清除表單資料
const resetLocationFormData = () => {
  for (let key in locationFormData.value) {
    if (key === 'explore') {
      locationFormData.value[key] = false
    } else {
      locationFormData.value[key] = null
    }
  }
}

// 檢查檔案格式
function validateImageFile(file) {
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
  uploadLocationRef.value?.validate(null, (rule) => rule?.key === 'image').catch(() => {})
  onFinish()
}

// 移除上傳檔案
const handleRemove = () => {
  locationFormData.value.image = null
  uploadLocationRef.value?.validate(null, (rule) => rule?.key === 'image').catch(() => {})
}

// 取得經緯度
const getCoordinates = (input) => {
  const [latStr, longStr] = input.split(',')
  const lat = parseFloat(latStr.trim())
  const long = parseFloat(longStr.trim())

  return { lat, long }
}

const handleUploadLocation = async () => {
  if (modalLoading.value) return

  try {
    await uploadLocationRef.value?.validate()
  } catch {
    errorMsg('請確認資料是否填寫齊全無誤')
    return
  }

  const { lat, long } = getCoordinates(locationFormData.value.coords)
  locationFormData.value.lat = lat
  locationFormData.value.long = long

  const apiData = { ...locationFormData.value }
  apiData.image = locationFormData.value.image.file
  delete apiData.coords

  const formData = new FormData()
  for (const [key, value] of Object.entries(apiData)) {
    formData.append(key, value)
  }

  modalLoading.value = true

  emit('handleUploadLocation', formData)
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
    title="上傳資料"
    preset="dialog"
    :mask-closable="false"
    :closable="false"
    class="modal"
  >
    <n-form
      ref="uploadLocationRef"
      :model="locationFormData"
      :rules="rules"
      label-placement="top"
      :disabled="modalLoading"
    >
      <n-alert type="warning" :show-icon="false" style="margin: 1rem 0">
        人工審核大約 <strong>1~3 天</strong>，請耐心等候，謝謝
      </n-alert>
      <n-form-item path="image">
        <template #label>
          <span>上傳圖片</span>
          <n-popover placement="bottom" trigger="click">
            <template #trigger>
              <span style="font-size: 12px; cursor: pointer; color: #5555e2; margin-left: 4px"
                >範例</span
              >
            </template>
            <div>
              <img
                src="@/assets/images/upload_example.png"
                alt=""
                height="200"
                style="margin-top: 0.5rem"
              />
            </div>
          </n-popover>
        </template>
        <n-upload
          accept=".png,.jpg"
          list-type="image"
          :max="1"
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
          :options="[
            { label: '花', value: 'flower' },
            { label: '蘑菇', value: 'mushroom' },
          ]"
          placeholder="請選擇類型"
        />
      </n-form-item>

      <n-form-item label="座標" path="coords">
        <n-input v-model:value="locationFormData.coords" placeholder="輸入座標" />
      </n-form-item>

      <n-form-item label="隱藏版" path="explore">
        <n-switch v-model:value="locationFormData.explore" />
      </n-form-item>
      <n-space justify="end">
        <n-button type="primary" @click="handleUploadLocation" :disabled="modalLoading">
          送出
        </n-button>
        <n-button
          type="tertiary"
          secondary
          @click="closeModal('uploadLocation')"
          :disabled="modalLoading"
        >
          關閉
        </n-button>
      </n-space>
    </n-form>
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
