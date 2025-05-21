import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie'
import { useLoadingStore } from '@/stores/loading'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('@/views/MapView.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const loadingStore = useLoadingStore()
  const token = Cookies.get('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    if (to.name !== 'login') loadingStore.openAppLoading()
    next()
  }
})

export default router
