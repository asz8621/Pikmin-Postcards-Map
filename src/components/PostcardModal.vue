<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useModalStore } from '@/stores/useModalStore'
import { successMsg, errorMsg } from '@/utils/appMessage'
import { formatTimezone } from '@/utils/formatDate'
import { getTypeIcon } from '@/utils/typeIcon'
import { useLanguage } from '@/composables/useLanguage'

const { t } = useLanguage()

const modalStore = useModalStore()
const { openModal, closeModal } = modalStore
const { modalData, modalStates } = storeToRefs(modalStore)

const currentTime = ref(formatTimezone())
let timer: ReturnType<typeof setInterval> | null = null

// 取得目前點位時間
const updateLocationTime = () => {
  currentTime.value = formatTimezone(modalData.value?.time_zone)
}

watch(
  () => modalStates.value.postcard,
  (isOpen) => {
    if (isOpen) {
      updateLocationTime()
      timer = setInterval(updateLocationTime, 1000)
    } else {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }
  },
)

// 取得經緯度字串
const coordinates = computed(() => {
  const lat = modalData.value?.lat ?? 'N/A'
  const long = modalData.value?.long ?? 'N/A'
  return `${lat}, ${long}`
})

// n-image 預覽圖工具列
interface ToolbarNodes {
  zoomIn: ReturnType<typeof h>
  zoomOut: ReturnType<typeof h>
  resizeToOriginalSize: ReturnType<typeof h>
  close: ReturnType<typeof h>
}

const customToolbar = ({ nodes }: { nodes: ToolbarNodes }) => {
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
const onCopy = (e: { text: string }) => successMsg(`${t('message.copySuccess')}: ${e.text}`)
const onError = () => errorMsg(t('message.copyFailed'))
</script>

<template>
  <n-modal
    v-model:show="modalStates.postcard"
    :mask-closable="false"
    :autoFocus="false"
    :close-on-esc="false"
    preset="card"
  >
    <template #header>
      <div class="flex items-center">
        <img
          :src="getTypeIcon(modalData?.type, modalData?.explore)"
          alt=""
          width="24"
          height="24"
          class="mr-2"
        />
        <h3 class="text-base font-bold">{{ t('modal.postcardInfo') }}</h3>
      </div>
    </template>

    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <n-image :src="modalData?.image" width="100%" :render-toolbar="customToolbar" />

        <n-space size="small" wrap>
          <n-tag v-for="item in modalData?.features" :key="item.id" type="info" size="small">
            {{ item.name }}
          </n-tag>
        </n-space>
      </div>

      <div class="flex-1 flex flex-col gap-2">
        <div>
          <h3 class="font-bold text-base">{{ modalData?.name }}</h3>
          <span class="text-xs text-gray-400">{{ modalData?.country }}, {{ modalData?.city }}</span>
        </div>

        <div class="flex flex-col">
          <span>{{ t('common.time') }}</span>
          <span>{{ currentTime }}</span>
        </div>

        <div class="flex flex-col">
          <span>{{ t('common.location') }}</span>
          <div class="flex items-center">
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
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-2">
        <n-button type="primary" ghost class="flex-1" @click="openModal('reportError')">
          {{ t('modal.reportError') }}
        </n-button>
        <n-button secondary class="flex-1" @click="closeModal('postcard')">
          {{ t('common.close') }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<style lang="scss"></style>
