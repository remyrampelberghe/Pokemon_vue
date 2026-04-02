<template>
  <NModal :show="show" :mask-closable="false" :closable="false">
    <NCard style="width: 420px" :title="title" size="small" :bordered="false">
      <NSpace vertical :size="16">
        <NText>{{ description }}</NText>
        <NSpace justify="end">
          <NButton type="primary" @click="$emit('back-to-lobby')">
            Retour au lobby
          </NButton>
        </NSpace>
      </NSpace>
    </NCard>
  </NModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  show: boolean
  result: 'win' | 'lose' | null
}>()

defineEmits<(e: 'back-to-lobby') => void>()

const title = computed(() => (props.result === 'win' ? 'Victoire' : 'Défaite'))
const description = computed(() =>
  props.result === 'win'
    ? 'Bravo, vous avez remporté la partie.'
    : 'La partie est terminée. Réessayez depuis le lobby.',
)
</script>
