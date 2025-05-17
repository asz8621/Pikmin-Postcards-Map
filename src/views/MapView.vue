<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useInfoStore } from '@/stores/info'
import { useMapStore } from '@/stores/map'
import { useModalStore } from '@/stores/modal'
import LeafletMap from '@/components/LeafletMap.vue'
import PostcardModal from '@/components/PostcardModal.vue'
import LightboxStrip from '@/components/LightboxStrip.vue'
import ResetPasswordModal from '@/components/ResetPasswordModal.vue'
import UploadLocationModal from '@/components/UploadLocationModal.vue'
import ContributeDrawer from '@/components/contribute/ContributeDrawer.vue'

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
const { mapAllData } = storeToRefs(mapStore)

const modalStore = useModalStore()
const { closeModal } = modalStore
const { modalStates, modalLoading } = storeToRefs(modalStore)

const options = [
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
  await fetchUserData()
  await fetchMapData()
})

// 修改密碼
const handleResetPassword = async (id, data) => {
  try {
    const res = await axios.put(`/user/reset-password/${id}`, data)
    successMsg(res.data.message)
    closeModal('resetPassword')
    signOut()
  } catch (err) {
    const errorMessage = err.response?.data?.message
    if (Array.isArray(errorMessage)) {
      errorMessage.forEach((msg) => errorMsg(msg))
    } else {
      errorMsg(errorMessage || '操作失敗')
    }
  } finally {
    modalLoading.value = false
  }
}

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

// 上傳點位
const handleUploadLocation = async (data) => {
  try {
    const res = await axios.post('/user/locations', data)
    successMsg(res.data.message)
    closeModal('uploadLocation')
    await fetchUserData()
  } catch (error) {
    const errorMessage = error.response?.data?.message
    if (Array.isArray(errorMessage)) {
      errorMessage.forEach((msg) => errorMsg(msg))
    } else {
      errorMsg(errorMessage || '操作失敗')
    }
  } finally {
    modalLoading.value = false
  }
}
</script>

<template>
  <n-layout>
    <n-layout-header bordered class="header">
      <div class="headerContent">
        <div class="logo">logo</div>

        <n-dropdown
          v-if="userData"
          trigger="click"
          placement="bottom-end"
          :options="options"
          @select="handleSelect"
        >
          <n-button icon-placement="right" class="headerMenu">
            {{ userData?.username }}
            <template #icon>
              <SvgIcon name="down"></SvgIcon>
            </template>
          </n-button>
        </n-dropdown>
      </div>
    </n-layout-header>
    <n-layout-content>
      <div class="map-wrapper">
        <LeafletMap v-if="mapAllData.length" />
      </div>

      <LightboxStrip />

      <PostcardModal />

      <ResetPasswordModal @handleResetPassword="handleResetPassword" />

      <UploadLocationModal @handleUploadLocation="handleUploadLocation" />

      <ContributeDrawer />
    </n-layout-content>
  </n-layout>
</template>

<style lang="scss">
$headerHeight: 72px;
.header {
  height: $headerHeight;
  padding: 0.5rem 1rem;
  .headerContent {
    display: flex;
    align-items: center;
    height: 100%;
    .headerMenu {
      margin-left: auto;
    }
  }
}
.logo {
  margin-right: auto;
}
.map-wrapper {
  width: 100%;
  height: calc(100vh - $headerHeight);
  position: relative;
  z-index: 1;
}
</style>
