import axios from 'axios'
import Cookies from 'js-cookie'
import router from '@/router'
const baseURL = import.meta.env.VITE_API_BASE_URL

const instance = axios.create({
  baseURL,
  timeout: 10000,
})

instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      Cookies.remove('token')
      router.push('/login')
    }
    return Promise.reject(error)
  },
)

export default instance
