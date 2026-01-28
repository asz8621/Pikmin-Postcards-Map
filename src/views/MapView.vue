<script setup>
import { ref } from 'vue'
import { useInfoStore } from '@/stores/useInfoStore'
import { useMapStore } from '@/stores/useMapStore'
import { useLoadingStore } from '@/stores/useLoadingStore'
import LeafletMap from '@/components/map/LeafletMap.vue'
import SearchBox from '@/components/map/SearchBox.vue'
import UserMenu from '@/components/map/UserMenu.vue'
import LightboxStrip from '@/components/map/LightboxStrip.vue'
import PostcardModal from '@/components/PostcardModal.vue'
import ResetPasswordModal from '@/components/ResetPasswordModal.vue'
import UploadLocationModal from '@/components/UploadLocationModal.vue'
import ReportErrorModal from '@/components/ReportErrorModal.vue'
import ContributeDrawer from '@/components/contribute/ContributeDrawer.vue'
import UserInfoModal from '@/components/UserInfoModal.vue'
import { errorMsg } from '@/utils/appMessage'

const infoStore = useInfoStore()
const { fetchUserData } = infoStore

const mapStore = useMapStore()
const { fetchMapData } = mapStore

const loadingStore = useLoadingStore()
const { closeAppLoading } = loadingStore

const isDataReady = ref(false)

Promise.all([fetchUserData(), fetchMapData()])
  .then(() => {
    isDataReady.value = true
  })
  .catch((err) => {
    errorMsg(err.response?.data?.message || '資料載入失敗')
  })
  .finally(() => {
    closeAppLoading()
  })
</script>

<template>
  <n-layout class="relative h-full">
    <SearchBox />

    <UserMenu />

    <n-layout-content class="h-full">
      <div class="relative w-full h-full z-[1]">
        <LeafletMap v-if="isDataReady" />
      </div>

      <LightboxStrip />

      <ContributeDrawer />

      <PostcardModal class="w-full xs:w-[520px] m-4 xs:mx-auto" />

      <ResetPasswordModal class="w-full xs:w-[420px] m-4 xs:mx-auto" />

      <UploadLocationModal class="w-full xs:w-[420px] m-4 xs:mx-auto" />

      <ReportErrorModal class="w-full xs:w-[420px] m-4 xs:mx-auto" />

      <UserInfoModal class="w-full xs:w-[420px] m-4 xs:mx-auto" />
    </n-layout-content>
  </n-layout>
</template>

<style lang="scss" scoped></style>
