import { createRouter, createWebHistory, type RouteRecordRaw, type RouteMeta } from 'vue-router'
import Cookies from 'js-cookie'
import { useLoadingStore } from '@/stores/useLoadingStore'

interface RouteMetaExtended extends RouteMeta {
  requiresAuth?: boolean
}

const routes: RouteRecordRaw[] = [
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
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
  },
  {
    path: '/auth/check',
    name: 'auth-check',
    component: () => import('@/views/AuthCheck.vue'),
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/ForgotPasswordView.vue'),
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/ResetPasswordView.vue'),
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('@/views/MapView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

const excludedRoutes = ['login', 'register', 'forgot-password', 'reset-password', 'NotFound']

router.beforeEach((to, from) => {
  const loadingStore = useLoadingStore()
  const token = Cookies.get('token')

  // 檢查是否需要身份驗證
  if ((to.meta as RouteMetaExtended).requiresAuth && !token) {
    loadingStore.closeAppLoading()
    return '/login'
  }

  // 判斷是否是排除路由
  if (excludedRoutes.includes(to.name as string)) {
    loadingStore.closeAppLoading()
  } else {
    loadingStore.openAppLoading()
  }

  return true
})

export default router
