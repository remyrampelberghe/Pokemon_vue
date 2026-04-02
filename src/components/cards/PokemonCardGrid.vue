<template>
  <NGrid cols="1 s:2 m:3 l:4 xl:5" :x-gap="12" :y-gap="12" responsive="screen">
    <NGridItem v-for="card in cards" :key="card.id">
      <PokemonCard
        :card="card"
        :size="size"
        :selected="isSelected(card.id)"
        :disabled="isDisabled(card.id)"
        :selectable="selectionMode"
        :current-hp="hpByCardId?.[card.id]"
        @click="onCardClick"
      />
    </NGridItem>
  </NGrid>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { Card } from '../../types/index.js'
import PokemonCard from './PokemonCard.vue'

const props = withDefaults(
  defineProps<{
    cards: Card[]
    size?: 'sm' | 'md'
    selectionMode?: boolean
    modelValue?: number[]
    maxSelected?: number
    disabledCardIds?: number[]
    hpByCardId?: Record<number, number>
  }>(),
  {
    size: 'md',
    selectionMode: false,
    modelValue: () => [],
    maxSelected: Number.POSITIVE_INFINITY,
    disabledCardIds: () => [],
    hpByCardId: undefined,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
  (e: 'card-click', card: Card): void
}>()

const selectedIds = computed(() => new Set(props.modelValue))
const maxReached = computed(() => props.modelValue.length >= props.maxSelected)

const isSelected = (cardId: number) => selectedIds.value.has(cardId)

const isDisabled = (cardId: number) => {
  if (props.disabledCardIds.includes(cardId)) return true
  if (!props.selectionMode) return false
  if (isSelected(cardId)) return false
  return maxReached.value
}

const onCardClick = (card: Card) => {
  emit('card-click', card)

  if (!props.selectionMode || isDisabled(card.id)) return

  if (isSelected(card.id)) {
    emit(
      'update:modelValue',
      props.modelValue.filter((id) => id !== card.id),
    )
    return
  }

  if (maxReached.value) return
  emit('update:modelValue', [...props.modelValue, card.id])
}
</script>
