<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useInfoStore } from '@/stores/useInfoStore'
import { useModalStore } from '@/stores/useModalStore'
import { useAuthFlow } from '@/composables/useAuthFlow'
import { useApiError } from '@/composables/useApiError'
import { useLanguage } from '@/composables/useLanguage'
import { successMsg } from '@/utils/appMessage'
import { authApi } from '@/services'

const { signOut } = useAuthFlow()
const { handleError } = useApiError()
const { t } = useLanguage()

const infoStore = useInfoStore()
const { userData } = storeToRefs(infoStore)

const modalStore = useModalStore()
const { modalStates } = storeToRefs(modalStore)

const options = computed(() => [
  {
    label: t('menu.userInfo'),
    key: 'userInfo',
  },
  {
    label: t('menu.contribute'),
    key: 'contribute',
  },
  {
    label: t('menu.uploadLocation'),
    key: 'uploadLocation',
  },
  {
    label: t('menu.changePassword'),
    key: 'changePassword',
  },
  {
    label: t('menu.logout'),
    key: 'logout',
  },
])

const handleSelect = async (key: string) => {
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
    await authApi.userLogout()
    successMsg(t('message.logout'))
  } catch (err) {
    handleError(err, t('message.operationFailed'))
  } finally {
    signOut()
  }
}
</script>

<template>
  <div class="absolute top-4 right-4 z-10 size-10 flex justify-center items-center cursor-pointer">
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
