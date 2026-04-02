<template>
  <NCard title="Main du joueur" size="small">
    <NSpace vertical :size="12">
      <NText>Cartes en main: {{ hand.length }} / 5</NText>
      <NText depth="3">Cartes restantes dans le deck: {{ deckCount }}</NText>

      <NEmpty v-if="!hand.length" description="Main vide" />

      <NGrid v-else cols="2 s:3 m:5" :x-gap="8" :y-gap="8" responsive="screen">
        <NGridItem v-for="card in hand.slice(0, 5)" :key="card.id">
          <PokemonCard
            :card="card"
            size="sm"
            :selectable="canPlay"
            :disabled="!canPlay"
            @click="play(card.id)"
          />
        </NGridItem>
      </NGrid>
    </NSpace>
  </NCard>
</template>

<script setup lang="ts">
import type { Card } from '../../types/index.js'
import PokemonCard from '../cards/PokemonCard.vue'

const props = defineProps<{
  hand: Card[]
  deckCount: number
  canPlay: boolean
}>()

const emit = defineEmits<(e: 'play', cardId: number) => void>()

const play = (cardId: number) => {
  if (!props.canPlay) return
  emit('play', cardId)
}
</script>
