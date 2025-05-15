import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'

export const useAuthFlow = () => {
  const router = useRouter()

  const signOut = () => {
    Cookies.remove('token')
    router.push('/login')
  }

  return {
    signOut,
  }
}
