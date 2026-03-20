<template>
  <NForm @submit.prevent="handleSignUp">
    <NFormItem label="Nom utilisateur" required style="width: 100%">
      <NInput
        v-model:value="username"
        round
        type="text"
        placeholder="Nom de l'utilisateur"
      />
    </NFormItem>
    <NFormItem label="Email" required style="width: 100%">
      <NInput v-model:value="email" round type="text" placeholder="Email" />
    </NFormItem>
    <NFormItem label="Mot de passe" required style="width: 100%">
      <NInput
        v-model:value="password"
        round
        type="password"
        show-password-on="mousedown"
        placeholder="Password"
      />
    </NFormItem>
    <NButton
      type="primary"
      round
      attr-type="submit"
      style="width: 100%"
      :loading="loading"
      :disabled="loading"
      >S'inscrire</NButton
    >

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div class="footer">
      <p>
        Déjà un compte ?
        <RouterLink :to="ROUTES.SIGN_IN"><span>Se connecter</span></RouterLink>
      </p>
    </div>
  </NForm>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { ROUTES } from '@/router'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleSignUp = async () => {
  if (loading.value) return

  loading.value = true
  errorMessage.value = ''

  try {
    await authStore.signUp({
      username: username.value,
      email: email.value,
      password: password.value,
    })
    await router.push(ROUTES.HOME)
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Erreur lors de l'inscription"
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
.footer {
  display: flex;
  justify-content: center;
}

.footer span {
  text-decoration: none;
  transition: all 0.3s;
}
.footer span:hover {
  color: violet;
}

.error {
  margin-top: 8px;
  color: #d03050;
  text-align: center;
}
</style>
