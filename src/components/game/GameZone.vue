<template>
  <NCard :title="title" size="small">
    <NSpace vertical :size="12">
      <NText>Score (KOs): {{ side.koCount }} / 3</NText>

      <PokemonCard
        v-if="side.activeCard"
        :card="side.activeCard"
        size="sm"
        :current-hp="side.activeHp ?? side.activeCard.hp"
      />
      <NEmpty v-else description="Aucune carte active" />

      <slot />
    </NSpace>
  </NCard>
</template>

<script setup lang="ts">
import type { Card } from '../../types/index.js'
import PokemonCard from '../cards/PokemonCard.vue'

interface GameSide {
  koCount: number
  activeCard: Card | null
  activeHp: number | null
}

defineProps<{
  title: string
  side: GameSide
}>()
</script>
