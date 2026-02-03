import axios from '@/plugins/axios'
import type { LoginData, RegisterData, ForgotPasswordData, ResetPasswordData } from '@/types'

export const checkUserToken = () => {
  return axios.get('/auth/check')
}

export const userLogin = (loginData: LoginData) => {
  return axios.post('/user/login', loginData)
}

export const userLogout = () => {
  return axios.post('/user/logout')
}

export const userRegister = (registerData: RegisterData) => {
  return axios.post('/user/register', registerData)
}

export const forgotPassword = (forgotData: ForgotPasswordData) => {
  return axios.post('/user/forgot-password', forgotData)
}

export const resetForgotPassword = (resetData: ResetPasswordData) => {
  return axios.post('/user/reset-forgot-password', resetData)
}
