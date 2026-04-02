<template>
  <div class="container">
    <DeckList />
  </div>
</template>

<script setup lang="ts">
import DeckList from '../components/decks/DeckList.vue'
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 20px auto;
}
</style>
