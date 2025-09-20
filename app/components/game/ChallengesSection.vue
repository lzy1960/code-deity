<template>
  <div class="space-y-5">
    <ChallengeItem 
      :title="$t('challenges.challenge1Title')"
      :rule="$t('challenges.challenge1Rule')"
      :goal="$t('challenges.challengeGoal')"
      :reward="$t('challenges.challenge1Reward')"
      :is-completed="gameStore.challengeCompletions.challenge1"
      :is-active="gameStore.activeChallenge === 'challenge1'"
      :is-any-challenge-active="gameStore.activeChallenge !== 'none'"
      @start="gameStore.startChallenge('challenge1')"
      @exit="gameStore.exitChallenge"
    />

    <ChallengeItem 
      :title="$t('challenges.challenge2Title')"
      :rule="$t('challenges.challenge2Rule')"
      :goal="$t('challenges.challengeGoal')"
      :reward="$t('challenges.challenge2Reward')"
      :is-completed="gameStore.challengeCompletions.challenge2"
      :is-active="gameStore.activeChallenge === 'challenge2'"
      :is-any-challenge-active="gameStore.activeChallenge !== 'none'"
      @start="gameStore.startChallenge('challenge2')"
      @exit="gameStore.exitChallenge"
    />

    <ChallengeItem 
      :title="$t('challenges.challenge3Title')"
      :rule="$t('challenges.challenge3Rule')"
      :goal="$t('challenges.challengeGoal')"
      :reward="$t('challenges.challenge3Reward')"
      :is-completed="gameStore.challengeCompletions.challenge3"
      :is-active="gameStore.activeChallenge === 'challenge3'"
      :is-any-challenge-active="gameStore.activeChallenge !== 'none'"
      @start="gameStore.startChallenge('challenge3')"
      @exit="gameStore.exitChallenge"
    />

    <ChallengeItem 
      :title="$t('challenges.challenge4Title')"
      :rule="$t('challenges.challenge4Rule')"
      :goal="$t('challenges.challengeGoal')"
      :reward="$t('challenges.challenge4Reward')"
      :is-completed="gameStore.challengeCompletions.challenge4"
      :is-active="gameStore.activeChallenge === 'challenge4'"
      :is-any-challenge-active="gameStore.activeChallenge !== 'none'"
      @start="gameStore.startChallenge('challenge4')"
      @exit="gameStore.exitChallenge"
    />

    <!-- Placeholder for future challenges -->
    <div class="rounded-lg p-6 bg-white/5 text-center border border-dashed border-white/20">
      <p class="text-gray-400">{{ $t('common.moreChallengesComingSoon') }}</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '~/store/game';
import ChallengeItem from './ChallengeItem.vue';

const gameStore = useGameStore();
</script>
