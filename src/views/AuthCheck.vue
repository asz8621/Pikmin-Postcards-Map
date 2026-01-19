<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import { successMsg, errorMsg } from '@/utils/appMessage'
import { useApiError } from '@/composables/useApiError'
import axios from '@/plugins/axios'

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
    const errorMessages = {
      google_oauth_init_failed: 'Google OAuth 初始化失敗',
      facebook_oauth_init_failed: 'Facebook OAuth 初始化失敗',
      google_code_error: 'Google 授權碼錯誤',
      facebook_code_error: 'Facebook 授權碼錯誤',
      google_state_error: 'Google 狀態驗證錯誤',
      facebook_state_error: 'Facebook 狀態驗證錯誤',
      google_oauth_callback_failed: 'Google OAuth 回調失敗',
      facebook_oauth_callback_failed: 'Facebook OAuth 回調失敗',
    }

    const errorMessage = errorMessages[error] || decodeURIComponent(error) || '登入失敗'
    errorMsg(errorMessage)
    router.push('/login')
    return
  }

  // State 不匹配，可能是 CSRF 攻擊
  if (returnedState !== storedState) {
    errorMsg('驗證錯誤，請重新登入')
    localStorage.removeItem('oauth_state')
    router.push('/login')
    return
  }

  Cookies.set('token', token, { expires: 1 })
  checkToken()
})

const checkToken = async () => {
  try {
    await axios.get('/auth/check')
    successMsg('登入成功')
    router.push('/map')
  } catch (err) {
    handleError(err, '驗證失敗，請重新登入')
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
