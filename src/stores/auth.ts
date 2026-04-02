import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useApi } from '../composables/useApi.js'
import { useStorage } from '../composables/useStorage.js'
import type { SignInPayload, SignUpPayload, User } from '../types/index.js'

export const useAuthStore = defineStore('auth', () => {
  const api = useApi()
  const storage = useStorage()

  const token = ref<string | null>(storage.get<string>('token'))
  const user = ref<User | null>(storage.get<User>('user'))

  const isAuthenticated = computed(() => !!token.value)

  const setSession = (nextToken: string, nextUser: User) => {
    token.value = nextToken
    user.value = nextUser
    storage.set('token', nextToken)
    storage.set('user', nextUser)
  }

  const clearSession = () => {
    token.value = null
    user.value = null
    storage.remove('token', 'user')
  }

  const signIn = async (payload: SignInPayload) => {
    const res = await api.signIn(payload)
    setSession(res.token, res.user)
    return res
  }

  const signUp = async (payload: SignUpPayload) => {
    const res = await api.signUp(payload)
    setSession(res.token, res.user)
    return res
  }

  return {
    token,
    user,
    isAuthenticated,
    signIn,
    signUp,
    clearSession,
  }
})
