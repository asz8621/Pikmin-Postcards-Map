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
const { modalData, modalStates } = storeToRefs(modalStore)

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
const coordinates = computed(() => `${modalData.value?.lat}, ${modalData.value?.long}`)

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
  <n-modal
    v-model:show="modalStates.postcard"
    :mask-closable="false"
    :closable="false"
    :autoFocus="false"
    preset="card"
  >
    <template #header>
      <div class="flex items-center">
        <img :src="getTypeIcon(modalData?.type)" alt="" width="24" height="24" class="mr-2" />
        <h3 class="text-base font-bold">明信片資訊</h3>
      </div>
    </template>

    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <n-image :src="modalData?.image" width="100%" :render-toolbar="customToolbar" />

        <n-space size="small" wrap>
          <n-tag v-for="item in modalData?.features" :key="item.id" type="info" size="small">
            {{ item.name }}
          </n-tag>
        </n-space>
      </div>

      <div class="flex-1">
        <div>
          <h3 class="font-bold text-base">{{ modalData?.name }}</h3>
          <span class="text-xs text-gray-400">{{ modalData?.country }}, {{ modalData?.city }}</span>
        </div>
        <n-space align="center" class="my-2">
          <span>{{ modalData?.lat }}, {{ modalData?.long }}</span>
          <n-button
            quaternary
            circle
            size="small"
            v-clipboard:copy="coordinates"
            v-clipboard:success="onCopy"
            v-clipboard:error="onError"
          >
            <template #icon>
              <SvgIcon name="copy" />
            </template>
          </n-button>
        </n-space>
      </div>
    </div>

    <template #footer>
      <n-button block type="default" @click="closeModal('postcard')">關閉</n-button>
    </template>
  </n-modal>
</template>

<style lang="scss"></style>
