import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'

import HomePage from './pages/HomePage.vue'
import SignInPage from './pages/SignIn.vue'
import SignUpPage from './pages/SignUp.vue'

export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
} as const

const routes = [
  { path: ROUTES.HOME, component: HomePage, meta: { requiresAuth: true } },
  { path: ROUTES.SIGN_IN, component: SignInPage, meta: { guestOnly: true } },
  { path: ROUTES.SIGN_UP, component: SignUpPage, meta: { guestOnly: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return ROUTES.SIGN_IN
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return ROUTES.HOME
  }

  return true
})

export default router
