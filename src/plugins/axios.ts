import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError } from 'axios'
import Cookies from 'js-cookie'
import router from '@/router'
import { useModalStore } from '@/stores/useModalStore'

const baseURL = import.meta.env.VITE_API_BASE_URL

const instance: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
})

instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const modalStore = useModalStore()
    const { closeAllModals } = modalStore

    if (error.response && error.response.status === 401) {
      Cookies.remove('token')
      router.push('/login')
      closeAllModals()
    }
    return Promise.reject(error)
  },
)

export default instance
