<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import { successMsg, errorMsg } from '@/utils/appMessage'
import { useLanguage } from '@/composables/useLanguage'
import { useApiError } from '@/composables/useApiError'
import { authApi } from '@/services'

const { t } = useLanguage()

const { handleError } = useApiError()

const router = useRouter()

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const returnedState = urlParams.get('state')
  const storedState = localStorage.getItem('oauth_state')

  const token = urlParams.get('token')
  const error = urlParams.get('error')

  if (error) {
    // 錯誤訊息對應表
    const errorMessages: Record<string, string> = {
      google_oauth_init_failed: t('message.googleOauthInitFailed'),
      facebook_oauth_init_failed: t('message.facebookOauthInitFailed'),
      google_code_error: t('message.googleCodeError'),
      facebook_code_error: t('message.facebookCodeError'),
      google_state_error: t('message.googleStateError'),
      facebook_state_error: t('message.facebookStateError'),
      google_oauth_callback_failed: t('message.googleOauthCallbackFailed'),
      facebook_oauth_callback_failed: t('message.facebookOauthCallbackFailed'),
    }

    const errorMessage =
      errorMessages[error] || decodeURIComponent(error) || t('message.loginFailed')
    errorMsg(errorMessage)
    router.push('/login')
    return
  }

  // State 不匹配，可能是 CSRF 攻擊
  if (returnedState !== storedState) {
    errorMsg(t('message.validationError'))
    localStorage.removeItem('oauth_state')
    router.push('/login')
    return
  }

  if (!token) {
    errorMsg(t('message.loginFailedInvalidUser'))
    router.push('/login')
    return
  }

  Cookies.set('token', token, { expires: 1 })
  checkToken()
})

const checkToken = async () => {
  try {
    await authApi.checkUserToken()
    successMsg(t('message.login'))
    router.push('/map')
  } catch (err) {
    handleError(err, t('message.validationError'))
    router.push('/login')
  } finally {
    // 清除已使用的 state
    localStorage.removeItem('oauth_state')
  }
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-white"></div>
</template>
