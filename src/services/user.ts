import axios from '@/plugins/axios'
import type { PasswordData, UserInfo } from '@/types'

export const resetPassword = (userId: number, passwordData: PasswordData) => {
  return axios.put(`/user/reset-password/${userId}`, passwordData)
}

export const getUserInfo = () => {
  return axios.get('/user/info')
}

export const updateUserInfo = (userId: number, userInfo: UserInfo) => {
  return axios.put(`/user/update/${userId}`, userInfo)
}
