<template>
  <div class="container">
    <DeckForm
      title="Créer un nouveau deck"
      submit-label="Créer le deck"
      @submit="createDeck"
    />
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'

import DeckForm from '../../components/decks/DeckForm.vue'
import { useApi } from '../../composables/useApi.js'
import { ROUTES } from '../../router.js'
import type { DeckPayload } from '../../types/index.js'

const api = useApi()
const router = useRouter()
const message = useMessage()

const createDeck = async (payload: DeckPayload) => {
  try {
    await api.createDeck(payload)
    message.success('Deck créé avec succès')
    await router.push(ROUTES.HOME)
  } catch (e) {
    message.error(e instanceof Error ? e.message : 'Création impossible')
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
}
</style>
