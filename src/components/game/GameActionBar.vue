<template>
  <NCard size="small">
    <NSpace vertical :size="12">
      <NTag :type="isMyTurn ? 'success' : 'warning'" :bordered="false">
        {{ isMyTurn ? 'Votre tour' : 'Tour adverse' }}
      </NTag>

      <NSpace>
        <NButton :disabled="!canDraw" @click="$emit('draw')">Piocher</NButton>
        <NButton :disabled="!canAttack" @click="$emit('attack')"
          >Attaquer</NButton
        >
        <NButton :disabled="!canEndTurn" @click="$emit('end-turn')"
          >Fin de tour</NButton
        >
      </NSpace>

      <NText depth="3">{{ liveMessage || "En attente d'événement..." }}</NText>
    </NSpace>
  </NCard>
</template>

<script setup lang="ts">
defineProps<{
  isMyTurn: boolean
  canDraw: boolean
  canAttack: boolean
  canEndTurn: boolean
  liveMessage: string
}>()

defineEmits<(e: 'draw' | 'attack' | 'end-turn') => void>()
</script>
