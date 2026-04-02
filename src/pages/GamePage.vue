<template>
  <div class="container">
    <NSpace vertical :size="16">
      <GameZone title="Zone adverse" :side="game.opponentBoard" />

      <GameActionBar
        :is-my-turn="game.isMyTurn"
        :can-draw="canDraw"
        :can-attack="canAttack"
        :can-end-turn="canEndTurn"
        :live-message="game.liveMessage"
        @draw="game.drawCards"
        @attack="game.attack"
        @end-turn="game.endTurn"
      />

      <GameZone title="Votre zone" :side="game.myBoard">
        <PlayerHand
          :hand="game.myBoard.hand"
          :deck-count="game.myBoard.deckCount"
          :can-play="canPlayCard"
          @play="game.playCard"
        />
      </GameZone>
    </NSpace>

    <GameEndModal
      :show="!!game.gameResult"
      :result="game.gameResult"
      @back-to-lobby="backToLobby"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import GameActionBar from '../components/game/GameActionBar.vue'
import GameEndModal from '../components/game/GameEndModal.vue'
import GameZone from '../components/game/GameZone.vue'
import PlayerHand from '../components/game/PlayerHand.vue'
import { ROUTES } from '../router.js'
import { useGameStore } from '../stores/game.js'

const router = useRouter()
const game = useGameStore()

const canPlayCard = computed(
  () =>
    game.isMyTurn && !game.myBoard.activeCard && game.myBoard.hand.length > 0,
)

const canDraw = computed(
  () =>
    game.isMyTurn && game.myBoard.hand.length < 5 && game.myBoard.deckCount > 0,
)

const canAttack = computed(
  () =>
    game.isMyTurn &&
    !!game.myBoard.activeCard &&
    !!game.opponentBoard.activeCard,
)

const canEndTurn = computed(() => game.isMyTurn)

const backToLobby = async () => {
  game.resetGame()
  await router.push(ROUTES.HOME)
}

onMounted(() => {
  game.connectLobby()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
}
</style>
