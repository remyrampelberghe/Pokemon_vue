<template>
  <NCard>
    <NSpace vertical :size="16">
      <div>
        <NText strong>{{ title }}</NText>
      </div>

      <NForm label-placement="top">
        <NFormItem
          label="Nom du deck"
          :feedback="nameError"
          :validation-status="nameError ? 'error' : undefined"
        >
          <NInput
            v-model:value="name"
            maxlength="40"
            placeholder="Ex: Team Eau"
          />
        </NFormItem>
      </NForm>

      <NSpace justify="space-between" align="center" wrap>
        <NText>Cartes sélectionnées: {{ selectedCardIds.length }} / 10</NText>
        <NText v-if="selectionError" type="error">{{ selectionError }}</NText>
      </NSpace>

      <NAlert v-if="cardsError" type="error" :show-icon="true">
        <NSpace justify="space-between" align="center" wrap>
          <NText>{{ cardsError }}</NText>
          <NButton size="small" @click="loadCards">Réessayer</NButton>
        </NSpace>
      </NAlert>

      <NAlert v-if="offlineMode" type="warning" :show-icon="true">
        Mode secours actif: cartes mock affichées car le backend est
        indisponible.
      </NAlert>

      <NSpin :show="loadingCards">
        <NEmpty
          v-if="!loadingCards && !cardsError && cards.length === 0"
          description="Aucune carte disponible"
        />
        <PokemonCardGrid
          v-else
          v-model:model-value="selectedCardIds"
          :cards="cards"
          :selection-mode="true"
          :max-selected="10"
          size="sm"
        />
      </NSpin>

      <NSpace justify="end">
        <NButton type="primary" :disabled="isSubmitDisabled" @click="submit">
          {{ submitLabel }}
        </NButton>
      </NSpace>
    </NSpace>
  </NCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { useApi } from '../../composables/useApi.js'
import { mockCards } from '../../mocks/cards.js'
import type { Card, DeckPayload } from '../../types/index.js'
import PokemonCardGrid from '../cards/PokemonCardGrid.vue'

const props = withDefaults(
  defineProps<{
    title: string
    submitLabel: string
    initialName?: string
    initialSelectedCardIds?: number[]
  }>(),
  {
    initialName: '',
    initialSelectedCardIds: () => [],
  },
)

const emit = defineEmits<(e: 'submit', payload: DeckPayload) => void>()

const api = useApi()

const name = ref(props.initialName)
const selectedCardIds = ref<number[]>([...props.initialSelectedCardIds])
const cards = ref<Card[]>([])
const loadingCards = ref(false)
const cardsError = ref('')
const offlineMode = ref(false)

watch(
  () => props.initialName,
  (value) => {
    name.value = value
  },
)

watch(
  () => props.initialSelectedCardIds,
  (value) => {
    selectedCardIds.value = [...value]
  },
)

const nameError = computed(() =>
  name.value.trim() ? '' : 'Le nom du deck est requis',
)
const selectionError = computed(() =>
  selectedCardIds.value.length === 10
    ? ''
    : 'Vous devez sélectionner exactement 10 cartes',
)
const isSubmitDisabled = computed(
  () => !!nameError.value || !!selectionError.value,
)

const loadCards = async () => {
  loadingCards.value = true
  cardsError.value = ''
  offlineMode.value = false
  try {
    cards.value = await api.getCards()
  } catch (e) {
    cardsError.value =
      e instanceof Error
        ? e.message
        : 'Impossible de charger les cartes depuis l API'
    cards.value = mockCards
    offlineMode.value = true
  } finally {
    loadingCards.value = false
  }
}

const submit = () => {
  if (isSubmitDisabled.value) return

  emit('submit', {
    name: name.value.trim(),
    cards: selectedCardIds.value,
  })
}

onMounted(loadCards)
</script>
