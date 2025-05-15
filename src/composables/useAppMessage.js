import { useMessage } from 'naive-ui'

export const useAppMessage = () => {
  const message = useMessage()

  const successMsg = (msg) => {
    message.success(msg || '操作成功')
  }

  const errorMsg = (msg) => {
    message.error(msg || '發生錯誤')
  }

  const infoMsg = (msg) => {
    message.info(msg || '提示訊息')
  }

  const warningMsg = (msg) => {
    message.warning(msg || '注意事項')
  }

  return {
    successMsg,
    errorMsg,
    infoMsg,
    warningMsg,
  }
}
