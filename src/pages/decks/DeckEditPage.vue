<template>
  <div class="container">
    <DeckForm
      title="Modifier le deck"
      submit-label="Enregistrer"
      :initial-name="initialName"
      :initial-selected-card-ids="initialSelectedCardIds"
      @submit="updateDeck"
    />
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DeckForm from '../../components/decks/DeckForm.vue'
import { useApi } from '../../composables/useApi.js'
import { ROUTES } from '../../router.js'
import type { DeckPayload } from '../../types/index.js'
import { extractDeckCardIds } from '../../utils/deck.js'

const api = useApi()
const route = useRoute()
const router = useRouter()
const message = useMessage()

const deckId = String(route.params.id || '')

const initialName = ref('')
const initialSelectedCardIds = ref<number[]>([])

const loadDeck = async () => {
  try {
    const deck = await api.getDeck(deckId)
    initialName.value = deck.name
    initialSelectedCardIds.value = extractDeckCardIds(deck)
  } catch (e) {
    message.error(e instanceof Error ? e.message : 'Chargement impossible')
    router.push(ROUTES.HOME)
  }
}

const updateDeck = async (payload: DeckPayload) => {
  try {
    await api.updateDeck(deckId, payload)
    message.success('Deck mis à jour')
    await router.push(ROUTES.DECK_DETAIL.replace(':id', deckId))
  } catch (e) {
    message.error(e instanceof Error ? e.message : 'Mise à jour impossible')
  }
}

onMounted(loadDeck)
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
}
</style>
