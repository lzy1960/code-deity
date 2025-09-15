<template>
  <div class="space-y-5">
    <ChallengeItem 
      title="挑战 1：原始计算"
      rule="1-4 阶生成器产量为 0。"
      goal="在此规则下，达成一次“重构”。"
      reward="所有生成器的“购买 10 个”奖励效果从 x2 永久提升至 x2.2。"
      :is-completed="gameStore.challengeCompletions.challenge1"
      :is-active="gameStore.activeChallenge === 'challenge1'"
      @start="gameStore.startChallenge('challenge1')"
      @exit="gameStore.exitChallenge"
    />

    <!-- Placeholder for future challenges -->
    <div class="rounded-lg p-6 bg-white/5 text-center border border-dashed border-white/20">
      <p class="text-gray-400">更多挑战即将到来...</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/store/game';
import ChallengeItem from './ChallengeItem.vue';

const gameStore = useGameStore();
</script>