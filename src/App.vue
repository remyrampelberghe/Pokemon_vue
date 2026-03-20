<template>
  <NConfigProvider>
    <NMessageProvider>
      <NLayout>
        <HeaderBar v-if="authStore.isAuthenticated" />
        <NLayoutContent>
          <RouterView />
        </NLayoutContent>
      </NLayout>
    </NMessageProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'

import HeaderBar from './components/layout/HeaderBar.vue'

const authStore = useAuthStore()
</script>

<style>
body {
  padding: 0 20px;
}
</style>
