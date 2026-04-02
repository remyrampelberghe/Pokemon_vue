<template>
  <NCard
    :class="[
      'pokemon-card',
      `pokemon-card--${size}`,
      {
        'is-selected': selected,
        'is-disabled': disabled,
        'is-clickable': clickable,
      },
    ]"
    size="small"
    :hoverable="!disabled"
    @click="onClick"
  >
    <div class="pokemon-card__header">
      <NTag :bordered="false" size="small">#{{ card.pokedexNumber }}</NTag>
      <NTag
        :bordered="false"
        size="small"
        :color="{ color: typeColor, textColor: '#fff' }"
      >
        {{ card.type }}
      </NTag>
    </div>

    <img
      :src="card.imgUrl"
      :alt="card.name"
      class="pokemon-card__image"
      loading="lazy"
    />

    <h3 class="pokemon-card__name">{{ card.name }}</h3>

    <div class="pokemon-card__stats">
      <NTag size="small" :bordered="false">HP: {{ card.hp }}</NTag>
      <NTag size="small" :bordered="false">ATK: {{ card.attack }}</NTag>
    </div>

    <div v-if="showHpBar" class="pokemon-card__hp">
      <NProgress
        type="line"
        :percentage="hpPercentage"
        :color="hpBarColor"
        :height="12"
        :indicator-placement="'inside'"
      />
      <NText depth="3" style="font-size: 12px"
        >{{ currentHp }} / {{ card.hp }} HP</NText
      >
    </div>
  </NCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useColors } from '../../composables/useColors.js'
import type { Card } from '../../types/index.js'

const props = withDefaults(
  defineProps<{
    card: Card
    size?: 'sm' | 'md'
    selected?: boolean
    disabled?: boolean
    selectable?: boolean
    currentHp?: number
  }>(),
  {
    size: 'md',
    selected: false,
    disabled: false,
    selectable: false,
    currentHp: undefined,
  },
)

const emit = defineEmits<(e: 'click', card: Card) => void>()

const { getTypeColor, hpColor } = useColors()

const clickable = computed(() => props.selectable && !props.disabled)
const typeColor = computed(() => getTypeColor(props.card.type))

const showHpBar = computed(() => typeof props.currentHp === 'number')
const hpPercentage = computed(() => {
  if (typeof props.currentHp !== 'number' || props.card.hp <= 0) return 0
  const raw = Math.round((props.currentHp / props.card.hp) * 100)
  return Math.max(0, Math.min(raw, 100))
})
const hpBarColor = computed(() => hpColor(hpPercentage.value))

const onClick = () => {
  if (!clickable.value) return
  emit('click', props.card)
}
</script>

<style scoped>
.pokemon-card {
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
}

.pokemon-card.is-clickable {
  cursor: pointer;
}

.pokemon-card.is-clickable:hover {
  transform: translateY(-2px);
}

.pokemon-card.is-selected {
  box-shadow: 0 0 0 2px #18a058 inset;
}

.pokemon-card.is-disabled {
  opacity: 0.45;
  filter: grayscale(0.2);
}

.pokemon-card__header,
.pokemon-card__stats {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.pokemon-card__image {
  width: 100%;
  object-fit: contain;
  margin: 8px 0;
}

.pokemon-card--sm .pokemon-card__image {
  height: 90px;
}

.pokemon-card--md .pokemon-card__image {
  height: 140px;
}

.pokemon-card__name {
  margin: 0 0 8px;
  text-align: center;
  font-size: 16px;
}

.pokemon-card--sm .pokemon-card__name {
  font-size: 14px;
}

.pokemon-card__hp {
  margin-top: 8px;
}
</style>
