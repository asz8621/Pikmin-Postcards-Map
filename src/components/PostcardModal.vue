<script setup>
import { computed, h } from 'vue'
import { storeToRefs } from 'pinia'
import mushroomIcon from '@/assets/images/mushroom.png'
import flowerIcon from '@/assets/images/flower.png'
import questionMark from '@/assets/images/question-mark.png'
import { useModalStore } from '@/stores/modal'
import { useAppMessage } from '@/composables/useAppMessage'

const { successMsg, errorMsg } = useAppMessage()

const modalStore = useModalStore()
const { closeModal } = modalStore
const { selectedData, showModal } = storeToRefs(modalStore)

const getTypeIcon = (type) => {
  switch (type) {
    case 'mushroom':
      return mushroomIcon
    case 'flower':
      return flowerIcon
    default:
      return questionMark
  }
}

// 取得經緯度字串
const coordinates = computed(() => `${selectedData.value?.lat}, ${selectedData.value?.long}`)

// n-image 預覽圖工具列
const customToolbar = ({ nodes }) => {
  const { zoomIn, zoomOut, resizeToOriginalSize, close } = nodes
  return h(
    'div',
    {
      style: {
        display: 'flex',
        gap: '8px',
        padding: '8px',
        justifyContent: 'center',
      },
    },
    [zoomIn, zoomOut, resizeToOriginalSize, close],
  )
}

// 複製經緯度
const onCopy = (e) => successMsg(`複製成功: ${e.text}`)
const onError = () => errorMsg('複製失敗，請稍後再試！')
</script>

<template>
  <n-modal v-model:show="showModal" preset="card" :mask-closable="false" class="modal">
    <template #header>
      <div class="place" style="display: flex; align-items: center">
        <img
          :src="getTypeIcon(selectedData?.type)"
          alt=""
          width="24"
          height="24"
          class="placeIcon"
          style="margin-right: 0.5rem"
        />
        <h3 class="placeName">明信片資訊</h3>
      </div>
    </template>

    <div class="modal-content">
      <div class="modal-left">
        <n-image :src="selectedData?.image" width="100%" :render-toolbar="customToolbar" />

        <n-space size="small" wrap>
          <n-tag v-for="item in selectedData?.features" :key="item.id" type="info" size="small">
            {{ item.name }}
          </n-tag>
        </n-space>
      </div>

      <div class="modal-right">
        <div class="placeLocation">
          <h3>{{ selectedData?.name }}</h3>
          <span class="smallText">{{ selectedData?.country }}, {{ selectedData?.city }}</span>
        </div>
        <n-space align="center" style="margin: 0.5rem 0">
          <span class="coordinates">{{ selectedData?.lat }}, {{ selectedData?.long }}</span>
          <n-button
            quaternary
            circle
            size="small"
            v-clipboard:copy="coordinates"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError"
          >
            <template #icon><SvgIcon name="copy" /></template>
          </n-button>
        </n-space>
      </div>
    </div>

    <template #footer>
      <n-button block type="default" @click="closeModal">關閉</n-button>
    </template>
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

.modal-content {
  display: flex;
  gap: 1rem;
  flex-direction: row;
  @media (max-width: 767px) {
    flex-direction: column;
  }
  .modal-left {
    flex: 1;
    min-width: 200px;
  }
  .modal-right {
    flex: 1;
    .placeLocation {
      line-height: 1.25;
    }
    .smallText {
      font-size: 12px;
      color: #888;
    }
  }
}
</style>
