<template>
  <div class="container">
    <NSpace vertical :size="16">
      <LobbyPanel />
      <DeckList />
    </NSpace>
  </div>
</template>

<script setup lang="ts">
import DeckList from '../components/decks/DeckList.vue'
import LobbyPanel from '../components/game/LobbyPanel.vue'
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
}
</style>
