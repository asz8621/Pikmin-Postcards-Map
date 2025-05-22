<script setup>
import { storeToRefs } from 'pinia'
import { useLoadingStore } from '@/stores/loading'

const loadingStore = useLoadingStore()
const { isAppLoading } = storeToRefs(loadingStore)

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
        <div id="app">
          <div
            v-if="isAppLoading"
            class="fixed inset-0 z-[9999] bg-white/80 flex items-center flex-col justify-center"
          >
            <img src="@/assets/images/loading.gif" alt="" width="84" />
            <p>加載中，請稍後</p>
          </div>

          <router-view />
        </div>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<style lang="scss" scoped></style>
