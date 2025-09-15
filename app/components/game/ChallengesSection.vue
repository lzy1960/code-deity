<template>
  <div class="space-y-5">
    <ChallengeItem 
      title="挑战 1：终极考验"
      rule="1-7 阶生成器无法享受“购买10个”的指数加成。"
      goal="在此规则下，达成一次“重构”。"
      reward="所有生成器的“购买 10 个”奖励效果从 x2 永久提升至 x2.2。"
      :is-completed="gameStore.challengeCompletions.challenge1"
      :is-active="gameStore.activeChallenge === 'challenge1'"
      :is-any-challenge-active="gameStore.activeChallenge !== 'none'"
      @start="gameStore.startChallenge('challenge1')"
      @exit="gameStore.exitChallenge"
    />

    <ChallengeItem 
      title="挑战 2：白手起家"
      rule="所有来自“重构”的加成（代码优雅度、全局乘数）全部失效。"
      goal="在此规则下，达成一次“重构”。"
      reward="“重构点 (RP)”的获取量永久提升 50%。"
      :is-completed="gameStore.challengeCompletions.challenge2"
      :is-active="gameStore.activeChallenge === 'challenge2'"
      :is-any-challenge-active="gameStore.activeChallenge !== 'none'"
      @start="gameStore.startChallenge('challenge2')"
      @exit="gameStore.exitChallenge"
    />

    <ChallengeItem 
      title="挑战 3：线性世纪"
      rule="所有生成器都无法享受“购买10个”的指数加成。"
      goal="在此规则下，达成一次“重构”。"
      reward="“购买10个”奖励的第一档上限从100个永久提升至120个。"
      :is-completed="gameStore.challengeCompletions.challenge3"
      :is-active="gameStore.activeChallenge === 'challenge3'"
      :is-any-challenge-active="gameStore.activeChallenge !== 'none'"
      @start="gameStore.startChallenge('challenge3')"
      @exit="gameStore.exitChallenge"
    />

    <ChallengeItem 
      title="挑战 4：逆水行舟"
      rule="所有生成器的成本增长率 costMultiplier 小幅提升 0.02。"
      goal="在此规则下，达成一次“重构”。"
      reward="永久降低所有生成器的基础成本 5%。"
      :is-completed="gameStore.challengeCompletions.challenge4"
      :is-active="gameStore.activeChallenge === 'challenge4'"
      :is-any-challenge-active="gameStore.activeChallenge !== 'none'"
      @start="gameStore.startChallenge('challenge4')"
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