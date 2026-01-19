import { errorMsg } from '@/utils/appMessage'

export const useApiError = () => {
  const handleError = (err, defaultMsg = '操作失敗,請聯絡管理員') => {
    // 表單驗證錯誤不處理
    if (typeof err === 'object' && Array.isArray(err)) return

    const msg = err.response?.data?.message
    if (msg) {
      Array.isArray(msg) ? msg.forEach((message) => errorMsg(message)) : errorMsg(msg)
    } else {
      errorMsg(defaultMsg)
    }
  }

  return { handleError }
}
