<template>
  <NLayoutHeader
    bordered
    style="padding: 0 24px; position: sticky; top: 0; z-index: 100"
  >
    <NSpace justify="space-between" align="center" style="height: 56px">
      <NSpace align="center" :size="16">
        <RouterLink to="/">TCG SPA</RouterLink>
        <NButton
          tag="a"
          :href="`${apiBaseUrl.replace('/api', '')}/api-docs`"
          target="_blank"
          text
          size="small"
        >
          API Docs
        </NButton>
          text
          size="small"
        >
          Maquettes
        <NButton v-else size="small" tertiary @click="goToSignIn">
          Connexion
        </NButton>
        <NText depth="3">{{ authStore.user?.username }}</NText>
        <NButton size="small" @click="handleSignOut">Déconnexion</NButton>
=======
        <NText v-if="auth.user" depth="3">{{ auth.user.username }}</NText>
        <NButton v-if="auth.isAuthenticated" size="small" @click="logout">
          Déconnexion
        </NButton>
        <NButton v-else size="small" tertiary @click="goToSignIn"
import { ROUTES } from '@/router'
import { useAuthStore } from '@/stores/auth.store'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string
const authStore = useAuthStore()
const router = useRouter()

const handleSignOut = async () => {
  authStore.signOut()
=======
import { ROUTES } from '../../router.js'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string
const router = useRouter()
const auth = useAuthStore()

const goToSignIn = () => router.push(ROUTES.SIGN_IN)

const logout = async () => {
  auth.clearSession()
>>>>>>> f3eeee8 (feat: ajout des decks)
  await router.push(ROUTES.SIGN_IN)
}
</script>
