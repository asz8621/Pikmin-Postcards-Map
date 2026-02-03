<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useLoadingStore } from '@/stores/useLoadingStore'
import { useMapStore } from '@/stores/useMapStore'
import { useSocketEvents } from '@/composables/useSocketEvents'
import { useViewportHeight } from '@/composables/useViewportHeight'
import { useRoute } from 'vue-router'

const loadingStore = useLoadingStore()
const { isAppLoading } = storeToRefs(loadingStore)

const mapStore = useMapStore()
const { isLocated } = storeToRefs(mapStore)

const { initSocket } = useSocketEvents()

const route = useRoute()

const isMapPage = computed(() => route.name === 'map')

const showLoading = computed(() => {
  if (isAppLoading.value) return true
  if (isMapPage.value && !isLocated.value) return true
  return false
})

const loadingText = computed(() => {
  if (isAppLoading.value) {
    return '加載中，請稍後'
  } else {
    return '正在取得您的位置...'
  }
})

useViewportHeight()

onMounted(() => {
  initSocket()
})

const themeOverrides = {
  common: {
    primaryColor: '#D3A452',
    primaryColorHover: '#C08F3F', // 可選，主色 hover 時的顏色
    primaryColorPressed: '#AD7B2D', // 可選，點擊時的顏色
    primaryColorSuppl: '#D3A452', // 有些元件會參考 suppl 色
  },
}
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides" preflight-style-disabled>
    <n-message-provider>
      <n-dialog-provider>
        <div
          v-if="showLoading"
          class="fixed inset-0 z-[999] bg-white/80 flex items-center flex-col justify-center"
        >
          <img src="@/assets/images/loading.gif" alt="" width="84" />
          <p>{{ loadingText }}</p>
        </div>

        <div class="h-screen-safe">
          <router-view />
        </div>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style lang="scss" scoped></style>
