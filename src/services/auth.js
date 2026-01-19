import axios from '@/plugins/axios'

export const checkUserToken = () => {
  return axios.get('/auth/check')
}

export const userLogin = (loginData) => {
  return axios.post('/user/login', loginData)
}

export const userLogout = () => {
  return axios.post('/user/logout')
}

export const userRegister = (registerData) => {
  return axios.post('/user/register', registerData)
}

export const forgotPassword = (forgotData) => {
  return axios.post('/user/forgot-password', forgotData)
}

export const resetForgotPassword = (resetData) => {
  return axios.post('/user/reset-forgot-password', resetData)
}
