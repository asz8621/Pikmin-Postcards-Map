import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie'
import { useLoadingStore } from '@/stores/useLoadingStore'

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

  if (to.meta.requiresAuth && !token) {
    loadingStore.closeAppLoading()
    return '/login'
  }

  if (excludedRoutes.includes(to.name)) {
    loadingStore.closeAppLoading()
  } else {
    loadingStore.openAppLoading()
  }

  return true
})

export default router
