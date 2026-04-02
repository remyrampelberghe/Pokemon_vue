import { createRouter, createWebHistory } from 'vue-router'

import SignInPage from './pages/auth/SignInPage.vue'
import SignUpPage from './pages/auth/SignUpPage.vue'
import DeckCreatePage from './pages/decks/DeckCreatePage.vue'
import DeckDetailPage from './pages/decks/DeckDetailPage.vue'
import DeckEditPage from './pages/decks/DeckEditPage.vue'
import HomePage from './pages/HomePage.vue'
import { useAuthStore } from './stores/auth.js'

export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  DECK_CREATE: '/decks/new',
  DECK_DETAIL: '/decks/:id',
  DECK_EDIT: '/decks/:id/edit',
} as const

const routes = [
  { path: ROUTES.SIGN_IN, component: SignInPage, meta: { guestOnly: true } },
  { path: ROUTES.SIGN_UP, component: SignUpPage, meta: { guestOnly: true } },
  { path: ROUTES.HOME, component: HomePage, meta: { requiresAuth: true } },
  {
    path: ROUTES.DECK_CREATE,
    component: DeckCreatePage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.DECK_DETAIL,
    component: DeckDetailPage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.DECK_EDIT,
    component: DeckEditPage,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: ROUTES.SIGN_IN }
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { path: ROUTES.HOME }
  }

  return undefined
})

export default router
