<template>
  <NCard title="Mes decks">
    <template #header-extra>
      <NButton type="primary" @click="goToCreate">Nouveau deck</NButton>
    </template>

    <NSpin :show="loading">
      <NAlert
        v-if="error"
        type="error"
        :show-icon="true"
        style="margin-bottom: 12px"
      >
        {{ error }}
      </NAlert>

      <NEmpty
        v-if="!decks.length && !loading"
        description="Aucun deck pour le moment"
      />

      <NSpace v-else vertical :size="12">
        <NCard v-for="deck in decks" :key="deck.id" embedded>
          <NSpace justify="space-between" align="center" wrap>
            <NSpace vertical :size="4">
              <NText strong>{{ deck.name }}</NText>
              <NText depth="3">Deck #{{ deck.id }}</NText>
            </NSpace>
            <NSpace>
              <NButton tertiary @click="goToDetail(deck.id)">Voir</NButton>
              <NButton tertiary @click="goToEdit(deck.id)">Modifier</NButton>
              <NPopconfirm @positive-click="removeDeck(deck.id)">
                <template #trigger>
                  <NButton tertiary type="error">Supprimer</NButton>
                </template>
                Supprimer ce deck ?
              </NPopconfirm>
            </NSpace>
          </NSpace>
        </NCard>
      </NSpace>
    </NSpin>
  </NCard>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '../../composables/useApi.js'
import { ROUTES } from '../../router.js'
import type { Deck } from '../../types/index.js'

const api = useApi()
const router = useRouter()

const decks = ref<Deck[]>([])
const loading = ref(false)
const error = ref('')

const loadDecks = async () => {
  loading.value = true
  error.value = ''
  try {
    decks.value = await api.getMyDecks()
  } catch (e) {
    error.value =
      e instanceof Error ? e.message : 'Impossible de charger les decks'
  } finally {
    loading.value = false
  }
}

const goToCreate = () => router.push(ROUTES.DECK_CREATE)
const goToDetail = (id: number) =>
  router.push(ROUTES.DECK_DETAIL.replace(':id', String(id)))
const goToEdit = (id: number) =>
  router.push(ROUTES.DECK_EDIT.replace(':id', String(id)))

const removeDeck = async (id: number) => {
  try {
    await api.deleteDeck(id)
    await loadDecks()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Suppression impossible'
  }
}

onMounted(loadDecks)
</script>
