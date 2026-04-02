<template>
  <div class="container">
    <NPageHeader @back="goHome">
      <template #title>
        <NText strong>{{ deck?.name || 'Détail du deck' }}</NText>
      </template>
      <template #extra>
        <NButton type="primary" @click="goToEdit">Modifier le deck</NButton>
      </template>
    </NPageHeader>

    <NSpin :show="loading">
      <NAlert
        v-if="error"
        type="error"
        :show-icon="true"
        style="margin: 16px 0"
      >
        {{ error }}
      </NAlert>

      <PokemonCardGrid v-else :cards="cardsToDisplay" size="sm" />
    </NSpin>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PokemonCardGrid from '../../components/cards/PokemonCardGrid.vue'
import { useApi } from '../../composables/useApi.js'
import { ROUTES } from '../../router.js'
import type { Card, Deck } from '../../types/index.js'
import {
  extractDeckCardIds,
  extractDeckCards,
  sortCardsByIdOrder,
} from '../../utils/deck.js'

const api = useApi()
const route = useRoute()
const router = useRouter()

const deck = ref<Deck | null>(null)
const allCards = ref<Card[]>([])
const loading = ref(false)
const error = ref('')

const deckId = computed(() => String(route.params.id || ''))

const cardsToDisplay = computed(() => {
  const fullCards = extractDeckCards(deck.value)
  if (fullCards.length > 0) return fullCards

  const ids = extractDeckCardIds(deck.value)
  return sortCardsByIdOrder(allCards.value, ids)
})

const goHome = () => router.push(ROUTES.HOME)
const goToEdit = () =>
  router.push(ROUTES.DECK_EDIT.replace(':id', deckId.value))

const loadDeck = async () => {
  loading.value = true
  error.value = ''

  try {
    const [deckResponse, cardsResponse] = await Promise.all([
      api.getDeck(deckId.value),
      api.getCards(),
    ])
    deck.value = deckResponse
    allCards.value = cardsResponse
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : 'Impossible de charger le deck'
  } finally {
    loading.value = false
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
