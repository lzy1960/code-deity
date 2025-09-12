<template>
  <div class="space-y-4">
    <h2 class="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">Challenges</h2>
    <p class="text-gray-400">Complete challenges under special rules to earn powerful, permanent rewards.</p>

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
    <div class="rounded-lg p-4 bg-gray-800/50 text-center">
      <p class="text-gray-400">更多挑战即将到来...</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/store/game';
import ChallengeItem from './ChallengeItem.vue';

const gameStore = useGameStore();
</script>