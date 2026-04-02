<template>
  <div class="container">
    <NCard title="Connexion" style="max-width: 420px; margin: 0 auto">
      <NForm label-placement="top">
        <NFormItem label="Email">
          <NInput v-model:value="email" placeholder="red@example.com" />
        </NFormItem>
        <NFormItem label="Mot de passe">
          <NInput
            v-model:value="password"
            type="password"
            show-password-on="click"
          />
        </NFormItem>
      </NForm>

      <NSpace justify="space-between" align="center">
        <NButton text @click="goToSignUp">Créer un compte</NButton>
        <NButton
          type="primary"
          :loading="loading"
          :disabled="isDisabled"
          @click="submit"
        >
          Se connecter
        </NButton>
      </NSpace>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { ROUTES } from '../../router.js'
import { useAuthStore } from '../../stores/auth.js'

const router = useRouter()
const message = useMessage()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

const isDisabled = computed(() => !email.value.trim() || !password.value)

const goToSignUp = () => router.push(ROUTES.SIGN_UP)

const submit = async () => {
  if (isDisabled.value) return

  loading.value = true
  try {
    await auth.signIn({ email: email.value.trim(), password: password.value })
    message.success('Connecté')
    await router.push(ROUTES.HOME)
  } catch (e) {
    message.error(e instanceof Error ? e.message : 'Connexion impossible')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
}
</style>
