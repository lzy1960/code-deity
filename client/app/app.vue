<script setup lang="ts">
import { onMounted } from 'vue'
import { useGameStore } from '~/store/game'

const gameStore = useGameStore()

onMounted(() => {
  gameStore.startGameLoop()
})
</script>

<template>
  <NuxtPage />
</template>
