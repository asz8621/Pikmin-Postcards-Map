<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useInfoStore } from '@/stores/useInfoStore'
import { useMapStore } from '@/stores/useMapStore'
import { useModalStore } from '@/stores/useModalStore'
import { useLoadingStore } from '@/stores/useLoadingStore'
import LeafletMap from '@/components/LeafletMap.vue'
import PostcardModal from '@/components/PostcardModal.vue'
import LightboxStrip from '@/components/LightboxStrip.vue'
import ResetPasswordModal from '@/components/ResetPasswordModal.vue'
import UploadLocationModal from '@/components/UploadLocationModal.vue'
import ContributeDrawer from '@/components/contribute/ContributeDrawer.vue'
import UserInfoModal from '@/components/UserInfoModal.vue'

import { useAuthFlow } from '@/composables/useAuthFlow'
import { useAppMessage } from '@/composables/useAppMessage'

import axios from '@/plugins/axios'

const { successMsg, errorMsg } = useAppMessage()
const { signOut } = useAuthFlow()

const infoStore = useInfoStore()
const { fetchUserData } = infoStore
const { userData } = storeToRefs(infoStore)

const mapStore = useMapStore()
const { fetchMapData } = mapStore

const modalStore = useModalStore()
const { modalStates } = storeToRefs(modalStore)

const loadingStore = useLoadingStore()
const { closeAppLoading } = loadingStore

const isDataReady = ref(false)

const options = [
  {
    label: '個人資料',
    key: 'userInfo',
  },
  {
    label: '我的貢獻',
    key: 'contribute',
  },
  {
    label: '上傳點位',
    key: 'uploadLocation',
  },
  {
    label: '修改密碼',
    key: 'changePassword',
  },
  {
    label: '登出',
    key: 'logout',
  },
]
const handleSelect = async (key) => {
  switch (key) {
    case 'userInfo': {
      modalStates.value.userInfo = true
      break
    }
    case 'contribute': {
      modalStates.value.contribute = true
      break
    }
    case 'uploadLocation': {
      modalStates.value.uploadLocation = true
      break
    }
    case 'changePassword': {
      modalStates.value.resetPassword = true
      break
    }
    case 'logout': {
      handleLogout()
      break
    }
  }
}

onMounted(async () => {
  const [userResult, mapResult] = await Promise.allSettled([fetchUserData(), fetchMapData()])

  if (userResult.status === 'fulfilled' && mapResult.status === 'fulfilled') {
    isDataReady.value = true
    closeAppLoading()
  } else {
    if (userResult.status === 'rejected') {
      errorMsg(userResult.reason?.response?.data?.message || '使用者資料取得失敗')
    }
    if (mapResult.status === 'rejected') {
      errorMsg(mapResult.reason?.response?.data?.message || '地圖資料取得失敗')
    }
  }
})

// 登出
const handleLogout = async () => {
  try {
    const res = await axios.post('/user/logout')
    successMsg(res.data.message)
    signOut()
  } catch (err) {
    errorMsg(err.response?.data?.message || '操作失敗')
  }
}
</script>

<template>
  <n-layout class="relative">
    <n-layout-header
      class="absolute top-0 left-0 z-10 h-[72px] px-2 sm:px-4 py-2 bg-white/50"
      bordered
    >
      <div class="flex items-center h-full">
        <div class="w-[120px] sm:w-[175px] mr-auto transition-width duration-500">
          <img src="@/assets/images/logo.png" alt="logo" />
        </div>

        <n-dropdown
          v-if="userData"
          trigger="click"
          placement="bottom-end"
          :options="options"
          @select="handleSelect"
        >
          <n-button
            icon-placement="right"
            class="max-w-[120px] ml-auto"
            strong
            secondary
            type="primary"
          >
            <n-ellipsis class="max-w-[80px]">
              {{ userData?.username }}
            </n-ellipsis>
            <template #icon>
              <SvgIcon name="down"></SvgIcon>
            </template>
          </n-button>
        </n-dropdown>
      </div>
    </n-layout-header>
    <n-layout-content>
      <div class="w-full h-screen relative z-[1]">
        <LeafletMap v-if="isDataReady" />
      </div>

      <LightboxStrip />

      <ContributeDrawer />

      <PostcardModal class="w-full xs:w-[520px] m-4 xs:m-auto" />

      <ResetPasswordModal class="w-full xs:w-[420px] m-4 xs:m-auto" />

      <UploadLocationModal class="w-full xs:w-[420px] m-4 xs:m-auto" />

      <UserInfoModal class="w-full xs:w-[420px] m-4 xs:m-auto" />
    </n-layout-content>
  </n-layout>
</template>

<style lang="scss" scoped></style>
