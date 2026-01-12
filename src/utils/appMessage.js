import { createDiscreteApi } from 'naive-ui'

const { message } = createDiscreteApi(['message'])

export const successMsg = (msg) => message.success(msg || '操作成功')
export const errorMsg = (msg) => message.error(msg || '發生錯誤')
export const infoMsg = (msg) => message.info(msg || '提示訊息')
export const warningMsg = (msg) => message.warning(msg || '注意事項')
