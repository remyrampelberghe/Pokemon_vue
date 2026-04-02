<template>
  <NCard title="Lobby">
    <NSpace vertical :size="16">
      <NAlert v-if="game.lobbyError" type="error" :show-icon="true">
        {{ game.lobbyError }}
      </NAlert>

      <NSpace align="center" justify="space-between" wrap>
        <NSelect
          v-model:value="selectedDeckId"
          style="min-width: 260px"
          :options="deckOptions"
          placeholder="Choisir un deck"
        />
        <NButton type="primary" :disabled="!selectedDeckId" @click="createRoom">
          Créer une room
        </NButton>
      </NSpace>

      <NDivider style="margin: 0" />

      <NSpace vertical :size="10">
        <NText strong>Rooms disponibles</NText>
        <NEmpty
          v-if="!game.rooms.length"
          description="Aucune room en attente"
        />

        <NCard v-for="room in game.rooms" :key="room.id" embedded>
          <NSpace justify="space-between" align="center" wrap>
            <NSpace vertical :size="4">
              <NText strong>Room {{ room.id }}</NText>
              <NText depth="3">Hôte: {{ room.hostName || 'Inconnu' }}</NText>
              <NText depth="3">Statut: {{ room.status || 'waiting' }}</NText>
            </NSpace>
            <NButton
              tertiary
              type="primary"
              :disabled="!selectedDeckId"
              @click="joinRoom(room.id)"
            >
              Rejoindre
            </NButton>
          </NSpace>
        </NCard>
      </NSpace>

      <NText v-if="game.currentRoomId" depth="3">
        Room active: {{ game.currentRoomId }}
      </NText>
    </NSpace>
  </NCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { useApi } from '../../composables/useApi.js'
import { useGameStore } from '../../stores/game.js'

const api = useApi()
const game = useGameStore()

const selectedDeckId = ref<number | null>(null)
const decks = ref<{ id: number; name: string }[]>([])

const deckOptions = computed(() =>
  decks.value.map((deck) => ({
    label: deck.name,
    value: deck.id,
  })),
)

const loadDecks = async () => {
  const myDecks = await api.getMyDecks()
  decks.value = myDecks.map((deck) => ({ id: deck.id, name: deck.name }))
  if (!selectedDeckId.value && decks.value.length > 0) {
    selectedDeckId.value = decks.value[0].id
  }
}

const createRoom = () => {
  if (!selectedDeckId.value) return
  game.createRoom(selectedDeckId.value)
}

const joinRoom = (roomId: string) => {
  if (!selectedDeckId.value) return
  game.joinRoom(roomId, selectedDeckId.value)
}

onMounted(async () => {
  game.connectLobby()
  game.requestRooms()
  await loadDecks()
})
</script>
