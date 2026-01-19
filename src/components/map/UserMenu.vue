<script setup>
import { storeToRefs } from 'pinia'
import { useInfoStore } from '@/stores/useInfoStore'
import { useModalStore } from '@/stores/useModalStore'
import { useAuthFlow } from '@/composables/useAuthFlow'
import { useApiError } from '@/composables/useApiError'
import { successMsg } from '@/utils/appMessage'
import { authApi } from '@/services'

const { signOut } = useAuthFlow()
const { handleError } = useApiError()

const infoStore = useInfoStore()
const { userData } = storeToRefs(infoStore)

const modalStore = useModalStore()
const { modalStates } = storeToRefs(modalStore)

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

// 登出
const handleLogout = async () => {
  try {
    const res = await authApi.userLogout()
    successMsg(res.data.message)
  } catch (err) {
    handleError(err, '操作異常，請稍後再試')
  } finally {
    signOut()
  }
}
</script>

<template>
  <div
    class="absolute top-4 right-4 z-10 size-8 sm:size-9 flex justify-center items-center cursor-pointer"
  >
    <n-dropdown
      v-if="userData"
      trigger="click"
      placement="bottom-end"
      :options="options"
      @select="handleSelect"
    >
      <SvgIcon
        name="user-circle"
        color="#D3A452"
        class="outline-none focus:outline-none focus:ring-0"
        :decorative="false"
      />
    </n-dropdown>
  </div>
</template>

<style lang="scss" scoped></style>
