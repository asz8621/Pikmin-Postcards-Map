import axios from '@/plugins/axios'

export const resetPassword = (userId, passwordData) => {
  return axios.put(`/user/reset-password/${userId}`, passwordData)
}

export const getUserInfo = () => {
  return axios.get('/user/info')
}

export const updateUserInfo = (userId, userInfo) => {
  return axios.put(`/user/update/${userId}`, userInfo)
}
