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
        <NButton
          tag="a"
          href="https://making-rerun-61323218.figma.site/"
          target="_blank"
          text
          size="small"
        >
          Maquettes
        </NButton>
      </NSpace>
      <NSpace align="center" :size="16">
        <NText v-if="auth.user" depth="3">{{ auth.user.username }}</NText>
        <NButton v-if="auth.isAuthenticated" size="small" @click="logout">
          Déconnexion
        </NButton>
        <NButton v-else size="small" tertiary @click="goToSignIn">
          Connexion
        </NButton>
      </NSpace>
    </NSpace>
  </NLayoutHeader>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import { ROUTES } from '../../router.js'
import { useAuthStore } from '../../stores/auth.js'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string
const router = useRouter()
const auth = useAuthStore()

const goToSignIn = () => router.push(ROUTES.SIGN_IN)

const logout = async () => {
  auth.clearSession()
  await router.push(ROUTES.SIGN_IN)
}
</script>
